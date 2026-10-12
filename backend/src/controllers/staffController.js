import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

// ============= GET OPERATIONS =============

// Ottenere lista staff con filtri e paginazione
export const getAllStaff = async (req, res) => {
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
          { email: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    const staff = await prisma.staff.findMany({
      where,
      skip,
      take,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        position: true,
        photo: true,
        joinDate: true,
        active: true,
      },
      orderBy: { name: 'asc' },
    });

    const total = await prisma.staff.count({ where });

    res.json({
      success: true,
      data: staff,
      pagination: {
        page: parseInt(page),
        limit: take,
        total,
        pages: Math.ceil(total / take),
      },
    });
  } catch (error) {
    console.error('Error in getAllStaff:', error);
    res.status(500).json({ error: 'Errore nel recupero dello staff' });
  }
};

// Ottenere singolo staff member
export const getStaffById = async (req, res) => {
  try {
    const { id } = req.params;

    const staff = await prisma.staff.findUnique({
      where: { id },
      include: {
        staffNotes: {
          orderBy: { date: 'desc' },
          take: 10,
        },
        user: {
          select: {
            id: true,
            email: true,
            role: true,
          },
        },
      },
    });

    if (!staff) {
      return res.status(404).json({ error: 'Staff member non trovato' });
    }

    res.json({ success: true, data: staff });
  } catch (error) {
    console.error('Error in getStaffById:', error);
    res.status(500).json({ error: 'Errore nel recupero dello staff' });
  }
};

// ============= CREATE OPERATIONS =============

// Creare nuovo staff member
export const createStaff = async (req, res) => {
  try {
    const { name, email, phone, position, bio } = req.body;

    // Validazione base
    if (!name || !position) {
      return res.status(400).json({ error: 'Nome e posizione sono obbligatori' });
    }

    // Controlla se email esiste già
    const existingStaff = await prisma.staff.findUnique({
      where: { email },
    });

    if (existingStaff) {
      return res.status(400).json({ error: 'Email già esistente' });
    }

    const photoUrl = req.file ? req.file.location : null;

    const newStaff = await prisma.staff.create({
      data: {
        name,
        email,
        phone: phone || null,
        position,
        bio: bio || null,
        photo: photoUrl,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Staff member creato con successo',
      data: newStaff,
    });
  } catch (error) {
    console.error('Error in createStaff:', error);
    res.status(500).json({ error: 'Errore nella creazione dello staff' });
  }
};

// ============= UPDATE OPERATIONS =============

// Modificare staff member
export const updateStaff = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, position, bio, active } = req.body;

    // Verifica che lo staff esista
    const existingStaff = await prisma.staff.findUnique({
      where: { id },
    });

    if (!existingStaff) {
      return res.status(404).json({ error: 'Staff member non trovato' });
    }

    // Se email è stata modificata, controlla unicità
    if (email && email !== existingStaff.email) {
      const emailExists = await prisma.staff.findUnique({
        where: { email },
      });

      if (emailExists) {
        return res.status(400).json({ error: 'Email già esistente' });
      }
    }

    const photoUrl = req.file ? req.file.location : undefined;

    const updatedStaff = await prisma.staff.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(email && { email }),
        ...(phone && { phone }),
        ...(position && { position }),
        ...(bio && { bio }),
        ...(photoUrl && { photo: photoUrl }),
        ...(active !== undefined && { active }),
      },
    });

    res.json({
      success: true,
      message: 'Staff member aggiornato con successo',
      data: updatedStaff,
    });
  } catch (error) {
    console.error('Error in updateStaff:', error);
    res.status(500).json({ error: 'Errore nell\'aggiornamento dello staff' });
  }
};

// ============= DELETE OPERATIONS =============

// Eliminare staff member (soft delete - mark as inactive)
export const deleteStaff = async (req, res) => {
  try {
    const { id } = req.params;

    const existingStaff = await prisma.staff.findUnique({
      where: { id },
    });

    if (!existingStaff) {
      return res.status(404).json({ error: 'Staff member non trovato' });
    }

    await prisma.staff.update({
      where: { id },
      data: { active: false },
    });

    res.json({
      success: true,
      message: 'Staff member eliminato con successo',
    });
  } catch (error) {
    console.error('Error in deleteStaff:', error);
    res.status(500).json({ error: 'Errore nell\'eliminazione dello staff' });
  }
};

// ============= NOTES OPERATIONS =============

// Aggiungere nota a staff member
export const addStaffNote = async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({ error: 'Il contenuto della nota è obbligatorio' });
    }

    const existingStaff = await prisma.staff.findUnique({
      where: { id },
    });

    if (!existingStaff) {
      return res.status(404).json({ error: 'Staff member non trovato' });
    }

    const note = await prisma.staffNote.create({
      data: {
        content,
        staffId: id,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Nota aggiunta con successo',
      data: note,
    });
  } catch (error) {
    console.error('Error in addStaffNote:', error);
    res.status(500).json({ error: 'Errore nell\'aggiunta della nota' });
  }
};

// ============= UTILITY =============

// Statistiche staff
export const getStaffStats = async (req, res) => {
  try {
    const totalStaff = await prisma.staff.count({ where: { active: true } });

    const positionCounts = await prisma.staff.groupBy({
      by: ['position'],
      where: { active: true },
      _count: {
        id: true,
      },
    });

    res.json({
      success: true,
      data: {
        totalStaff,
        byPosition: positionCounts.map(p => ({
          position: p.position,
          count: p._count.id,
        })),
      },
    });
  } catch (error) {
    console.error('Error in getStaffStats:', error);
    res.status(500).json({ error: 'Errore nel recupero statistiche' });
  }
};
