import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    if (req.method === 'GET') {
      const { start, end } = req.query;
      const events = await prisma.calendarEvent.findMany({
        where: { startTime: { gte: new Date(start) }, endTime: { lte: new Date(end) } },
        orderBy: { startTime: 'asc' }
      });
      return res.json({ success: true, data: events });
    }

    if (req.method === 'POST') {
      const { title, type, startTime, endTime, location, description, opponent } = req.body;
      if (!title || !startTime) return res.status(400).json({ error: 'Titolo e ora inizio richiesti' });
      const event = await prisma.calendarEvent.create({
        data: { title, type, startTime: new Date(startTime), endTime: new Date(endTime), location, description, opponent }
      });
      return res.status(201).json({ success: true, data: event });
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  } finally {
    await prisma.$disconnect();
  }
}
