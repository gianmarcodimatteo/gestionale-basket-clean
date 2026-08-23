import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Genera gli eventi ricorrenti per un range di date
function generateRecurringEvents(baseEvent, recurrence, startDate, endDate) {
  if (!recurrence) return [baseEvent];

  const events = [];
  let currentDate = new Date(baseEvent.startTime);
  const baseEndDate = baseEvent.endTime ? new Date(baseEvent.endTime) : null;
  const duration = baseEndDate ? baseEndDate - new Date(baseEvent.startTime) : 0;

  const recurUntil = recurrence.endDate ? new Date(recurrence.endDate) : endDate;

  while (currentDate <= recurUntil && (!recurrence.occurrences || events.length < recurrence.occurrences)) {
    if (currentDate >= startDate && currentDate <= endDate) {
      const eventEndTime = baseEndDate ? new Date(currentDate.getTime() + duration) : null;
      events.push({
        ...baseEvent,
        startTime: new Date(currentDate),
        endTime: eventEndTime,
        id: `${baseEvent.id}_${currentDate.getTime()}`, // pseudo ID for display
      });
    }

    // Calcola la prossima occorrenza
    switch (recurrence.frequency) {
      case 'DAILY':
        currentDate.setDate(currentDate.getDate() + 1);
        break;
      case 'WEEKLY':
        currentDate.setDate(currentDate.getDate() + 7);
        break;
      case 'BIWEEKLY':
        currentDate.setDate(currentDate.getDate() + 14);
        break;
      case 'MONTHLY':
        currentDate.setMonth(currentDate.getMonth() + 1);
        break;
      case 'YEARLY':
        currentDate.setFullYear(currentDate.getFullYear() + 1);
        break;
    }
  }

  return events;
}

