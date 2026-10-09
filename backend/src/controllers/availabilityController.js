import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const TRACKED_TYPES = ['ALLENAMENTO', 'PARTITA'];
const CHIP_COUNT = 16;

function buildPlayerCard(player, now) {
  const sessions = player.eventAvailabilities
    .filter(a => TRACKED_TYPES.includes(a.event.type) && new Date(a.event.startTime) <= now)
    .sort((a, b) => new Date(a.event.startTime) - new Date(b.event.startTime));

  const total = sessions.length;
  const available = sessions.filter(s => s.available).length;
  const practices = sessions.filter(s => s.event.type === 'ALLENAMENTO');
  const practicesAttended = practices.filter(s => s.available).length;

  let consecutive = 0;
  for (let i = sessions.length - 1; i >= 0 && sessions[i].available; i--) consecutive++;

  return {
    id: player.id,
    name: player.name,
    number: player.number,
    position: player.position,
    photo: player.photo,
    status: player.status,
    notes: player.notes,
    availability: {
      available,
      total,
      percent: total ? Math.round((available / total) * 100) : null,
    },
    practices: {
      attended: practicesAttended,
      total: practices.length,
      percent: practices.length ? Math.round((practicesAttended / practices.length) * 100) : null,
    },
    daysMissed: total - available,
    consecutive,
    chips: sessions.slice(-CHIP_COUNT).map(s => ({
      date: s.event.startTime,
      type: s.event.type,
      available: s.available,
    })),
  };
}

// GET /api/availability/players
export async function getAvailabilityPlayers(req, res) {
  try {
    const now = new Date();
    const players = await prisma.roster.findMany({
      where: { active: true },
      include: {
        eventAvailabilities: {
          include: { event: { select: { startTime: true, type: true } } },
        },
      },
      orderBy: { number: 'asc' },
    });

    res.json({
      success: true,
      data: players.map(p => buildPlayerCard(p, now)),
    });
  } catch (error) {
    console.error('Error in getAvailabilityPlayers:', error);
    res.status(500).json({ success: false, error: 'Errore nel caricamento della disponibilità' });
  }
}
