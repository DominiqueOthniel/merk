import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

/**
 * One-shot schema ensure for Anki columns when migrate cannot run from CI/local.
 * Restricted to ADMIN sessions.
 */
export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Acces refuse" }, { status: 403 });
  }

  try {
    await prisma.$executeRawUnsafe(`
      DO $migrate$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_schema = 'public' AND table_name = 'CardProgress' AND column_name = 'status'
        ) THEN
          ALTER TABLE "CardProgress" ADD COLUMN "status" TEXT NOT NULL DEFAULT 'NEW';
        END IF;

        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_schema = 'public' AND table_name = 'CardProgress' AND column_name = 'learningStep'
        ) THEN
          ALTER TABLE "CardProgress" ADD COLUMN "learningStep" INTEGER NOT NULL DEFAULT 0;
        END IF;

        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_schema = 'public' AND table_name = 'CardProgress' AND column_name = 'lapses'
        ) THEN
          ALTER TABLE "CardProgress" ADD COLUMN "lapses" INTEGER NOT NULL DEFAULT 0;
        END IF;

        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_schema = 'public' AND table_name = 'ReviewLog' AND column_name = 'mode'
        ) THEN
          ALTER TABLE "ReviewLog" ADD COLUMN "mode" TEXT NOT NULL DEFAULT 'REVIEW';
        END IF;
      END
      $migrate$;
    `);

    await prisma.$executeRawUnsafe(`
      UPDATE "CardProgress"
      SET "status" = CASE
        WHEN "lastReviewedAt" IS NULL AND "repetitions" = 0 THEN 'NEW'
        ELSE 'REVIEW'
      END
      WHERE "status" = 'NEW' OR "status" IS NULL OR "status" = '';
    `);

    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "CardProgress_userId_status_nextReviewAt_idx"
        ON "CardProgress"("userId", "status", "nextReviewAt");
    `);

    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "ReviewLog_userId_mode_createdAt_idx"
        ON "ReviewLog"("userId", "mode", "createdAt");
    `);

    // Mark migration as applied so future prisma migrate deploy stays consistent
    await prisma.$executeRawUnsafe(`
      INSERT INTO "_prisma_migrations" (
        id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count
      )
      SELECT
        gen_random_uuid()::text,
        'manual-anki-ensure',
        NOW(),
        '20260803160000_anki_scheduler',
        NULL,
        NULL,
        NOW(),
        1
      WHERE NOT EXISTS (
        SELECT 1 FROM "_prisma_migrations"
        WHERE migration_name = '20260803160000_anki_scheduler'
      );
    `);

    const cols = await prisma.$queryRaw<
      { table_name: string; column_name: string }[]
    >`
      SELECT table_name, column_name
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND (
          (table_name = 'CardProgress' AND column_name IN ('status', 'learningStep', 'lapses'))
          OR (table_name = 'ReviewLog' AND column_name = 'mode')
        )
      ORDER BY table_name, column_name
    `;

    return NextResponse.json({ ok: true, columns: cols });
  } catch (e) {
    console.error("[ensure-anki-schema]", e);
    return NextResponse.json(
      {
        error: "Migration manuelle echouee",
        detail: e instanceof Error ? e.message : String(e),
      },
      { status: 500 }
    );
  }
}
