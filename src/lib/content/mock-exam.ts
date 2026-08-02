import {
  exerciseItemCount,
  getExamExercises,
  type ExamExercise,
} from "@/lib/content/exam-catalog";
import type { ExamProvider } from "@/lib/exam-provider";

export type MockLevel = "A1" | "A2" | "B1" | "B2" | "C1";

export type MockItem = {
  id: string;
  sourceId: string;
  sourceTitle: string;
  skill: string;
  section: string;
  format: string;
  prompt: string;
  passage?: string | null;
  options: string[];
  answer: string;
  selfScore?: boolean;
};

const SKILL_ORDER = [
  "lesen",
  "sprachbausteine",
  "horen",
  "schreiben",
  "sprechen",
] as const;

const MAX_PER_SKILL: Record<string, number> = {
  lesen: 5,
  sprachbausteine: 4,
  horen: 4,
  schreiben: 1,
  sprechen: 1,
};

export function mockDurationMinutes(level: MockLevel): number {
  if (level === "C1") return 90;
  if (level === "B2") return 70;
  if (level === "B1") return 50;
  if (level === "A2") return 40;
  return 35;
}

export function mockDurationLabel(level: MockLevel): string {
  const m = mockDurationMinutes(level);
  const h = Math.floor(m / 60);
  const rest = m % 60;
  if (h === 0) return `${m} min`;
  if (rest === 0) return `${h}h`;
  return `${h}h ${rest}min`;
}

function pickExercise(
  exercises: ExamExercise[],
  skill: string,
): ExamExercise | undefined {
  return exercises.find((e) => e.skill === skill);
}

export function buildMockItems(
  provider: ExamProvider,
  level: MockLevel,
): MockItem[] {
  const exercises = getExamExercises(provider, level);
  const items: MockItem[] = [];

  for (const skill of SKILL_ORDER) {
    const exercise = pickExercise(exercises, skill);
    if (!exercise) continue;
    const limit = MAX_PER_SKILL[skill] ?? 3;

    if (exercise.format === "MATCH" && exercise.pairs?.length) {
      for (const [idx, pair] of exercise.pairs.slice(0, limit).entries()) {
        items.push({
          id: `${exercise.sourceId}:m${idx}`,
          sourceId: exercise.sourceId,
          sourceTitle: exercise.sourceTitle,
          skill: exercise.skill,
          section: exercise.section,
          format: "MATCH",
          prompt: /Teil 3/i.test(exercise.section)
            ? "Quelle situation correspond a cette annonce ?"
            : "Quel titre correspond a ce texte ?",
          passage: pair.passage,
          options: exercise.options.slice(0, 8),
          answer: pair.title,
        });
      }
      continue;
    }

    for (const gap of (exercise.gaps ?? []).slice(0, limit)) {
      const selfScore =
        exercise.format === "WRITE" || exercise.format === "SPEAK";
      items.push({
        id: `${exercise.sourceId}:g${gap.n}`,
        sourceId: exercise.sourceId,
        sourceTitle: exercise.sourceTitle,
        skill: exercise.skill,
        section: exercise.section,
        format: exercise.format,
        prompt:
          gap.prompt ||
          (selfScore
            ? "Prepare ta reponse, puis marque comme pret."
            : `Item ${gap.n}`),
        passage: exercise.passage ?? null,
        options: selfScore
          ? ["done"]
          : (gap.choices?.length ? gap.choices : exercise.options).slice(0, 8),
        answer: gap.answer,
        selfScore,
      });
    }
  }

  return items;
}

export function mockSkillLabels(skillsPresent: string[]): string[] {
  const labels: Record<string, string> = {
    lesen: "Lesen",
    sprachbausteine: "Bausteine",
    horen: "Horen",
    schreiben: "Schreiben",
    sprechen: "Sprechen",
  };
  return SKILL_ORDER.filter((s) => skillsPresent.includes(s)).map(
    (s) => labels[s] ?? s,
  );
}

export function summarizeMock(exercises: ExamExercise[]) {
  const skills = [...new Set(exercises.map((e) => e.skill))];
  const itemEstimate = exercises.reduce(
    (sum, e) => sum + Math.min(exerciseItemCount(e), MAX_PER_SKILL[e.skill] ?? 3),
    0,
  );
  return { skills, itemEstimate };
}
