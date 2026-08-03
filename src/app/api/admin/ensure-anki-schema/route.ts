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
  if (!session?.user?.id || session.user.role !== "CENTER_ADMIN") {
    return NextResponse.json({ error: "Acces refuse" }, { status: 403 });
  }

  try {
    const { ensureSchema } = await import("@/lib/ensure-schema");
    await ensureSchema();

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
