import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function addFeedback(req, res) {
  try {
    const { trainingId, content, type } = req.body;
    const author = req.user?.name || 'Unknown';

    if (!trainingId || !content) {
      return res.status(400).json({ success: false, error: 'Missing required fields' });
    }

    const feedback = await prisma.trainingFeedback.create({
      data: {
        trainingId,
        content,
        type: type || 'note',
        author,
      },
    });

    res.status(201).json({ success: true, data: feedback });
  } catch (error) {
    console.error('Error adding feedback:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}

export async function getFeedback(req, res) {
  try {
    const { trainingId } = req.params;

    const feedback = await prisma.trainingFeedback.findMany({
      where: { trainingId },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ success: true, data: feedback });
  } catch (error) {
    console.error('Error fetching feedback:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}

export async function deleteFeedback(req, res) {
  try {
    const { id } = req.params;

    await prisma.trainingFeedback.delete({
      where: { id },
    });

    res.json({ success: true, message: 'Feedback deleted' });
  } catch (error) {
    console.error('Error deleting feedback:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}
