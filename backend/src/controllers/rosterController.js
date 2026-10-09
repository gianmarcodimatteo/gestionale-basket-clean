import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ============= GET OPERATIONS =============

// Ottenere lista giocatrici con filtri e paginazione
export const getAllRoster = async (req, res) => {
  try {
    const { page = 1, limit = 10, position, search } = req.query;

    const skip = (page - 1) * limit;
    const take = parseInt(limit);

    const where = {
      active: true,
      ...(position && { position }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { nationality: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    const roster = await prisma.roster.findMany({
      where,
      skip,
      take,
      include: {
        stats: true,
        injuries: {
          where: { resolved: false },
        },
      },
      orderBy: { number: 'asc' },
    });

    const total = await prisma.roster.count({ where });

    res.json({
      success: true,
      data: roster,
      pagination: {
        page: parseInt(page),
        limit: take,
        total,
        pages: Math.ceil(total / take),
      },
    });
  } catch (error) {
    console.error('Error in getAllRoster:', error);
    res.status(500).json({ error: 'Errore nel recupero giocatrici' });
  }
};

// Ottenere singola giocatrice
export const getRosterById = async (req, res) => {
  try {
    const { id } = req.params;

    const player = await prisma.roster.findUnique({
      where: { id },
      include: {
        stats: true,
        injuries: {
          orderBy: { date: 'desc' },
        },
      },
    });

    if (!player) {
      return res.status(404).json({ error: 'Giocatrice non trovata' });
    }

    res.json({ success: true, data: player });
  } catch (error) {
    console.error('Error in getRosterById:', error);
    res.status(500).json({ error: 'Errore nel recupero giocatrice' });
  }
};

// ============= CREATE OPERATIONS =============

// Creare nuova giocatrice
export const createRoster = async (req, res) => {
  try {
    const { name, number, position, height, weight, dateOfBirth, nationality, instatId, status, notes } = req.body;

    if (!name || !number || !position) {
      return res.status(400).json({ error: 'Nome, numero e posizione sono obbligatori' });
    }

    // Controlla se numero è unico
    const existingNumber = await prisma.roster.findFirst({
      where: { number: parseInt(number), active: true },
    });

    if (existingNumber) {
      return res.status(400).json({ error: 'Numero di maglia già in uso' });
    }

    const photoUrl = req.file ? `/uploads/roster/${req.file.filename}` : null;

    const newPlayer = await prisma.roster.create({
      data: {
        name,
        number: parseInt(number),
        position,
        height: height ? parseFloat(height) : null,
        weight: weight ? parseFloat(weight) : null,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
        nationality: nationality || null,
        photo: photoUrl,
        instatId: instatId || null,
        status: ['AVAILABLE', 'LIMITED', 'INJURED'].includes(status) ? status : 'AVAILABLE',
        notes: notes || null,
      },
      include: { stats: true },
    });

    // Crea stats vuote per la giocatrice
    await prisma.playerStats.create({
      data: {
        rosterId: newPlayer.id,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Giocatrice creata con successo',
      data: newPlayer,
    });
  } catch (error) {
    console.error('Error in createRoster:', error);
    res.status(500).json({ error: 'Errore nella creazione della giocatrice' });
  }
};

// ============= UPDATE OPERATIONS =============

// Modificare giocatrice
export const updateRoster = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, number, position, height, weight, dateOfBirth, nationality, instatId, active, status, notes } = req.body;

    const existingPlayer = await prisma.roster.findUnique({
      where: { id },
    });

    if (!existingPlayer) {
      return res.status(404).json({ error: 'Giocatrice non trovata' });
    }

    // Se numero è stato modificato, controlla unicità
    if (number && number !== existingPlayer.number) {
      const numberExists = await prisma.roster.findFirst({
        where: {
          number: parseInt(number),
          active: true,
          NOT: { id },
        },
      });

      if (numberExists) {
        return res.status(400).json({ error: 'Numero di maglia già in uso' });
      }
    }

    const photoUrl = req.file ? `/uploads/roster/${req.file.filename}` : undefined;

    const updatedPlayer = await prisma.roster.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(number && { number: parseInt(number) }),
        ...(position && { position }),
        ...(height && { height: parseFloat(height) }),
        ...(weight && { weight: parseFloat(weight) }),
        ...(dateOfBirth && { dateOfBirth: new Date(dateOfBirth) }),
        ...(nationality && { nationality }),
        ...(instatId && { instatId }),
        ...(photoUrl && { photo: photoUrl }),
        ...(active !== undefined && { active }),
        ...(['AVAILABLE', 'LIMITED', 'INJURED'].includes(status) && { status }),
        ...(notes !== undefined && { notes: notes || null }),
      },
      include: { stats: true, injuries: true },
    });

    res.json({
      success: true,
      message: 'Giocatrice aggiornata con successo',
      data: updatedPlayer,
    });
  } catch (error) {
    console.error('Error in updateRoster:', error);
    res.status(500).json({ error: 'Errore nell\'aggiornamento della giocatrice' });
  }
};

// ============= DELETE OPERATIONS =============

