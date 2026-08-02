import { prisma } from "@/lib/db";
import { THEMES } from "@/lib/content/themes";
import { getExamAll } from "@/lib/content/exam-catalog";
import {
  examSourcePrefix,
  examThemeSlug,
  type ExamProvider,
} from "@/lib/exam-provider";

const ensurePromises = new Map<ExamProvider, Promise<void>>();

/** Upsert themes + cartes manquantes pour un provider (A1/A2 inclus). */
export function ensureExamCards(provider: ExamProvider): Promise<void> {
  let promise = ensurePromises.get(provider);
  if (!promise) {
    promise = runEnsure(provider).catch((error) => {
      ensurePromises.delete(provider);
      throw error;
    });
    ensurePromises.set(provider, promise);
  }
  return promise;
}

async function runEnsure(provider: ExamProvider) {
  const prefix = examSourcePrefix(provider);
  const slugPrefix =
    provider === "GOETHE" ? "examen-goethe-" : "examen-telc-";
  const examThemes = THEMES.filter((t) => t.slug.startsWith(slugPrefix));
  const themeMap = new Map<string, string>();

  for (const t of examThemes) {
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

  const existingRefs = new Set(
    (
      await prisma.card.findMany({
        where: { sourceRef: { startsWith: prefix } },
        select: { sourceRef: true },
      })
    )
      .map((c) => c.sourceRef)
      .filter((r): r is string => Boolean(r)),
  );

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

  for (const exercise of getExamAll(provider)) {
    const themeId = themeMap.get(examThemeSlug(provider, exercise.level));
    if (!themeId) continue;

    if (exercise.format === "MATCH") {
      for (const [idx, pair] of exercise.pairs.entries()) {
        const sourceRef = `${prefix}${exercise.sourceId}:${idx}`;
        if (existingRefs.has(sourceRef)) continue;
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
          sourceRef,
        });
      }
      continue;
    }

    for (const gap of exercise.gaps ?? []) {
      const sourceRef = `${prefix}${exercise.sourceId}:${gap.n}`;
      if (existingRefs.has(sourceRef)) continue;
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
        sourceRef,
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
