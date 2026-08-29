import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    if (req.method === 'GET') {
      const sessions = await prisma.trainingSession.findMany({ orderBy: { date: 'desc' } });
      return res.json({ success: true, data: sessions });
    }

    if (req.method === 'POST') {
      const { title, date, duration, type, description, notes } = req.body;
      if (!title || !date) return res.status(400).json({ error: 'Titolo e data richiesti' });
      const session = await prisma.trainingSession.create({
        data: { title, date: new Date(date), duration, type, description, notes }
      });
      return res.status(201).json({ success: true, data: session });
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  } finally {
    await prisma.$disconnect();
  }
}