// GET /api/calendar/events?startDate=ISO&endDate=ISO
export async function getEvents(req, res) {
  try {
    const { startDate, endDate } = req.query;
    const start = startDate ? new Date(startDate) : new Date();
    const end = endDate ? new Date(endDate) : new Date(start.getTime() + 30 * 24 * 60 * 60 * 1000); // default 30 giorni

    const events = await prisma.calendarEvent.findMany({
      where: {
        startTime: {
          gte: start,
          lte: end,
        },
      },
      include: {
        participants: true,
        notifications: true,
        recurrence: true,
      },
      orderBy: { startTime: 'asc' },
    });

    // Espandi gli eventi ricorrenti
    const allEvents = [];
    for (const event of events) {
      if (event.isRecurring && event.recurrence) {
        const recurring = generateRecurringEvents(event, event.recurrence, start, end);
        allEvents.push(...recurring);
      } else {
        allEvents.push(event);
      }
    }

    res.json({
      success: true,
      data: allEvents,
    });
  } catch (error) {
    console.error('Errore nel caricamento degli eventi:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}

// GET /api/calendar/events/:id
export async function getEventById(req, res) {
  try {
    const { id } = req.params;

    const event = await prisma.calendarEvent.findUnique({
      where: { id },
      include: {
        participants: true,
        notifications: true,
        recurrence: true,
      },
    });

    if (!event) {
      return res.status(404).json({ success: false, error: 'Evento non trovato' });
    }

    res.json({ success: true, data: event });
  } catch (error) {
    console.error('Errore nel caricamento dell\'evento:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}

// POST /api/calendar/events
export async function createEvent(req, res) {
  try {
    const { title, description, type, startTime, endTime, location, opponent, notes, participants, isRecurring, recurrence, createdBy } = req.body;

    console.log('📅 Creating event:', { title, startTime, received: new Date(startTime).toISOString() });

    // Validazione
    if (!title || !startTime || !type) {
      return res.status(400).json({ success: false, error: 'Campi obbligatori mancanti: title, startTime, type' });
    }

    let recurrenceId = null;
    if (isRecurring && recurrence) {
      const createdRecurrence = await prisma.eventRecurrence.create({
        data: recurrence,
      });
      recurrenceId = createdRecurrence.id;
    }

    const event = await prisma.calendarEvent.create({
      data: {
        title,
        description,
        type,
        startTime: new Date(startTime),
        endTime: endTime ? new Date(endTime) : null,
        location,
        opponent,
        notes,
        createdBy,
        isRecurring: isRecurring || false,
        recurrenceId,
        participants: participants
          ? {
              createMany: {
                data: participants.map(p => ({
                  email: p.email,
                  name: p.name,
                  notificationType: p.notificationType || 'both',
                })),
              },
            }
          : undefined,
      },
      include: {
        participants: true,
        recurrence: true,
      },
    });

    // Crea notifiche
    if (participants && participants.length > 0) {
      const notificationHoursBefore = 24; // 24 ore prima
      const scheduledFor = new Date(startTime);
      scheduledFor.setHours(scheduledFor.getHours() - notificationHoursBefore);

      for (const participant of participants) {
        if (['email', 'both'].includes(participant.notificationType || 'both')) {
          await prisma.eventNotification.create({
            data: {
              type: 'EMAIL',
              scheduledFor,
              recipientEmail: participant.email,
              eventId: event.id,
              content: `Reminder: ${title} - ${new Date(startTime).toLocaleString('it-IT')}`,
            },
          });
        }

        if (['in_app', 'both'].includes(participant.notificationType || 'both')) {
          await prisma.eventNotification.create({
            data: {
              type: 'IN_APP',
              scheduledFor,
              eventId: event.id,
              content: `Evento: ${title}`,
            },
          });
        }
      }
    }

    res.status(201).json({ success: true, data: event });
  } catch (error) {
    console.error('Errore nella creazione dell\'evento:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}

// PUT /api/calendar/events/:id
export async function updateEvent(req, res) {
  try {
    const { id } = req.params;
    const { title, description, type, startTime, endTime, location, opponent, notes, participants, updatedBy } = req.body;

    const event = await prisma.calendarEvent.update({
      where: { id },
      data: {
        title,
        description,
        type,
        startTime: startTime ? new Date(startTime) : undefined,
        endTime: endTime ? new Date(endTime) : undefined,
        location,
        opponent,
        notes,
        updatedBy,
      },
      include: {
        participants: true,
        recurrence: true,
      },
    });

    // Aggiorna partecipanti se forniti
    if (participants) {
      // Elimina i vecchi partecipanti
      await prisma.calendarEventParticipant.deleteMany({
        where: { eventId: id },
      });

      // Aggiungi i nuovi
      if (participants.length > 0) {
        await prisma.calendarEventParticipant.createMany({
          data: participants.map(p => ({
            email: p.email,
            name: p.name,
            eventId: id,
            notificationType: p.notificationType || 'both',
          })),
        });
      }
    }

    res.json({ success: true, data: event });
  } catch (error) {
    console.error('Errore nell\'aggiornamento dell\'evento:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}

// DELETE /api/calendar/events/:id
export async function deleteEvent(req, res) {
  try {
    const { id } = req.params;

    const event = await prisma.calendarEvent.findUnique({
      where: { id },
      include: { recurrence: true },
    });

    if (!event) {
      return res.status(404).json({ success: false, error: 'Evento non trovato' });
    }

    // Elimina le ricorrenze associate se necessario
    if (event.recurrenceId) {
      await prisma.eventRecurrence.delete({
        where: { id: event.recurrenceId },
      });
    }

    await prisma.calendarEvent.delete({
      where: { id },
    });

    res.json({ success: true, message: 'Evento eliminato con successo' });
  } catch (error) {
    console.error('Errore nell\'eliminazione dell\'evento:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}

// POST /api/calendar/events/:id/accept
export async function acceptEvent(req, res) {
  try {
    const { id } = req.params;
    const { email } = req.body;

    const participant = await prisma.calendarEventParticipant.update({
      where: {
        eventId_email: {
          eventId: id,
          email,
        },
      },
      data: {
        status: 'accepted',
      },
    });

    res.json({ success: true, data: participant });
  } catch (error) {
    console.error('Errore nell\'accettazione dell\'evento:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}

// POST /api/calendar/events/:id/decline
export async function declineEvent(req, res) {
  try {
    const { id } = req.params;
    const { email } = req.body;

    const participant = await prisma.calendarEventParticipant.update({
      where: {
        eventId_email: {
          eventId: id,
          email,
        },
      },
      data: {
        status: 'declined',
      },
    });

    res.json({ success: true, data: participant });
  } catch (error) {
    console.error('Errore nel rifiuto dell\'evento:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}
