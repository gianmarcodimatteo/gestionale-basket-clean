import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    if (req.method === 'GET') {
      const { page = 1, limit = 20 } = req.query;
      const skip = (page - 1) * limit;
      const players = await prisma.player.findMany({ skip, take: parseInt(limit), orderBy: { number: 'asc' } });
      const total = await prisma.player.count();
      return res.json({ success: true, data: players, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
    }

    if (req.method === 'POST') {
      const { number, name, height, weight, position } = req.body;
      if (!number || !name) return res.status(400).json({ error: 'Numero e nome richiesti' });
      const player = await prisma.player.create({ data: { number, name, height, weight, position } });
      return res.status(201).json({ success: true, data: player });
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  } finally {
    await prisma.$disconnect();
  }
}
