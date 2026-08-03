/**
 * Backfill sourceRef for CLOZE retention cards missing one,
 * so sibling bury can group related notes later.
 * Usage: npx tsx scripts/backfill-cloze-sourceref.ts
 */
import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const cards = await prisma.card.findMany({
    where: { kind: "CLOZE", sourceRef: null },
    select: { id: true, themeId: true, prompt: true },
    orderBy: { createdAt: "asc" },
  });

  const byTheme = new Map<string, number>();
  let updated = 0;

  for (const card of cards) {
    const n = byTheme.get(card.themeId) ?? 0;
    byTheme.set(card.themeId, n + 1);
    const sourceRef = `cloze:${card.themeId}:${n}`;
    await prisma.card.update({
      where: { id: card.id },
      data: { sourceRef },
    });
    updated += 1;
  }

  console.log(`Backfill sourceRef: ${updated} cartes CLOZE`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
