-- Coaches gets its own folders and files, independent from Scouting

CREATE TABLE "CoachesReport" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "opponent" TEXT NOT NULL,
  "opponentLogo" TEXT,
  "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "matchDate" TIMESTAMP(3),
  "content" TEXT,
  "notes" TEXT,
  "eventId" TEXT,
  "creatorId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "CoachesReport_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "CalendarEvent" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "CoachesReport_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE INDEX "CoachesReport_opponent_idx" ON "CoachesReport"("opponent");
CREATE INDEX "CoachesReport_matchDate_idx" ON "CoachesReport"("matchDate");
CREATE INDEX "CoachesReport_eventId_idx" ON "CoachesReport"("eventId");

CREATE TABLE "CoachesFile" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "fileUrl" TEXT NOT NULL,
  "fileType" TEXT NOT NULL,
  "fileTitle" TEXT,
  "reportId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "CoachesFile_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "CoachesReport" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "CoachesFile_reportId_idx" ON "CoachesFile"("reportId");

INSERT INTO "CoachesReport" ("id", "opponent", "opponentLogo", "date", "matchDate", "content", "notes", "eventId", "creatorId", "createdAt", "updatedAt")
SELECT "id", "opponent", "opponentLogo", "date", "matchDate", "content", "notes", "eventId", "creatorId", "createdAt", "updatedAt"
FROM "ScoutingReport";

INSERT INTO "CoachesFile" ("id", "fileUrl", "fileType", "fileTitle", "reportId", "createdAt")
SELECT concat('coach-', "id"), "fileUrl", "fileType", "fileTitle", "reportId", "createdAt"
FROM "ScoutingFile";
