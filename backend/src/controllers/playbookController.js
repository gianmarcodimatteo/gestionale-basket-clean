import { PrismaClient } from '@prisma/client';
import path from 'path';
import fs from 'fs';

const prisma = new PrismaClient();

export async function getPlaybooks(req, res) {
  try {
    const { side, tags, search } = req.query;

    const where = {
      active: true,
      ...(side && { side }),
      ...(search && { name: { contains: search, mode: 'insensitive' } }),
    };

    let playbooks = await prisma.playbook.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    // Filter by tags if provided
    if (tags) {
      const tagsArray = Array.isArray(tags) ? tags : [tags];
      playbooks = playbooks.filter(p => {
        try {
          const pbTags = p.tags ? JSON.parse(p.tags) : [];
          return Array.isArray(pbTags) && tagsArray.some(tag => pbTags.includes(tag));
        } catch (e) {
          console.warn('Invalid tags JSON in playbook:', p.tags);
          return false;
        }
      });
    }

    res.json({ success: true, data: playbooks });
  } catch (error) {
    console.error('Error fetching playbooks:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}

export async function getPlaybookById(req, res) {
  try {
    const { id } = req.params;

    const playbook = await prisma.playbook.findUnique({ where: { id } });

    if (!playbook) {
      return res.status(404).json({ success: false, error: 'Playbook not found' });
    }

    res.json({ success: true, data: playbook });
  } catch (error) {
    console.error('Error fetching playbook:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}

export async function createPlaybook(req, res) {
  try {
    const { name, description, side, tags, notes } = req.body;

    if (!name || !side) {
      return res.status(400).json({ success: false, error: 'Missing required fields' });
    }

    let fileType = null;
    let fileUrl = null;

    if (req.file) {
      fileType = req.file.mimetype.startsWith('video') ? 'Video' : 'PDF';
      fileUrl = req.file.location;
    }

    const playbook = await prisma.playbook.create({
      data: {
        name,
        description,
        side,
        fileType,
        fileUrl,
        tags: tags ? JSON.stringify(tags) : null,
        notes,
      },
    });

    res.status(201).json({ success: true, data: playbook });
  } catch (error) {
    console.error('Error creating playbook:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}

export async function updatePlaybook(req, res) {
  try {
    const { id } = req.params;
    const { name, description, tags, notes } = req.body;

    let updateData = { name, description, tags: tags ? JSON.stringify(tags) : null, notes };

    if (req.file) {
      const fileType = req.file.mimetype.startsWith('video') ? 'Video' : 'PDF';
      updateData.fileType = fileType;
      updateData.fileUrl = req.file.location;
    }

    const playbook = await prisma.playbook.update({
      where: { id },
      data: updateData,
    });

    res.json({ success: true, data: playbook });
  } catch (error) {
    console.error('Error updating playbook:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}

export async function deletePlaybook(req, res) {
  try {
    const { id } = req.params;

    const playbook = await prisma.playbook.findUnique({ where: { id } });
    if (!playbook) {
      return res.status(404).json({ success: false, error: 'Playbook not found' });
    }

    if (playbook.fileUrl) {
      const filePath = path.join(process.cwd(), 'uploads', playbook.fileUrl.replace('/uploads/', ''));
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }

    await prisma.playbook.delete({ where: { id } });

    res.json({ success: true, message: 'Playbook deleted' });
  } catch (error) {
    console.error('Error deleting playbook:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}

export async function getAllTags(req, res) {
  try {
    const playbooks = await prisma.playbook.findMany({
      where: { active: true },
      select: { tags: true },
    });

    const tagsSet = new Set();
    playbooks.forEach(p => {
      if (p.tags) {
        try {
          const parsedTags = JSON.parse(p.tags);
          if (Array.isArray(parsedTags)) {
            parsedTags.forEach(tag => tagsSet.add(tag));
          }
        } catch (e) {
          console.warn('Invalid tags JSON:', p.tags);
        }
      }
    });

    res.json({ success: true, data: Array.from(tagsSet).sort() });
  } catch (error) {
    console.error('Error fetching tags:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}
