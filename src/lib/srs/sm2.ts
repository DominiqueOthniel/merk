export type QualityLabel = "HARD" | "MEDIUM" | "EASY";

export type Sm2State = {
  easeFactor: number;
  intervalDays: number;
  repetitions: number;
};

export type Sm2Result = Sm2State & {
  nextReviewAt: Date;
  qualityScore: number;
};

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

/**
 * SM-2 style spaced repetition.
 * Base ladder ~1 / 3 / 7 / 21 days when succeeding, shortened on HARD.
 */
export function applySm2(
  state: Sm2State,
  quality: QualityLabel,
  now: Date = new Date()
): Sm2Result {
  const q = qualityToScore(quality);
  let { easeFactor, intervalDays, repetitions } = state;

  easeFactor = Math.max(
    1.3,
    easeFactor + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
  );

  if (q < 3) {
    repetitions = 0;
    intervalDays = quality === "HARD" ? 0 : 1;
  } else {
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
  }

  const nextReviewAt = new Date(now);
  nextReviewAt.setDate(nextReviewAt.getDate() + intervalDays);
  if (intervalDays === 0) {
    nextReviewAt.setHours(now.getHours(), now.getMinutes() + 10, 0, 0);
  }

  return {
    easeFactor,
    intervalDays,
    repetitions,
    nextReviewAt,
    qualityScore: q,
  };
}
