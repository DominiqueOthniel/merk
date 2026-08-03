export type QualityLabel = "HARD" | "MEDIUM" | "EASY";

export type CardSrsStatus = "NEW" | "LEARNING" | "REVIEW" | "RELEARNING";

export type SchedulerState = {
  status: CardSrsStatus;
  learningStep: number;
  lapses: number;
  easeFactor: number;
  intervalDays: number;
  repetitions: number;
};

export type SchedulerResult = SchedulerState & {
  nextReviewAt: Date;
  qualityScore: number;
  /** Human label for UI under rating buttons */
  intervalLabel: string;
};
