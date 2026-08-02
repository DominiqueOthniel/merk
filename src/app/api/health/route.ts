import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  let dbOk = false;
  let dbError: string | null = null;

  try {
    await prisma.$queryRaw`SELECT 1`;
    dbOk = true;
  } catch (e) {
    dbError = e instanceof Error ? e.message : "Erreur DB inconnue";
  }

  return NextResponse.json(
    {
      ok: dbOk,
      dbOk,
      dbError,
      hasDatabaseUrl: Boolean(process.env.DATABASE_URL),
      hasDirectUrl: Boolean(process.env.DIRECT_URL),
      hasNextAuthSecret: Boolean(process.env.NEXTAUTH_SECRET),
      hasNextAuthUrl: Boolean(process.env.NEXTAUTH_URL),
      nextAuthUrl: process.env.NEXTAUTH_URL ?? null,
    },
    { status: dbOk ? 200 : 503 },
  );
}
