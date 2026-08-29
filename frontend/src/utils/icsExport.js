// Export calendar events to .ics format for Apple Calendar / Google Calendar sync

export function generateICS(events) {
  const icsHeader = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//GEAS Basket//Calendar//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
X-WR-CALNAME:GEAS Basket Calendar
X-WR-TIMEZONE:Europe/Rome
`;

  const icsEvents = events.map(event => {
    const start = formatICSDate(event.startTime || event.start);
    const end = formatICSDate(event.endTime || event.end);
    const created = formatICSDate(new Date(event.createdAt || Date.now()));

    return `BEGIN:VEVENT
UID:${event.id}@geasbasket.local
DTSTAMP:${created}
DTSTART:${start}
DTEND:${end}
SUMMARY:${escapeICS(event.title)}
DESCRIPTION:${escapeICS(event.description || '')}
LOCATION:${escapeICS(event.location || '')}
CATEGORIES:${event.type}
STATUS:CONFIRMED
END:VEVENT`;
  }).join('\n');

  const icsFooter = 'END:VCALENDAR';

  return `${icsHeader}${icsEvents}\n${icsFooter}`;
}

function formatICSDate(date) {
  const d = new Date(date);
  const year = d.getUTCFullYear();
  const month = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  const hours = String(d.getUTCHours()).padStart(2, '0');
  const minutes = String(d.getUTCMinutes()).padStart(2, '0');
  const seconds = String(d.getUTCSeconds()).padStart(2, '0');

  return `${year}${month}${day}T${hours}${minutes}${seconds}Z`;
}

function escapeICS(text) {
  if (!text) return '';
  return text
    .replace(/\\/g, '\\\\')
    .replace(/,/g, '\\,')
    .replace(/;/g, '\\;')
    .replace(/\n/g, '\\n');
}

export function downloadICS(events, filename = 'geas-basket-calendar.ics') {
  const icsContent = generateICS(events);
  const blob = new Blob([icsContent], { type: 'text/calendar' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
