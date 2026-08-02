import { prisma } from "@/lib/db";
import { THEMES } from "@/lib/content/themes";
import { getExamAll } from "@/lib/content/exam-catalog";
import { examSourcePrefix, examThemeSlug } from "@/lib/exam-provider";

let ensurePromise: Promise<void> | null = null;

/** Cree themes + cartes Goethe une seule fois si absents (prod sans re-seed local). */
export function ensureGoetheCards(): Promise<void> {
  if (!ensurePromise) {
    ensurePromise = runEnsure().catch((error) => {
      ensurePromise = null;
      throw error;
    });
  }
  return ensurePromise;
}

async function runEnsure() {
  const prefix = examSourcePrefix("GOETHE");
  const existing = await prisma.card.count({
    where: { sourceRef: { startsWith: prefix } },
  });
  if (existing > 0) return;

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

  const rows: {
    themeId: string;
    language: string;
    level: string;
    kind: string;
    prompt: string;
    answer: string;
    context: string;
    hint: string;
    options: string;
    sourceRef: string;
  }[] = [];

  for (const exercise of getExamAll("GOETHE")) {
    const themeId = themeMap.get(examThemeSlug("GOETHE", exercise.level));
    if (!themeId) continue;

    if (exercise.format === "MATCH") {
      for (const [idx, pair] of exercise.pairs.entries()) {
        rows.push({
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
          sourceRef: `${prefix}${exercise.sourceId}:${idx}`,
        });
      }
      continue;
    }

    for (const gap of exercise.gaps ?? []) {
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
      rows.push({
        themeId,
        language: "de",
        level: exercise.level,
        kind: exercise.format,
        prompt,
        answer: gap.answer,
        context: exercise.passage ?? "",
        hint: `${exercise.section} · ${exercise.sourceTitle} · #${gap.n}`,
        options: JSON.stringify(optionPayload),
        sourceRef: `${prefix}${exercise.sourceId}:${gap.n}`,
      });
    }
  }

  for (let i = 0; i < rows.length; i += 200) {
    await prisma.card.createMany({
      data: rows.slice(i, i + 200),
      skipDuplicates: true,
    });
  }
}
