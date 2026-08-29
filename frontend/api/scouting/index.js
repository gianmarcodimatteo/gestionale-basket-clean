import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    if (req.method === 'GET') {
      const reports = await prisma.scoutingReport.findMany({ orderBy: { matchDate: 'desc' } });
      return res.json({ success: true, data: reports });
    }

    if (req.method === 'POST') {
      const { opponent, matchDate, notes } = req.body;
      if (!opponent) return res.status(400).json({ error: 'Avversario richiesto' });
      const report = await prisma.scoutingReport.create({
        data: { opponent, matchDate: new Date(matchDate), notes }
      });
      return res.status(201).json({ success: true, data: report });
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  } finally {
    await prisma.$disconnect();
  }
}
