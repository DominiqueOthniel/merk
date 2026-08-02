import { prisma } from "@/lib/db";
import { THEMES } from "@/lib/content/themes";
import { getExamAll } from "@/lib/content/exam-catalog";
import {
  examSourcePrefix,
  examThemeSlug,
  type ExamProvider,
} from "@/lib/exam-provider";

let ensurePromise: Promise<void> | null = null;

/** Cree/maj les cartes SPEAK manquantes (TELC + Goethe) sans reset. */
export function ensureSpeakCards(): Promise<void> {
  if (!ensurePromise) {
    ensurePromise = runEnsure().catch((error) => {
      ensurePromise = null;
      throw error;
    });
  }
  return ensurePromise;
}

async function runEnsure() {
  const themeMap = new Map<string, string>();
  const examThemes = THEMES.filter((t) => t.slug.startsWith("examen-"));

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

  for (const provider of ["TELC", "GOETHE"] as ExamProvider[]) {
    const prefix = examSourcePrefix(provider);
    for (const exercise of getExamAll(provider)) {
      if (exercise.format !== "SPEAK") continue;
      const themeId = themeMap.get(examThemeSlug(provider, exercise.level));
      if (!themeId) continue;

      for (const gap of exercise.gaps ?? []) {
        const sourceRef = `${prefix}${exercise.sourceId}:${gap.n}`;
        const existing = await prisma.card.findFirst({ where: { sourceRef } });
        const prompt =
          gap.prompt || "Prepare tes notes, enregistre-toi, puis marque comme pret.";

        if (existing) {
          if (existing.kind !== "SPEAK" || existing.context !== (exercise.passage ?? "")) {
            await prisma.card.update({
              where: { id: existing.id },
              data: {
                kind: "SPEAK",
                prompt,
                answer: gap.answer,
                context: exercise.passage ?? "",
                hint: `${exercise.section} · ${exercise.sourceTitle} · #${gap.n}`,
                options: JSON.stringify(gap.choices),
              },
            });
          }
          continue;
        }

        await prisma.card.create({
          data: {
            themeId,
            language: "de",
            level: exercise.level,
            kind: "SPEAK",
            prompt,
            answer: gap.answer,
            context: exercise.passage ?? "",
            hint: `${exercise.section} · ${exercise.sourceTitle} · #${gap.n}`,
            options: JSON.stringify(gap.choices),
            sourceRef,
          },
        });
      }
    }
  }
}
