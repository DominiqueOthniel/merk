import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  let dbOk = false;
  let dbError: string | null = null;
  let ankiSchema: {
    cardProgressStatus: boolean;
    reviewLogMode: boolean;
  } | null = null;

  try {
    await prisma.$queryRaw`SELECT 1`;
    dbOk = true;

    const cols = await prisma.$queryRaw<
      { table_name: string; column_name: string }[]
    >`
      SELECT table_name, column_name
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND (
          (table_name = 'CardProgress' AND column_name = 'status')
          OR (table_name = 'ReviewLog' AND column_name = 'mode')
        )
    `;
    const names = new Set(cols.map((c) => `${c.table_name}.${c.column_name}`));
    ankiSchema = {
      cardProgressStatus: names.has("CardProgress.status"),
      reviewLogMode: names.has("ReviewLog.mode"),
    };
  } catch (e) {
    dbError = e instanceof Error ? e.message : "Erreur DB inconnue";
  }

  const schemaOk =
    Boolean(ankiSchema?.cardProgressStatus) && Boolean(ankiSchema?.reviewLogMode);

  return NextResponse.json(
    {
      ok: dbOk && schemaOk,
      dbOk,
      dbError,
      ankiSchema,
      hasDatabaseUrl: Boolean(process.env.DATABASE_URL),
      hasDirectUrl: Boolean(process.env.DIRECT_URL),
      hasNextAuthSecret: Boolean(process.env.NEXTAUTH_SECRET),
      hasNextAuthUrl: Boolean(process.env.NEXTAUTH_URL),
      nextAuthUrl: process.env.NEXTAUTH_URL ?? null,
    },
    { status: dbOk ? 200 : 503 },
  );
}
