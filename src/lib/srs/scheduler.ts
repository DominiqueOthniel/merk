import type {
  CardSrsStatus,
  QualityLabel,
  SchedulerResult,
  SchedulerState,
} from "./types";

/** Learning / relearning steps in minutes before graduation. */
export const LEARNING_STEPS_MIN = [1, 10] as const;

export const REVIEW_CAP = 20;
export const NEW_CAP = 8;

/** Map UI labels to SM-2 quality (0-5). */
export function qualityToScore(quality: QualityLabel): number {
  switch (quality) {
    case "HARD":
      return 2;
    case "MEDIUM":
      return 3;
    case "EASY":
      return 5;
  }
}

function addMinutes(now: Date, minutes: number): Date {
  const d = new Date(now);
  d.setMinutes(d.getMinutes() + minutes, 0, 0);
  return d;
}

function addDays(now: Date, days: number): Date {
  const d = new Date(now);
  d.setDate(d.getDate() + days);
  return d;
}

export function formatIntervalLabel(nextReviewAt: Date, now: Date = new Date()): string {
  const ms = nextReviewAt.getTime() - now.getTime();
  if (ms <= 0) return "maintenant";
  const minutes = Math.round(ms / 60_000);
  if (minutes < 60) return `${Math.max(1, minutes)} min`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} h`;
  const days = Math.round(hours / 24);
  return `${days} j`;
}

function adjustEase(easeFactor: number, q: number): number {
  return Math.max(1.3, easeFactor + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02)));
}

/** Preview next intervals for HARD / MEDIUM / EASY without mutating. */
export function previewIntervals(
  state: SchedulerState,
  now: Date = new Date()
): Record<QualityLabel, string> {
  return {
    HARD: formatIntervalLabel(scheduleCard(state, "HARD", now).nextReviewAt, now),
    MEDIUM: formatIntervalLabel(scheduleCard(state, "MEDIUM", now).nextReviewAt, now),
    EASY: formatIntervalLabel(scheduleCard(state, "EASY", now).nextReviewAt, now),
  };
}

function enterLearning(
  state: SchedulerState,
  q: number,
  now: Date,
  asRelearning: boolean
): SchedulerResult {
  const easeFactor = adjustEase(state.easeFactor, q);
  const status: CardSrsStatus = asRelearning ? "RELEARNING" : "LEARNING";
  const nextReviewAt = addMinutes(now, LEARNING_STEPS_MIN[0]);
  return {
    status,
    learningStep: 0,
    lapses: asRelearning ? state.lapses + (state.status === "REVIEW" ? 1 : 0) : state.lapses,
    easeFactor,
    intervalDays: 0,
    repetitions: 0,
    nextReviewAt,
    qualityScore: q,
    intervalLabel: formatIntervalLabel(nextReviewAt, now),
  };
}

function advanceLearning(
  state: SchedulerState,
  quality: QualityLabel,
  q: number,
  now: Date
): SchedulerResult {
  const easeFactor = adjustEase(state.easeFactor, q);
  const failed = q < 3 || quality === "HARD";

  if (failed) {
    const nextReviewAt = addMinutes(now, LEARNING_STEPS_MIN[0]);
    return {
      status: state.status === "RELEARNING" ? "RELEARNING" : "LEARNING",
      learningStep: 0,
      lapses: state.lapses,
      easeFactor,
      intervalDays: 0,
      repetitions: 0,
      nextReviewAt,
      qualityScore: q,
      intervalLabel: formatIntervalLabel(nextReviewAt, now),
    };
  }

  const nextStep = state.learningStep + 1;
  if (nextStep < LEARNING_STEPS_MIN.length) {
    const nextReviewAt = addMinutes(now, LEARNING_STEPS_MIN[nextStep]);
    return {
      status: state.status === "RELEARNING" ? "RELEARNING" : "LEARNING",
      learningStep: nextStep,
      lapses: state.lapses,
      easeFactor,
      intervalDays: 0,
      repetitions: 0,
      nextReviewAt,
      qualityScore: q,
      intervalLabel: formatIntervalLabel(nextReviewAt, now),
    };
  }

  // Graduate to review
  let intervalDays = quality === "EASY" ? 2 : 1;
  const nextReviewAt = addDays(now, intervalDays);
  return {
    status: "REVIEW",
    learningStep: 0,
    lapses: state.lapses,
    easeFactor,
    intervalDays,
    repetitions: 1,
    nextReviewAt,
    qualityScore: q,
    intervalLabel: formatIntervalLabel(nextReviewAt, now),
  };
}

function scheduleReview(
  state: SchedulerState,
  quality: QualityLabel,
  q: number,
  now: Date
): SchedulerResult {
  let { easeFactor, intervalDays, repetitions } = state;
  easeFactor = adjustEase(easeFactor, q);

  if (q < 3 || quality === "HARD") {
    const nextReviewAt = addMinutes(now, LEARNING_STEPS_MIN[0]);
    return {
      status: "RELEARNING",
      learningStep: 0,
      lapses: state.lapses + 1,
      easeFactor,
      intervalDays: 0,
      repetitions: 0,
      nextReviewAt,
      qualityScore: q,
      intervalLabel: formatIntervalLabel(nextReviewAt, now),
    };
  }

  if (repetitions === 0) {
    intervalDays = 1;
  } else if (repetitions === 1) {
    intervalDays = 3;
  } else if (repetitions === 2) {
    intervalDays = 7;
  } else if (repetitions === 3) {
    intervalDays = Math.max(21, Math.round(intervalDays * easeFactor));
  } else {
    intervalDays = Math.max(1, Math.round(intervalDays * easeFactor));
  }
  repetitions += 1;

  if (quality === "EASY") {
    intervalDays = Math.max(intervalDays + 1, Math.round(intervalDays * 1.15));
  }

  const nextReviewAt = addDays(now, intervalDays);
  return {
    status: "REVIEW",
    learningStep: 0,
    lapses: state.lapses,
    easeFactor,
    intervalDays,
    repetitions,
    nextReviewAt,
    qualityScore: q,
    intervalLabel: formatIntervalLabel(nextReviewAt, now),
  };
}

/**
 * Anki-style scheduler: learning steps then SM-2 review ladder.
 * Base review ladder ~1 / 3 / 7 / 21+ days when succeeding.
 */
export function scheduleCard(
  state: SchedulerState,
  quality: QualityLabel,
  now: Date = new Date()
): SchedulerResult {
  const q = qualityToScore(quality);
  const status = state.status;

  if (status === "NEW") {
    // First answer introduces the card into learning
    if (q < 3 || quality === "HARD") {
      return enterLearning(state, q, now, false);
    }
    // Treat first success as completing step 0 then advancing
    return advanceLearning(
      { ...state, status: "LEARNING", learningStep: 0 },
      quality,
      q,
      now
    );
  }

  if (status === "LEARNING" || status === "RELEARNING") {
    return advanceLearning(state, quality, q, now);
  }

  return scheduleReview(state, quality, q, now);
}

/** @deprecated Prefer scheduleCard. Kept for gradual imports. */
export function applySm2(
  state: Pick<SchedulerState, "easeFactor" | "intervalDays" | "repetitions">,
  quality: QualityLabel,
  now: Date = new Date()
) {
  return scheduleCard(
    {
      status: state.repetitions > 0 ? "REVIEW" : "LEARNING",
      learningStep: 0,
      lapses: 0,
      easeFactor: state.easeFactor,
      intervalDays: state.intervalDays,
      repetitions: state.repetitions,
    },
    quality,
    now
  );
}
