/**
 * Ajoute themes + cartes Goethe sans reset de la base.
 * Usage: npx tsx scripts/seed-goethe-incremental.ts
 */
import { PrismaClient } from "@prisma/client";
import { THEMES } from "../src/lib/content/themes";
import { getExamAll } from "../src/lib/content/exam-catalog";
import { examSourcePrefix, examThemeSlug } from "../src/lib/exam-provider";

const prisma = new PrismaClient();

async function main() {
  const goetheThemes = THEMES.filter((t) => t.slug.startsWith("examen-goethe-"));
  const themeMap = new Map<string, string>();

  for (const t of goetheThemes) {
    const theme = await prisma.theme.upsert({
      where: { slug: t.slug },
      create: {
        slug: t.slug,
        nameFr: t.nameFr,
        nameDe: t.nameDe,
        sortOrder: t.sortOrder,
      },
      update: {
        nameFr: t.nameFr,
        nameDe: t.nameDe,
        sortOrder: t.sortOrder,
      },
    });
    themeMap.set(t.slug, theme.id);
  }

  const exercises = getExamAll("GOETHE");
  const prefix = examSourcePrefix("GOETHE");
  let created = 0;
  let skipped = 0;

  for (const exercise of exercises) {
    const themeId = themeMap.get(examThemeSlug("GOETHE", exercise.level));
    if (!themeId) continue;

    if (exercise.format === "MATCH") {
      for (const [idx, pair] of exercise.pairs.entries()) {
        const sourceRef = `${prefix}${exercise.sourceId}:${idx}`;
        const exists = await prisma.card.findFirst({ where: { sourceRef } });
        if (exists) {
          skipped += 1;
          continue;
        }
        await prisma.card.create({
          data: {
            themeId,
            language: "de",
            level: exercise.level,
            kind: "MATCH",
            prompt: /Teil 3/i.test(exercise.section)
              ? "Quelle situation correspond a cette annonce ?"
              : "Quel titre correspond a ce texte ?",
            answer: pair.title,
            context: pair.passage,
            hint: `${exercise.section} · ${exercise.sourceTitle}`,
            options: JSON.stringify(exercise.options),
            sourceRef,
          },
        });
        created += 1;
      }
      continue;
    }

    for (const gap of exercise.gaps ?? []) {
      const sourceRef = `${prefix}${exercise.sourceId}:${gap.n}`;
      const exists = await prisma.card.findFirst({ where: { sourceRef } });
      if (exists) {
        skipped += 1;
        continue;
      }
      const prompt =
        exercise.format === "READING_MCQ"
          ? gap.prompt || `Question ${gap.n}`
          : exercise.format === "TF"
            ? gap.prompt || `Aussage ${gap.n}`
            : exercise.format === "WRITE"
              ? gap.prompt || "Redige selon la consigne"
              : exercise.format === "SPEAK"
                ? gap.prompt ||
                  "Prepare tes notes, enregistre-toi, puis marque comme pret."
                : `Complete la lacune ${gap.n}`;
      const optionPayload =
        exercise.format === "CLOZE_BANK"
          ? exercise.bank?.length
            ? exercise.bank
            : exercise.options
          : gap.choices;
      await prisma.card.create({
        data: {
          themeId,
          language: "de",
          level: exercise.level,
          kind: exercise.format,
          prompt,
          answer: gap.answer,
          context: exercise.passage ?? "",
          hint: `${exercise.section} · ${exercise.sourceTitle} · #${gap.n}`,
          options: JSON.stringify(optionPayload),
          sourceRef,
        },
      });
      created += 1;
    }
  }

  // Colonne examProvider si absente est geree par migrate.
  // Assigne les cartes Goethe aux eleves existants.
  const students = await prisma.user.findMany({
    where: { role: "STUDENT" },
    select: { id: true },
  });
  const goetheCards = await prisma.card.findMany({
    where: { sourceRef: { startsWith: prefix } },
    select: { id: true },
  });
  const now = new Date();
  let progress = 0;
  for (const student of students) {
    const result = await prisma.cardProgress.createMany({
      data: goetheCards.map((card) => ({
        userId: student.id,
        cardId: card.id,
        nextReviewAt: now,
      })),
      skipDuplicates: true,
    });
    progress += result.count;
  }

  console.log(
    JSON.stringify(
      {
        ok: true,
        exercises: exercises.length,
        cardsCreated: created,
        cardsSkipped: skipped,
        progressAssigned: progress,
      },
      null,
      2,
    ),
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
