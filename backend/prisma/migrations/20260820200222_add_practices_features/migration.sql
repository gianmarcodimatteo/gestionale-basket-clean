-- AlterTable
ALTER TABLE "TrainingSession" ADD COLUMN     "videoDuration" INTEGER;

-- CreateTable
CREATE TABLE "TrainingFeedback" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'note',
    "author" TEXT NOT NULL,
    "trainingId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TrainingFeedback_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TrainingVideoClip" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "startTime" INTEGER NOT NULL,
    "endTime" INTEGER NOT NULL,
    "tags" TEXT,
    "trainingId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TrainingVideoClip_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TrainingPlaylist" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "theme" TEXT NOT NULL,
    "creatorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TrainingPlaylist_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TrainingPlaylistItem" (
    "id" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "playlistId" TEXT NOT NULL,
    "trainingId" TEXT NOT NULL,

    CONSTRAINT "TrainingPlaylistItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TrainingFeedback_trainingId_idx" ON "TrainingFeedback"("trainingId");

-- CreateIndex
CREATE INDEX "TrainingFeedback_createdAt_idx" ON "TrainingFeedback"("createdAt");

-- CreateIndex
CREATE INDEX "TrainingVideoClip_trainingId_idx" ON "TrainingVideoClip"("trainingId");

-- CreateIndex
CREATE INDEX "TrainingPlaylist_creatorId_idx" ON "TrainingPlaylist"("creatorId");

-- CreateIndex
CREATE INDEX "TrainingPlaylist_theme_idx" ON "TrainingPlaylist"("theme");

-- CreateIndex
CREATE INDEX "TrainingPlaylistItem_playlistId_idx" ON "TrainingPlaylistItem"("playlistId");

-- CreateIndex
CREATE INDEX "TrainingPlaylistItem_trainingId_idx" ON "TrainingPlaylistItem"("trainingId");

-- CreateIndex
CREATE UNIQUE INDEX "TrainingPlaylistItem_playlistId_trainingId_key" ON "TrainingPlaylistItem"("playlistId", "trainingId");

-- AddForeignKey
ALTER TABLE "TrainingFeedback" ADD CONSTRAINT "TrainingFeedback_trainingId_fkey" FOREIGN KEY ("trainingId") REFERENCES "TrainingSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrainingVideoClip" ADD CONSTRAINT "TrainingVideoClip_trainingId_fkey" FOREIGN KEY ("trainingId") REFERENCES "TrainingSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrainingPlaylist" ADD CONSTRAINT "TrainingPlaylist_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrainingPlaylistItem" ADD CONSTRAINT "TrainingPlaylistItem_playlistId_fkey" FOREIGN KEY ("playlistId") REFERENCES "TrainingPlaylist"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrainingPlaylistItem" ADD CONSTRAINT "TrainingPlaylistItem_trainingId_fkey" FOREIGN KEY ("trainingId") REFERENCES "TrainingSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;
