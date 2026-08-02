import {
  exerciseItemCount,
  getExamExercises,
  type ExamExercise,
} from "@/lib/content/exam-catalog";
import type { ExamProvider } from "@/lib/exam-provider";
import {
  MOCK_MAX_PER_SKILL,
  MOCK_MAX_PER_SKILL_GOETHE,
  MOCK_SKILL_ORDER,
  MOCK_SKILL_ORDER_GOETHE,
  type MockItem,
  type MockLevel,
} from "@/lib/content/mock-exam-meta";

export type { MockItem, MockLevel } from "@/lib/content/mock-exam-meta";
export {
  mockDurationLabel,
  mockDurationMinutes,
  mockSkillLabels,
} from "@/lib/content/mock-exam-meta";

function pushFromExercise(
  items: MockItem[],
  exercise: ExamExercise,
  remaining: number,
): number {
  if (remaining <= 0) return 0;
  let added = 0;

  if (exercise.format === "MATCH" && exercise.pairs?.length) {
    for (const [idx, pair] of exercise.pairs.slice(0, remaining).entries()) {
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
      added += 1;
    }
    return added;
  }

  for (const gap of (exercise.gaps ?? []).slice(0, remaining)) {
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
    added += 1;
  }
  return added;
}

export function buildMockItems(
  provider: ExamProvider,
  level: MockLevel,
): MockItem[] {
  const exercises = getExamExercises(provider, level);
  const items: MockItem[] = [];
  const skillOrder =
    provider === "GOETHE" ? MOCK_SKILL_ORDER_GOETHE : MOCK_SKILL_ORDER;
  const maxMap =
    provider === "GOETHE" ? MOCK_MAX_PER_SKILL_GOETHE : MOCK_MAX_PER_SKILL;

  for (const skill of skillOrder) {
    const skillExercises = exercises.filter((e) => e.skill === skill);
    if (!skillExercises.length) continue;
    let remaining = maxMap[skill] ?? 3;

    for (const exercise of skillExercises) {
      if (remaining <= 0) break;
      remaining -= pushFromExercise(items, exercise, remaining);
    }
  }

  return items;
}

export function summarizeMock(
  exercises: ExamExercise[],
  provider?: ExamProvider,
) {
  const skills = [...new Set(exercises.map((e) => e.skill))];
  const maxMap =
    provider === "GOETHE" ? MOCK_MAX_PER_SKILL_GOETHE : MOCK_MAX_PER_SKILL;
  const itemEstimate = exercises.reduce(
    (sum, e) =>
      sum + Math.min(exerciseItemCount(e), maxMap[e.skill] ?? 3),
    0,
  );
  return { skills, itemEstimate };
}
