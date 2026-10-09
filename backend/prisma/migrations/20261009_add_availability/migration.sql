-- Roster: status and notes
ALTER TABLE "Roster" ADD COLUMN "status" TEXT NOT NULL DEFAULT 'AVAILABLE';
ALTER TABLE "Roster" ADD COLUMN "notes" TEXT;

-- Per-event player availability
CREATE TABLE "CalendarEventAvailability" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "available" BOOLEAN NOT NULL DEFAULT true,
  "eventId" TEXT NOT NULL,
  "rosterId" TEXT NOT NULL,
  CONSTRAINT "CalendarEventAvailability_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "CalendarEvent" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "CalendarEventAvailability_rosterId_fkey" FOREIGN KEY ("rosterId") REFERENCES "Roster" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "CalendarEventAvailability_eventId_rosterId_key" ON "CalendarEventAvailability"("eventId", "rosterId");
CREATE INDEX "CalendarEventAvailability_rosterId_idx" ON "CalendarEventAvailability"("rosterId");
