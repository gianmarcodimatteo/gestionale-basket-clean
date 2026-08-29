-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT,
    "googleId" TEXT,
    "name" TEXT,
    "picture" TEXT,
    "role" TEXT NOT NULL DEFAULT 'USER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Staff" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "position" TEXT NOT NULL,
    "photo" TEXT,
    "bio" TEXT,
    "joinDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT,

    CONSTRAINT "Staff_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StaffNote" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "staffId" TEXT NOT NULL,

    CONSTRAINT "StaffNote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Roster" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "number" INTEGER NOT NULL,
    "position" TEXT NOT NULL,
    "height" DOUBLE PRECISION,
    "weight" DOUBLE PRECISION,
    "dateOfBirth" TIMESTAMP(3),
    "nationality" TEXT,
    "photo" TEXT,
    "instatId" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "joinDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Roster_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlayerStats" (
    "id" TEXT NOT NULL,
    "min" DOUBLE PRECISION,
    "points" DOUBLE PRECISION,
    "pppp" DOUBLE PRECISION,
    "fgPlus" DOUBLE PRECISION,
    "fg" DOUBLE PRECISION,
    "fgPercent" DOUBLE PRECISION,
    "threePass" DOUBLE PRECISION,
    "threePt" DOUBLE PRECISION,
    "threePtPercent" DOUBLE PRECISION,
    "ftPlus" DOUBLE PRECISION,
    "ft" DOUBLE PRECISION,
    "ftPercent" DOUBLE PRECISION,
    "tsPercent" DOUBLE PRECISION,
    "twoPtPlus" DOUBLE PRECISION,
    "twoPt" DOUBLE PRECISION,
    "twoPtPercent" DOUBLE PRECISION,
    "reb" DOUBLE PRECISION,
    "oreb" DOUBLE PRECISION,
    "dreb" DOUBLE PRECISION,
    "ast" DOUBLE PRECISION,
    "stl" DOUBLE PRECISION,
    "tov" DOUBLE PRECISION,
    "blk" DOUBLE PRECISION,
    "f" DOUBLE PRECISION,
    "fd" DOUBLE PRECISION,
    "plusMinus" DOUBLE PRECISION,
    "astTo" DOUBLE PRECISION,
    "orat" DOUBLE PRECISION,
    "drat" DOUBLE PRECISION,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "rosterId" TEXT NOT NULL,

    CONSTRAINT "PlayerStats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlayTypeStats" (
    "id" TEXT NOT NULL,
    "playType" TEXT NOT NULL,
    "side" TEXT NOT NULL,
    "fgPercent" DOUBLE PRECISION,
    "possessions" DOUBLE PRECISION,
    "points" DOUBLE PRECISION,
    "pppp" DOUBLE PRECISION,
    "foulsDrawn" DOUBLE PRECISION,
    "turnovers" DOUBLE PRECISION,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "statsId" TEXT NOT NULL,

    CONSTRAINT "PlayTypeStats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Injury" (
    "id" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "returnDate" TIMESTAMP(3),
    "severity" TEXT NOT NULL,
    "notes" TEXT,
    "resolved" BOOLEAN NOT NULL DEFAULT false,
    "rosterId" TEXT NOT NULL,

    CONSTRAINT "Injury_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CalendarEvent" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "type" TEXT NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3),
    "location" TEXT,
    "opponent" TEXT,
    "notes" TEXT,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "parentEventId" TEXT,
    "isRecurring" BOOLEAN NOT NULL DEFAULT false,
    "recurrenceId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CalendarEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventRecurrence" (
    "id" TEXT NOT NULL,
    "frequency" TEXT NOT NULL,
    "daysOfWeek" TEXT,
    "endDate" TIMESTAMP(3),
    "occurrences" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EventRecurrence_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CalendarEventParticipant" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "notificationType" TEXT NOT NULL DEFAULT 'both',
    "eventId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CalendarEventParticipant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventNotification" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "sentAt" TIMESTAMP(3),
    "scheduledFor" TIMESTAMP(3) NOT NULL,
    "content" TEXT,
    "recipientEmail" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "eventId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EventNotification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TrainingSession" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "duration" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "description" TEXT,
    "exercises" TEXT,
    "notes" TEXT,
    "fileUrl" TEXT,
    "calendarEventId" TEXT,
    "creatorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TrainingSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TrainingSessionPlayer" (
    "id" TEXT NOT NULL,
    "present" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,
    "trainingId" TEXT NOT NULL,
    "rosterId" TEXT NOT NULL,

    CONSTRAINT "TrainingSessionPlayer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Playbook" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "side" TEXT NOT NULL,
    "fileType" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "tags" TEXT,
    "notes" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Playbook_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScoutingReport" (
    "id" TEXT NOT NULL,
    "opponent" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "matchDate" TIMESTAMP(3),
    "content" TEXT,
    "fileUrl" TEXT,
    "fileType" TEXT,
    "keyPlayers" TEXT,
    "strategy" TEXT,
    "notes" TEXT,
    "eventId" TEXT,
    "creatorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ScoutingReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScoutingNote" (
    "id" TEXT NOT NULL,
    "reportId" TEXT,
    "note" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "creatorId" TEXT NOT NULL,

    CONSTRAINT "ScoutingNote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PracticesShootingStats" (
    "id" TEXT NOT NULL,
    "rosterId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "lhCorM" INTEGER,
    "lhCorA" INTEGER,
    "lhWgM" INTEGER,
    "lhWgA" INTEGER,
    "topM" INTEGER,
    "topA" INTEGER,
    "rtWgM" INTEGER,
    "rtWgA" INTEGER,
    "rtCorM" INTEGER,
    "rtCorA" INTEGER,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PracticesShootingStats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScoutingPlayerStats" (
    "id" TEXT NOT NULL,
    "reportId" TEXT NOT NULL,
    "sheetType" TEXT NOT NULL,
    "playerNumber" INTEGER,
    "playerName" TEXT,
    "data" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ScoutingPlayerStats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScoutingOffensiveBreakdown" (
    "id" TEXT NOT NULL,
    "reportId" TEXT NOT NULL,
    "rank" INTEGER,
    "call" TEXT,
    "poss" DOUBLE PRECISION,
    "points" DOUBLE PRECISION,
    "pfd" DOUBLE PRECISION,
    "twopm" DOUBLE PRECISION,
    "twoam" DOUBLE PRECISION,
    "threepm" DOUBLE PRECISION,
    "threeam" DOUBLE PRECISION,
    "ftm" DOUBLE PRECISION,
    "fta" DOUBLE PRECISION,
    "paintTouch" BOOLEAN,
    "data" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ScoutingOffensiveBreakdown_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScoutingComparingStats" (
    "id" TEXT NOT NULL,
    "reportId" TEXT NOT NULL,
    "statName" TEXT NOT NULL,
    "ourValue" DOUBLE PRECISION,
    "ourCategory" TEXT,
    "theirValue" DOUBLE PRECISION,
    "theirCategory" TEXT,
    "data" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ScoutingComparingStats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScoutingKeyPoint" (
    "id" TEXT NOT NULL,
    "reportId" TEXT NOT NULL,
    "title" TEXT,
    "description" TEXT NOT NULL,
    "category" TEXT,
    "priority" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ScoutingKeyPoint_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GameCard" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "opponent" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "location" TEXT,
    "finalScore" TEXT,
    "result" TEXT,
    "quarter1" INTEGER,
    "quarter2" INTEGER,
    "quarter3" INTEGER,
    "quarter4" INTEGER,
    "fileUrl" TEXT,
    "notes" TEXT,
    "eventId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GameCard_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GameCardStat" (
    "id" TEXT NOT NULL,
    "points" INTEGER NOT NULL DEFAULT 0,
    "assists" INTEGER NOT NULL DEFAULT 0,
    "rebounds" INTEGER NOT NULL DEFAULT 0,
    "steals" INTEGER NOT NULL DEFAULT 0,
    "blocks" INTEGER NOT NULL DEFAULT 0,
    "turnovers" INTEGER NOT NULL DEFAULT 0,
    "fieldGoals" TEXT,
    "threePointers" TEXT,
    "freeThrows" TEXT,
    "gameCardId" TEXT NOT NULL,
    "rosterId" TEXT NOT NULL,

    CONSTRAINT "GameCardStat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Organization" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL DEFAULT 'Gestionale Basket Femminile',
    "city" TEXT,
    "country" TEXT,
    "foundedYear" INTEGER,
    "logo" TEXT,
    "description" TEXT,
    "website" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Organization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrganizationSettings" (
    "id" TEXT NOT NULL,
    "theme" TEXT NOT NULL DEFAULT 'dark',
    "language" TEXT NOT NULL DEFAULT 'it',
    "timezone" TEXT NOT NULL DEFAULT 'Europe/Rome',
    "maxUploadSize" INTEGER NOT NULL DEFAULT 52428800,
    "organizationId" TEXT NOT NULL,

    CONSTRAINT "OrganizationSettings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_googleId_key" ON "User"("googleId");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_googleId_idx" ON "User"("googleId");

-- CreateIndex
CREATE UNIQUE INDEX "Staff_email_key" ON "Staff"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Staff_userId_key" ON "Staff"("userId");

-- CreateIndex
CREATE INDEX "Staff_name_idx" ON "Staff"("name");

-- CreateIndex
CREATE INDEX "Staff_position_idx" ON "Staff"("position");

-- CreateIndex
CREATE INDEX "StaffNote_staffId_idx" ON "StaffNote"("staffId");

-- CreateIndex
CREATE INDEX "Roster_number_idx" ON "Roster"("number");

-- CreateIndex
CREATE INDEX "Roster_position_idx" ON "Roster"("position");

-- CreateIndex
CREATE INDEX "Roster_name_idx" ON "Roster"("name");

-- CreateIndex
CREATE UNIQUE INDEX "PlayerStats_rosterId_key" ON "PlayerStats"("rosterId");

-- CreateIndex
CREATE INDEX "PlayTypeStats_statsId_idx" ON "PlayTypeStats"("statsId");

-- CreateIndex
CREATE UNIQUE INDEX "PlayTypeStats_statsId_playType_side_key" ON "PlayTypeStats"("statsId", "playType", "side");

-- CreateIndex
CREATE INDEX "Injury_rosterId_idx" ON "Injury"("rosterId");

-- CreateIndex
CREATE INDEX "Injury_date_idx" ON "Injury"("date");

-- CreateIndex
CREATE INDEX "CalendarEvent_startTime_idx" ON "CalendarEvent"("startTime");

-- CreateIndex
CREATE INDEX "CalendarEvent_type_idx" ON "CalendarEvent"("type");

-- CreateIndex
CREATE INDEX "CalendarEvent_createdBy_idx" ON "CalendarEvent"("createdBy");

-- CreateIndex
CREATE INDEX "CalendarEventParticipant_eventId_idx" ON "CalendarEventParticipant"("eventId");

-- CreateIndex
CREATE INDEX "CalendarEventParticipant_email_idx" ON "CalendarEventParticipant"("email");

-- CreateIndex
CREATE UNIQUE INDEX "CalendarEventParticipant_eventId_email_key" ON "CalendarEventParticipant"("eventId", "email");

-- CreateIndex
CREATE INDEX "EventNotification_eventId_idx" ON "EventNotification"("eventId");

-- CreateIndex
CREATE INDEX "EventNotification_scheduledFor_idx" ON "EventNotification"("scheduledFor");

-- CreateIndex
CREATE INDEX "EventNotification_status_idx" ON "EventNotification"("status");

-- CreateIndex
CREATE INDEX "TrainingSession_date_idx" ON "TrainingSession"("date");

-- CreateIndex
CREATE INDEX "TrainingSession_creatorId_idx" ON "TrainingSession"("creatorId");

-- CreateIndex
CREATE INDEX "TrainingSessionPlayer_trainingId_idx" ON "TrainingSessionPlayer"("trainingId");

-- CreateIndex
CREATE INDEX "TrainingSessionPlayer_rosterId_idx" ON "TrainingSessionPlayer"("rosterId");

-- CreateIndex
CREATE UNIQUE INDEX "TrainingSessionPlayer_trainingId_rosterId_key" ON "TrainingSessionPlayer"("trainingId", "rosterId");

-- CreateIndex
CREATE INDEX "Playbook_side_idx" ON "Playbook"("side");

-- CreateIndex
CREATE INDEX "playbook_name_idx" ON "Playbook"("name");

-- CreateIndex
CREATE INDEX "ScoutingReport_opponent_idx" ON "ScoutingReport"("opponent");

-- CreateIndex
CREATE INDEX "ScoutingReport_matchDate_idx" ON "ScoutingReport"("matchDate");

-- CreateIndex
CREATE INDEX "ScoutingReport_eventId_idx" ON "ScoutingReport"("eventId");

-- CreateIndex
CREATE INDEX "ScoutingNote_date_idx" ON "ScoutingNote"("date");

-- CreateIndex
CREATE INDEX "PracticesShootingStats_rosterId_idx" ON "PracticesShootingStats"("rosterId");

-- CreateIndex
CREATE INDEX "PracticesShootingStats_date_idx" ON "PracticesShootingStats"("date");

-- CreateIndex
CREATE INDEX "ScoutingPlayerStats_reportId_idx" ON "ScoutingPlayerStats"("reportId");

-- CreateIndex
CREATE INDEX "ScoutingPlayerStats_sheetType_idx" ON "ScoutingPlayerStats"("sheetType");

-- CreateIndex
CREATE INDEX "ScoutingOffensiveBreakdown_reportId_idx" ON "ScoutingOffensiveBreakdown"("reportId");

-- CreateIndex
CREATE INDEX "ScoutingComparingStats_reportId_idx" ON "ScoutingComparingStats"("reportId");

-- CreateIndex
CREATE INDEX "ScoutingKeyPoint_reportId_idx" ON "ScoutingKeyPoint"("reportId");

-- CreateIndex
CREATE UNIQUE INDEX "GameCard_eventId_key" ON "GameCard"("eventId");

-- CreateIndex
CREATE INDEX "GameCard_date_idx" ON "GameCard"("date");

-- CreateIndex
CREATE INDEX "GameCard_opponent_idx" ON "GameCard"("opponent");

-- CreateIndex
CREATE INDEX "GameCardStat_gameCardId_idx" ON "GameCardStat"("gameCardId");

-- CreateIndex
CREATE UNIQUE INDEX "GameCardStat_gameCardId_rosterId_key" ON "GameCardStat"("gameCardId", "rosterId");

-- CreateIndex
CREATE UNIQUE INDEX "OrganizationSettings_organizationId_key" ON "OrganizationSettings"("organizationId");

-- AddForeignKey
ALTER TABLE "Staff" ADD CONSTRAINT "Staff_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StaffNote" ADD CONSTRAINT "StaffNote_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "Staff"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayerStats" ADD CONSTRAINT "PlayerStats_rosterId_fkey" FOREIGN KEY ("rosterId") REFERENCES "Roster"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayTypeStats" ADD CONSTRAINT "PlayTypeStats_statsId_fkey" FOREIGN KEY ("statsId") REFERENCES "PlayerStats"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Injury" ADD CONSTRAINT "Injury_rosterId_fkey" FOREIGN KEY ("rosterId") REFERENCES "Roster"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CalendarEvent" ADD CONSTRAINT "CalendarEvent_recurrenceId_fkey" FOREIGN KEY ("recurrenceId") REFERENCES "EventRecurrence"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CalendarEventParticipant" ADD CONSTRAINT "CalendarEventParticipant_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "CalendarEvent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventNotification" ADD CONSTRAINT "EventNotification_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "CalendarEvent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrainingSession" ADD CONSTRAINT "TrainingSession_calendarEventId_fkey" FOREIGN KEY ("calendarEventId") REFERENCES "CalendarEvent"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrainingSession" ADD CONSTRAINT "TrainingSession_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrainingSessionPlayer" ADD CONSTRAINT "TrainingSessionPlayer_trainingId_fkey" FOREIGN KEY ("trainingId") REFERENCES "TrainingSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrainingSessionPlayer" ADD CONSTRAINT "TrainingSessionPlayer_rosterId_fkey" FOREIGN KEY ("rosterId") REFERENCES "Roster"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScoutingReport" ADD CONSTRAINT "ScoutingReport_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "CalendarEvent"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScoutingReport" ADD CONSTRAINT "ScoutingReport_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScoutingNote" ADD CONSTRAINT "ScoutingNote_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "ScoutingReport"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScoutingNote" ADD CONSTRAINT "ScoutingNote_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PracticesShootingStats" ADD CONSTRAINT "PracticesShootingStats_rosterId_fkey" FOREIGN KEY ("rosterId") REFERENCES "Roster"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScoutingPlayerStats" ADD CONSTRAINT "ScoutingPlayerStats_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "ScoutingReport"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScoutingOffensiveBreakdown" ADD CONSTRAINT "ScoutingOffensiveBreakdown_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "ScoutingReport"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScoutingComparingStats" ADD CONSTRAINT "ScoutingComparingStats_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "ScoutingReport"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScoutingKeyPoint" ADD CONSTRAINT "ScoutingKeyPoint_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "ScoutingReport"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GameCard" ADD CONSTRAINT "GameCard_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "CalendarEvent"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GameCardStat" ADD CONSTRAINT "GameCardStat_gameCardId_fkey" FOREIGN KEY ("gameCardId") REFERENCES "GameCard"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GameCardStat" ADD CONSTRAINT "GameCardStat_rosterId_fkey" FOREIGN KEY ("rosterId") REFERENCES "Roster"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrganizationSettings" ADD CONSTRAINT "OrganizationSettings_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
