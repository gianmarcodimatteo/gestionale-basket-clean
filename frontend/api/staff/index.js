import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    if (req.method === 'GET') {
      const { page = 1, limit = 10 } = req.query;
      const skip = (page - 1) * limit;
      const staff = await prisma.staff.findMany({ skip, take: parseInt(limit), orderBy: { name: 'asc' } });
      const total = await prisma.staff.count();
      return res.json({ success: true, data: staff, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
    }

    if (req.method === 'POST') {
      const { name, email, phone, position, bio } = req.body;
      if (!name || !position) return res.status(400).json({ error: 'Nome e posizione richiesti' });
      const newStaff = await prisma.staff.create({ data: { name, email, phone, position, bio } });
      return res.status(201).json({ success: true, data: newStaff });
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  } finally {
    await prisma.$disconnect();
  }
}
