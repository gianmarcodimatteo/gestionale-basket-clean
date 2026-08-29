import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function getShootingStats(req, res) {
  try {
    const { rosterId } = req.query;

    if (!rosterId) {
      return res.status(400).json({ success: false, error: 'Missing rosterId' });
    }

    const stats = await prisma.practicesShootingStats.findMany({
      where: { rosterId },
      orderBy: { date: 'desc' },
    });

    res.json({ success: true, data: stats });
  } catch (error) {
    console.error('Error fetching shooting stats:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}

export async function createShootingStats(req, res) {
  try {
    const { rosterId, date, shotType, lhCorM, lhCorA, lhWgM, lhWgA, topM, topA, rtWgM, rtWgA, rtCorM, rtCorA, notes } = req.body;

    if (!rosterId || !date) {
      return res.status(400).json({ success: false, error: 'Missing required fields' });
    }

    const stat = await prisma.practicesShootingStats.create({
      data: {
        rosterId,
        date: new Date(date),
        shotType: shotType || '2PTS',
        lhCorM: lhCorM || 0,
        lhCorA: lhCorA || 0,
        lhWgM: lhWgM || 0,
        lhWgA: lhWgA || 0,
        topM: topM || 0,
        topA: topA || 0,
        rtWgM: rtWgM || 0,
        rtWgA: rtWgA || 0,
        rtCorM: rtCorM || 0,
        rtCorA: rtCorA || 0,
        notes,
      },
    });

    res.status(201).json({ success: true, data: stat });
  } catch (error) {
    console.error('Error creating shooting stats:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}

export async function updateShootingStats(req, res) {
  try {
    const { id } = req.params;
    const { date, lhCorM, lhCorA, lhWgM, lhWgA, topM, topA, rtWgM, rtWgA, rtCorM, rtCorA, notes } = req.body;

    const stat = await prisma.practicesShootingStats.update({
      where: { id },
      data: {
        date: date ? new Date(date) : undefined,
        lhCorM,
        lhCorA,
        lhWgM,
        lhWgA,
        topM,
        topA,
        rtWgM,
        rtWgA,
        rtCorM,
        rtCorA,
        notes,
      },
    });

    res.json({ success: true, data: stat });
  } catch (error) {
    console.error('Error updating shooting stats:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}

export async function deleteShootingStats(req, res) {
  try {
    const { id } = req.params;

    await prisma.practicesShootingStats.delete({ where: { id } });

    res.json({ success: true, message: 'Shooting stat deleted' });
  } catch (error) {
    console.error('Error deleting shooting stats:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}
