-- Create ScoutingFile table for multiple files per report
CREATE TABLE "ScoutingFile" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "fileUrl" TEXT NOT NULL,
  "fileType" TEXT NOT NULL,
  "fileTitle" TEXT,
  "reportId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ScoutingFile_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "ScoutingReport" ("id") ON DELETE CASCADE
);

-- Create index on reportId
CREATE INDEX "ScoutingFile_reportId_idx" ON "ScoutingFile"("reportId");

-- Migrate existing files from ScoutingReport to ScoutingFile
INSERT INTO "ScoutingFile" (id, "fileUrl", "fileType", "fileTitle", "reportId", "createdAt")
SELECT
  concat('file-', id, '-', random()::text),
  "fileUrl",
  "fileType",
  "fileTitle",
  id,
  "createdAt"
FROM "ScoutingReport"
WHERE "fileUrl" IS NOT NULL;

-- Remove old file columns from ScoutingReport
ALTER TABLE "ScoutingReport" DROP COLUMN "fileUrl";
ALTER TABLE "ScoutingReport" DROP COLUMN "fileType";
ALTER TABLE "ScoutingReport" DROP COLUMN "fileTitle";
