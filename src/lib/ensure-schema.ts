import { prisma } from "@/lib/db";

let ensurePromise: Promise<void> | null = null;

/** Filet de securite si migrate n a pas tourne sur Netlify/Supabase. */
export function ensureSchema(): Promise<void> {
  if (!ensurePromise) {
    ensurePromise = runEnsure().catch((error) => {
      ensurePromise = null;
      throw error;
    });
  }
  return ensurePromise;
}

async function runEnsure() {
  await prisma.$executeRawUnsafe(`
    ALTER TABLE "User"
    ADD COLUMN IF NOT EXISTS "examProvider" TEXT NOT NULL DEFAULT 'TELC'
  `);
  await prisma.$executeRawUnsafe(`
    ALTER TABLE "User"
    ADD COLUMN IF NOT EXISTS "targetLevel" TEXT
  `);

  await prisma.$executeRawUnsafe(`
    ALTER TABLE "CardProgress"
    ADD COLUMN IF NOT EXISTS "status" TEXT NOT NULL DEFAULT 'NEW'
  `);
  await prisma.$executeRawUnsafe(`
    ALTER TABLE "CardProgress"
    ADD COLUMN IF NOT EXISTS "learningStep" INTEGER NOT NULL DEFAULT 0
  `);
  await prisma.$executeRawUnsafe(`
    ALTER TABLE "CardProgress"
    ADD COLUMN IF NOT EXISTS "lapses" INTEGER NOT NULL DEFAULT 0
  `);
  await prisma.$executeRawUnsafe(`
    ALTER TABLE "ReviewLog"
    ADD COLUMN IF NOT EXISTS "mode" TEXT NOT NULL DEFAULT 'REVIEW'
  `);

  await prisma.$executeRawUnsafe(`
    UPDATE "CardProgress"
    SET "status" = CASE
      WHEN "lastReviewedAt" IS NULL AND "repetitions" = 0 THEN 'NEW'
      ELSE 'REVIEW'
    END
    WHERE "status" = 'NEW'
      AND ("lastReviewedAt" IS NOT NULL OR "repetitions" > 0)
  `);

  await prisma.$executeRawUnsafe(`
    CREATE INDEX IF NOT EXISTS "CardProgress_userId_status_nextReviewAt_idx"
      ON "CardProgress"("userId", "status", "nextReviewAt")
  `);
  await prisma.$executeRawUnsafe(`
    CREATE INDEX IF NOT EXISTS "ReviewLog_userId_mode_createdAt_idx"
      ON "ReviewLog"("userId", "mode", "createdAt")
  `);
}
