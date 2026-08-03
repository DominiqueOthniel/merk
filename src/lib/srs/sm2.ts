export type {
  QualityLabel,
  CardSrsStatus,
  SchedulerState,
  SchedulerResult,
} from "./types";

export {
  applySm2,
  qualityToScore,
  scheduleCard,
  previewIntervals,
  formatIntervalLabel,
  LEARNING_STEPS_MIN,
  REVIEW_CAP,
  NEW_CAP,
} from "./scheduler";

import type { SchedulerResult, SchedulerState } from "./types";

/** Legacy aliases used by older imports. */
export type Sm2State = Pick<
  SchedulerState,
  "easeFactor" | "intervalDays" | "repetitions"
>;

export type Sm2Result = Pick<
  SchedulerResult,
  "easeFactor" | "intervalDays" | "repetitions" | "nextReviewAt" | "qualityScore"
>;
