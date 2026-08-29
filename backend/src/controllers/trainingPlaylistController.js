import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function createPlaylist(req, res) {
  try {
    const { name, description, theme } = req.body;
    const creatorId = req.user?.id;

    if (!name || !creatorId) {
      return res.status(400).json({ success: false, error: 'Missing required fields' });
    }

    const playlist = await prisma.trainingPlaylist.create({
      data: {
        name,
        description,
        theme: theme || 'General',
        creatorId,
      },
      include: {
        items: {
          include: { training: true },
        },
        creator: { select: { name: true } },
      },
    });

    res.status(201).json({ success: true, data: playlist });
  } catch (error) {
    console.error('Error creating playlist:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}

export async function getPlaylists(req, res) {
  try {
    const { creatorId, theme } = req.query;

    const where = {
      ...(creatorId && { creatorId }),
      ...(theme && { theme }),
    };

    const playlists = await prisma.trainingPlaylist.findMany({
      where,
      include: {
        items: {
          include: { training: true },
          orderBy: { order: 'asc' },
        },
        creator: { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ success: true, data: playlists });
  } catch (error) {
    console.error('Error fetching playlists:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}

export async function getPlaylist(req, res) {
  try {
    const { id } = req.params;

    const playlist = await prisma.trainingPlaylist.findUnique({
      where: { id },
      include: {
        items: {
          include: { training: true },
          orderBy: { order: 'asc' },
        },
        creator: { select: { name: true } },
      },
    });

    if (!playlist) {
      return res.status(404).json({ success: false, error: 'Playlist not found' });
    }

    res.json({ success: true, data: playlist });
  } catch (error) {
    console.error('Error fetching playlist:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}

export async function updatePlaylist(req, res) {
  try {
    const { id } = req.params;
    const { name, description, theme } = req.body;

    const updateData = {
      ...(name && { name }),
      ...(description !== undefined && { description }),
      ...(theme && { theme }),
    };

    const playlist = await prisma.trainingPlaylist.update({
      where: { id },
      data: updateData,
      include: {
        items: {
          include: { training: true },
        },
        creator: { select: { name: true } },
      },
    });

    res.json({ success: true, data: playlist });
  } catch (error) {
    console.error('Error updating playlist:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}

export async function deletePlaylist(req, res) {
  try {
    const { id } = req.params;

    await prisma.trainingPlaylist.delete({
      where: { id },
    });

    res.json({ success: true, message: 'Playlist deleted' });
  } catch (error) {
    console.error('Error deleting playlist:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}

export async function addItemToPlaylist(req, res) {
  try {
    const { playlistId } = req.params;
    const { trainingId, order } = req.body;

    if (!trainingId) {
      return res.status(400).json({ success: false, error: 'Missing trainingId' });
    }

    const item = await prisma.trainingPlaylistItem.create({
      data: {
        playlistId,
        trainingId,
        order: order || 0,
      },
      include: { training: true, playlist: true },
    });

    res.status(201).json({ success: true, data: item });
  } catch (error) {
    console.error('Error adding item to playlist:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}

export async function removeItemFromPlaylist(req, res) {
  try {
    const { id } = req.params;

    await prisma.trainingPlaylistItem.delete({
      where: { id },
    });

    res.json({ success: true, message: 'Item removed from playlist' });
  } catch (error) {
    console.error('Error removing item from playlist:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}

export async function reorderPlaylistItems(req, res) {
  try {
    const { playlistId } = req.params;
    const { items } = req.body; // array of { id, order }

    if (!Array.isArray(items)) {
      return res.status(400).json({ success: false, error: 'Invalid items format' });
    }

    await Promise.all(
      items.map(item =>
        prisma.trainingPlaylistItem.update({
          where: { id: item.id },
          data: { order: item.order },
        })
      )
    );

    const playlist = await prisma.trainingPlaylist.findUnique({
      where: { id: playlistId },
      include: {
        items: {
          include: { training: true },
          orderBy: { order: 'asc' },
        },
      },
    });

    res.json({ success: true, data: playlist });
  } catch (error) {
    console.error('Error reordering playlist items:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}