// Eliminare giocatrice (soft delete)
export const deleteRoster = async (req, res) => {
  try {
    const { id } = req.params;

    const existingPlayer = await prisma.roster.findUnique({
      where: { id },
    });

    if (!existingPlayer) {
      return res.status(404).json({ error: 'Giocatrice non trovata' });
    }

    await prisma.roster.update({
      where: { id },
      data: { active: false },
    });

    res.json({
      success: true,
      message: 'Giocatrice eliminata con successo',
    });
  } catch (error) {
    console.error('Error in deleteRoster:', error);
    res.status(500).json({ error: 'Errore nell\'eliminazione della giocatrice' });
  }
};

// ============= STATS OPERATIONS =============

// Aggiornare stats giocatrice
export const updatePlayerStats = async (req, res) => {
  try {
    const { id } = req.params;
    const statsData = req.body;

    const existingPlayer = await prisma.roster.findUnique({
      where: { id },
    });

    if (!existingPlayer) {
      return res.status(404).json({ error: 'Giocatrice non trovata' });
    }

    const parseFloat2 = (val) => val !== undefined && val !== null ? parseFloat(val) : undefined;

    const updateData = {
      min: parseFloat2(statsData.min),
      points: parseFloat2(statsData.points),
      pppp: parseFloat2(statsData.pppp),
      fgPlus: parseFloat2(statsData.fgPlus),
      fg: parseFloat2(statsData.fg),
      fgPercent: parseFloat2(statsData.fgPercent),
      threePass: parseFloat2(statsData.threePass),
      threePt: parseFloat2(statsData.threePt),
      threePtPercent: parseFloat2(statsData.threePtPercent),
      ftPlus: parseFloat2(statsData.ftPlus),
      ft: parseFloat2(statsData.ft),
      ftPercent: parseFloat2(statsData.ftPercent),
      tsPercent: parseFloat2(statsData.tsPercent),
      twoPtPlus: parseFloat2(statsData.twoPtPlus),
      twoPt: parseFloat2(statsData.twoPt),
      twoPtPercent: parseFloat2(statsData.twoPtPercent),
      reb: parseFloat2(statsData.reb),
      oreb: parseFloat2(statsData.oreb),
      dreb: parseFloat2(statsData.dreb),
      ast: parseFloat2(statsData.ast),
      stl: parseFloat2(statsData.stl),
      tov: parseFloat2(statsData.tov),
      blk: parseFloat2(statsData.blk),
      f: parseFloat2(statsData.f),
      fd: parseFloat2(statsData.fd),
      plusMinus: parseFloat2(statsData.plusMinus),
      astTo: parseFloat2(statsData.astTo),
      orat: parseFloat2(statsData.orat),
      drat: parseFloat2(statsData.drat),
    };

    Object.keys(updateData).forEach(key => updateData[key] === undefined && delete updateData[key]);

    const updatedStats = await prisma.playerStats.upsert({
      where: { rosterId: id },
      update: updateData,
      create: {
        rosterId: id,
        ...updateData,
      },
      include: { playTypeStats: true },
    });

    res.json({
      success: true,
      message: 'Stats aggiornate con successo',
      data: updatedStats,
    });
  } catch (error) {
    console.error('Error in updatePlayerStats:', error);
    res.status(500).json({ error: 'Errore nell\'aggiornamento delle stats' });
  }
};

// Aggiornare play type stats
export const updatePlayTypeStats = async (req, res) => {
  try {
    const { id } = req.params;
    const { playTypeStats } = req.body;

    const existingStats = await prisma.playerStats.findUnique({
      where: { rosterId: id },
    });

    if (!existingStats) {
      return res.status(404).json({ error: 'Stats giocatrice non trovate' });
    }

    for (const pt of playTypeStats) {
      await prisma.playTypeStats.upsert({
        where: {
          statsId_playType_side: {
            statsId: existingStats.id,
            playType: pt.playType,
            side: pt.side,
          },
        },
        update: {
          fgPercent: pt.fgPercent,
          possessions: pt.possessions,
          points: pt.points,
          pppp: pt.pppp,
          foulsDrawn: pt.foulsDrawn,
          turnovers: pt.turnovers,
        },
        create: {
          statsId: existingStats.id,
          playType: pt.playType,
          side: pt.side,
          fgPercent: pt.fgPercent,
          possessions: pt.possessions,
          points: pt.points,
          pppp: pt.pppp,
          foulsDrawn: pt.foulsDrawn,
          turnovers: pt.turnovers,
        },
      });
    }

    res.json({
      success: true,
      message: 'Play type stats aggiornate con successo',
    });
  } catch (error) {
    console.error('Error in updatePlayTypeStats:', error);
    res.status(500).json({ error: 'Errore nell\'aggiornamento play type stats' });
  }
};

// ============= STATS ROSTER =============

// Statistiche roster
export const getRosterStats = async (req, res) => {
  try {
    const totalPlayers = await prisma.roster.count({ where: { active: true } });

    const positionCounts = await prisma.roster.groupBy({
      by: ['position'],
      where: { active: true },
      _count: {
        id: true,
      },
    });

    res.json({
      success: true,
      data: {
        totalPlayers,
        byPosition: positionCounts.map(p => ({
          position: p.position,
          count: p._count.id,
        })),
      },
    });
  } catch (error) {
    console.error('Error in getRosterStats:', error);
    res.status(500).json({ error: 'Errore nel recupero statistiche' });
  }
};
