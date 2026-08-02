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
}
