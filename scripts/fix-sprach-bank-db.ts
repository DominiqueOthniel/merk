import { PrismaClient } from "@prisma/client";
import { EXAM_ALL } from "../src/lib/content/exam-catalog";

const prisma = new PrismaClient();

async function main() {
  let updated = 0;
  for (const exercise of EXAM_ALL) {
    if (exercise.format !== "CLOZE_BANK") continue;
    for (const gap of exercise.gaps ?? []) {
      const res = await prisma.card.updateMany({
        where: { sourceRef: `deuropa:${exercise.sourceId}:${gap.n}` },
        data: { options: JSON.stringify(gap.choices) },
      });
      updated += res.count;
    }
  }
  console.log(`Updated ${updated} CLOZE_BANK cards`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
