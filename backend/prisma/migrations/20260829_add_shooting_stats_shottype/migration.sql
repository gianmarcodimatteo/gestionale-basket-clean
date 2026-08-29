-- Add shotType column to PracticesShootingStats table
ALTER TABLE "PracticesShootingStats" ADD COLUMN "shotType" TEXT NOT NULL DEFAULT '2PTS';
