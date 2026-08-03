-- Anki-style card progress states and exam review log mode

ALTER TABLE "CardProgress" ADD COLUMN "status" TEXT NOT NULL DEFAULT 'NEW';
ALTER TABLE "CardProgress" ADD COLUMN "learningStep" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "CardProgress" ADD COLUMN "lapses" INTEGER NOT NULL DEFAULT 0;

UPDATE "CardProgress"
SET "status" = CASE
  WHEN "lastReviewedAt" IS NULL AND "repetitions" = 0 THEN 'NEW'
  ELSE 'REVIEW'
END;

CREATE INDEX "CardProgress_userId_status_nextReviewAt_idx"
  ON "CardProgress"("userId", "status", "nextReviewAt");

ALTER TABLE "ReviewLog" ADD COLUMN "mode" TEXT NOT NULL DEFAULT 'REVIEW';

CREATE INDEX "ReviewLog_userId_mode_createdAt_idx"
  ON "ReviewLog"("userId", "mode", "createdAt");
