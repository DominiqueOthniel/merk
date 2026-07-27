-- AlterTable
ALTER TABLE "Card" ADD COLUMN     "kind" TEXT NOT NULL DEFAULT 'CLOZE',
ADD COLUMN     "options" TEXT,
ADD COLUMN     "sourceRef" TEXT;

-- CreateIndex
CREATE INDEX "Card_kind_level_idx" ON "Card"("kind", "level");

-- CreateIndex
CREATE INDEX "Card_sourceRef_idx" ON "Card"("sourceRef");
