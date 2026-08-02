import { PrismaClient } from "@prisma/client";

/** Supabase transaction pooler needs Prisma to skip prepared statements. */
function resolveDatabaseUrl() {
  const raw = process.env.DATABASE_URL;
  if (!raw) return raw;

  try {
    const url = new URL(raw);
    const isSupabasePooler =
      url.hostname.includes("pooler.supabase.com") ||
      url.port === "6543" ||
      raw.includes("pgbouncer=true");

    if (isSupabasePooler || url.hostname.includes("supabase.com")) {
      if (!url.searchParams.has("pgbouncer")) {
        url.searchParams.set("pgbouncer", "true");
      }
      if (!url.searchParams.has("sslmode")) {
        url.searchParams.set("sslmode", "require");
      }
      if (!url.searchParams.has("connection_limit")) {
        url.searchParams.set("connection_limit", "1");
      }
      return url.toString();
    }
  } catch {
    // keep raw URL if parsing fails
  }

  return raw;
}

const databaseUrl = resolveDatabaseUrl();

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    datasources: databaseUrl ? { db: { url: databaseUrl } } : undefined,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
