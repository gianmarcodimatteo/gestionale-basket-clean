import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function upsertFolder(model, event, creatorId) {
  const data = {
    opponent: event.opponent || event.title,
    opponentLogo: event.opponentLogo || null,
    matchDate: event.startTime,
  };

  const existing = await model.findFirst({ where: { eventId: event.id } });
  if (existing) {
    await model.update({ where: { id: existing.id }, data });
  } else {
    await model.create({ data: { ...data, eventId: event.id, creatorId } });
  }
}

export async function syncGameFolders(event, creatorId) {
  if (event.type !== 'PARTITA' || !creatorId) return;
  await upsertFolder(prisma.scoutingReport, event, creatorId);
  await upsertFolder(prisma.coachesReport, event, creatorId);
}
