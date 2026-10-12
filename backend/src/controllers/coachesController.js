import path from 'path';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const creatorSelect = { select: { id: true, name: true, email: true } };

export async function getCoachesReports(req, res) {
  try {
    const { opponent, search, fromDate, toDate } = req.query;

    const where = {
      ...(opponent && { opponent: { contains: opponent, mode: 'insensitive' } }),
      ...(search && { content: { contains: search, mode: 'insensitive' } }),
      ...(fromDate && { date: { gte: new Date(fromDate) } }),
      ...(toDate && { date: { lte: new Date(toDate) } }),
    };

    const reports = await prisma.coachesReport.findMany({
      where,
      orderBy: { date: 'desc' },
      include: {
        creator: creatorSelect,
        files: { orderBy: { createdAt: 'desc' } },
      },
    });

    res.json({ success: true, data: reports });
  } catch (error) {
    console.error('Error fetching coaches reports:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}

export async function getCoachesReportById(req, res) {
  try {
    const { id } = req.params;

    const report = await prisma.coachesReport.findUnique({
      where: { id },
      include: {
        creator: creatorSelect,
        files: { orderBy: { createdAt: 'desc' } },
      },
    });

    if (!report) {
      return res.status(404).json({ success: false, error: 'Coaches report not found' });
    }

    res.json({ success: true, data: report });
  } catch (error) {
    console.error('Error fetching coaches report:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}

export async function createCoachesReport(req, res) {
  try {
    const { opponent, opponentLogo, matchDate, content, notes, eventId } = req.body;

    if (!opponent) {
      return res.status(400).json({ success: false, error: 'Opponent name is required' });
    }

    const report = await prisma.coachesReport.create({
      data: {
        opponent,
        opponentLogo: opponentLogo || null,
        matchDate: matchDate ? new Date(matchDate) : null,
        content,
        notes,
        eventId: eventId || null,
        creatorId: req.user.id,
      },
      include: {
        creator: creatorSelect,
        files: true,
      },
    });

    res.status(201).json({ success: true, data: report });
  } catch (error) {
    console.error('Error creating coaches report:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}

export async function updateCoachesReport(req, res) {
  try {
    const { id } = req.params;
    const { opponent, opponentLogo, matchDate, content, notes, eventId, fileTitle } = req.body;

    if (req.file) {
      const fileType = path.extname(req.file.originalname).toLowerCase().replace('.', '');
      await prisma.coachesFile.create({
        data: {
          fileUrl: req.file.location,
          fileType,
          fileTitle: fileTitle || null,
          reportId: id,
        },
      });
    }

    const report = await prisma.coachesReport.update({
      where: { id },
      data: {
        opponent,
        opponentLogo,
        matchDate: matchDate ? new Date(matchDate) : undefined,
        content,
        notes,
        eventId: eventId || undefined,
      },
      include: {
        creator: creatorSelect,
        files: { orderBy: { createdAt: 'desc' } },
      },
    });

    res.json({ success: true, data: report });
  } catch (error) {
    console.error('Error updating coaches report:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}

export async function deleteCoachesReport(req, res) {
  try {
    const { id } = req.params;

    const report = await prisma.coachesReport.findUnique({ where: { id } });
    if (!report) {
      return res.status(404).json({ success: false, error: 'Coaches report not found' });
    }

    await prisma.coachesReport.delete({ where: { id } });

    res.json({ success: true, message: 'Coaches report deleted' });
  } catch (error) {
    console.error('Error deleting coaches report:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}

export async function deleteCoachesFile(req, res) {
  try {
    const { id, fileId } = req.params;

    if (fileId) {
      const file = await prisma.coachesFile.findUnique({ where: { id: fileId } });
      if (!file) {
        return res.status(404).json({ success: false, error: 'File not found' });
      }
      await prisma.coachesFile.delete({ where: { id: fileId } });
      return res.json({ success: true, message: 'File deleted' });
    }

    const report = await prisma.coachesReport.findUnique({ where: { id } });
    if (!report) {
      return res.status(404).json({ success: false, error: 'Coaches report not found' });
    }
    await prisma.coachesFile.deleteMany({ where: { reportId: id } });
    res.json({ success: true, message: 'All files deleted' });
  } catch (error) {
    console.error('Error deleting coaches file:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}

export async function cleanupOrphanCoachesReports(req, res) {
  try {
    const reports = await prisma.coachesReport.findMany({ include: { event: true } });

    let deletedCount = 0;
    for (const report of reports) {
      if (!report.eventId || !report.event) {
        await prisma.coachesReport.delete({ where: { id: report.id } });
        deletedCount++;
      }
    }

    res.json({ success: true, message: `Deleted ${deletedCount} orphan reports`, deletedCount });
  } catch (error) {
    console.error('Error cleaning up orphan coaches reports:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}
