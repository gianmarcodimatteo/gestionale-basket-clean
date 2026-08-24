import { PrismaClient } from '@prisma/client';
import path from 'path';
import fs from 'fs';

const prisma = new PrismaClient();

export async function getScoutingReports(req, res) {
  try {
    const { opponent, search, fromDate, toDate } = req.query;
    const userId = req.user.id;

    const where = {
      ...(opponent && { opponent: { contains: opponent, mode: 'insensitive' } }),
      ...(search && { content: { contains: search, mode: 'insensitive' } }),
      ...(fromDate && { date: { gte: new Date(fromDate) } }),
      ...(toDate && { date: { lte: new Date(toDate) } }),
    };

    const reports = await prisma.scoutingReport.findMany({
      where,
      orderBy: { date: 'desc' },
      include: {
        creator: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    res.json({ success: true, data: reports });
  } catch (error) {
    console.error('Error fetching scouting reports:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}

export async function getScoutingReportById(req, res) {
  try {
    const { id } = req.params;

    const report = await prisma.scoutingReport.findUnique({
      where: { id },
      include: {
        creator: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    if (!report) {
      return res.status(404).json({ success: false, error: 'Scouting report not found' });
    }

    res.json({ success: true, data: report });
  } catch (error) {
    console.error('Error fetching scouting report:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}

export async function createScoutingReport(req, res) {
  try {
    const { opponent, matchDate, content, keyPlayers, strategy, notes, eventId } = req.body;
    const userId = req.user.id;

    if (!opponent) {
      return res.status(400).json({ success: false, error: 'Opponent name is required' });
    }

    let fileUrl = null;
    let fileType = null;
    if (req.file) {
      fileUrl = req.file.location;
      fileType = path.extname(req.file.originalname).toLowerCase().replace('.', '');
    }

    const report = await prisma.scoutingReport.create({
      data: {
        opponent,
        matchDate: matchDate ? new Date(matchDate) : null,
        content,
        fileUrl,
        fileType,
        keyPlayers: keyPlayers ? JSON.stringify(keyPlayers) : null,
        strategy,
        notes,
        eventId: eventId || null,
        creatorId: userId,
      },
      include: {
        creator: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    res.status(201).json({ success: true, data: report });
  } catch (error) {
    console.error('Error creating scouting report:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}

export async function updateScoutingReport(req, res) {
  try {
    const { id } = req.params;
    const { opponent, matchDate, content, keyPlayers, strategy, notes, eventId } = req.body;

    let updateData = {
      opponent,
      matchDate: matchDate ? new Date(matchDate) : null,
      content,
      keyPlayers: keyPlayers ? JSON.stringify(keyPlayers) : null,
      strategy,
      notes,
      eventId: eventId || null,
    };

    if (req.file) {
      updateData.fileUrl = req.file.location;
      updateData.fileType = path.extname(req.file.originalname).toLowerCase().replace('.', '');
      console.log('✓ File uploaded to Spaces:', req.file.location);
    }

    const report = await prisma.scoutingReport.update({
      where: { id },
      data: updateData,
      include: {
        creator: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    res.json({ success: true, data: report });
  } catch (error) {
    console.error('Error updating scouting report:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}

export async function deleteScoutingReport(req, res) {
  try {
    const { id } = req.params;

    const report = await prisma.scoutingReport.findUnique({ where: { id } });
    if (!report) {
      return res.status(404).json({ success: false, error: 'Scouting report not found' });
    }

    if (report.fileUrl) {
      const filePath = path.join(process.cwd(), 'uploads', report.fileUrl.replace('/uploads/', ''));
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }

    await prisma.scoutingReport.delete({ where: { id } });

    res.json({ success: true, message: 'Scouting report deleted' });
  } catch (error) {
    console.error('Error deleting scouting report:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}

export async function deleteScoutingFile(req, res) {
  try {
    const { id } = req.params;

    const report = await prisma.scoutingReport.findUnique({ where: { id } });
    if (!report) {
      return res.status(404).json({ success: false, error: 'Scouting report not found' });
    }

    if (report.fileUrl) {
      const filePath = path.join(process.cwd(), 'uploads', report.fileUrl.replace('/uploads/', ''));
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

      // Update report to remove file info, but keep the report
      await prisma.scoutingReport.update({
        where: { id },
        data: { fileUrl: null, fileType: null }
      });
    }

    res.json({ success: true, message: 'File deleted' });
  } catch (error) {
    console.error('Error deleting scouting file:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}

export async function createScoutingNote(req, res) {
  try {
    const { reportId, note } = req.body;
    const userId = req.user.id;

    if (!note) {
      return res.status(400).json({ success: false, error: 'Note content is required' });
    }

    const scoutingNote = await prisma.scoutingNote.create({
      data: {
        reportId: reportId || null,
        note,
        creatorId: userId,
      },
      include: {
        creator: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    res.status(201).json({ success: true, data: scoutingNote });
  } catch (error) {
    console.error('Error creating scouting note:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}

export async function getScoutingNotes(req, res) {
  try {
    const { reportId } = req.query;

    const where = reportId ? { reportId } : {};

    const notes = await prisma.scoutingNote.findMany({
      where,
      orderBy: { date: 'desc' },
      include: {
        creator: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    res.json({ success: true, data: notes });
  } catch (error) {
    console.error('Error fetching scouting notes:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}

export async function cleanupOrphanReports(req, res) {
  try {
    const orphanReports = await prisma.scoutingReport.findMany({
      where: {
        OR: [
          { eventId: null },
          { eventId: { not: null } }
        ]
      },
      include: { event: true }
    });

    let deletedCount = 0;
    for (const report of orphanReports) {
      // Se eventId è null o l'evento associato non esiste più, elimina il report
      if (!report.eventId || !report.event) {
        await prisma.scoutingReport.delete({ where: { id: report.id } });
        deletedCount++;
      }
    }

    res.json({ success: true, message: `Deleted ${deletedCount} orphan reports`, deletedCount });
  } catch (error) {
    console.error('Error cleaning up orphan reports:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}

export async function deleteScoutingNote(req, res) {
  try {
    const { id } = req.params;

    const note = await prisma.scoutingNote.findUnique({ where: { id } });
    if (!note) {
      return res.status(404).json({ success: false, error: 'Scouting note not found' });
    }

    await prisma.scoutingNote.delete({ where: { id } });

    res.json({ success: true, message: 'Scouting note deleted' });
  } catch (error) {
    console.error('Error deleting scouting note:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}
