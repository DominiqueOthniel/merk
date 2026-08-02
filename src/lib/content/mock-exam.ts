import {
  exerciseItemCount,
  getExamExercises,
  type ExamExercise,
} from "@/lib/content/exam-catalog";
import type { ExamProvider } from "@/lib/exam-provider";
import {
  MOCK_MAX_PER_SKILL,
  MOCK_SKILL_ORDER,
  type MockItem,
  type MockLevel,
} from "@/lib/content/mock-exam-meta";

export type { MockItem, MockLevel } from "@/lib/content/mock-exam-meta";
export {
  mockDurationLabel,
  mockDurationMinutes,
  mockSkillLabels,
} from "@/lib/content/mock-exam-meta";

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

  for (const skill of MOCK_SKILL_ORDER) {
    const exercise = pickExercise(exercises, skill);
    if (!exercise) continue;
    const limit = MOCK_MAX_PER_SKILL[skill] ?? 3;

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

export function summarizeMock(exercises: ExamExercise[]) {
  const skills = [...new Set(exercises.map((e) => e.skill))];
  const itemEstimate = exercises.reduce(
    (sum, e) =>
      sum + Math.min(exerciseItemCount(e), MOCK_MAX_PER_SKILL[e.skill] ?? 3),
    0,
  );
  return { skills, itemEstimate };
}
