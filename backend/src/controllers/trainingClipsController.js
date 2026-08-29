import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function createClip(req, res) {
  try {
    const { trainingId, title, description, startTime, endTime, tags } = req.body;

    if (!trainingId || startTime === undefined || endTime === undefined) {
      return res.status(400).json({ success: false, error: 'Missing required fields' });
    }

    const clip = await prisma.trainingVideoClip.create({
      data: {
        trainingId,
        title: title || 'Untitled Clip',
        description,
        startTime: parseInt(startTime),
        endTime: parseInt(endTime),
        tags: tags ? JSON.stringify(tags) : null,
      },
    });

    res.status(201).json({ success: true, data: clip });
  } catch (error) {
    console.error('Error creating clip:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}

export async function getClips(req, res) {
  try {
    const { trainingId } = req.params;

    const clips = await prisma.trainingVideoClip.findMany({
      where: { trainingId },
      orderBy: { startTime: 'asc' },
    });

    res.json({
      success: true,
      data: clips.map(clip => ({
        ...clip,
        tags: clip.tags ? JSON.parse(clip.tags) : [],
      })),
    });
  } catch (error) {
    console.error('Error fetching clips:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}

export async function updateClip(req, res) {
  try {
    const { id } = req.params;
    const { title, description, startTime, endTime, tags } = req.body;

    const updateData = {
      ...(title && { title }),
      ...(description !== undefined && { description }),
      ...(startTime !== undefined && { startTime: parseInt(startTime) }),
      ...(endTime !== undefined && { endTime: parseInt(endTime) }),
      ...(tags && { tags: JSON.stringify(tags) }),
    };

    const clip = await prisma.trainingVideoClip.update({
      where: { id },
      data: updateData,
    });

    res.json({
      success: true,
      data: {
        ...clip,
        tags: clip.tags ? JSON.parse(clip.tags) : [],
      },
    });
  } catch (error) {
    console.error('Error updating clip:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}

export async function deleteClip(req, res) {
  try {
    const { id } = req.params;

    await prisma.trainingVideoClip.delete({
      where: { id },
    });

    res.json({ success: true, message: 'Clip deleted' });
  } catch (error) {
    console.error('Error deleting clip:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}
