import { scheduleCard, LEARNING_STEPS_MIN, REVIEW_CAP, NEW_CAP } from "./scheduler";
import type { QualityLabel, SchedulerState } from "./types";
import {
  burySiblingCards,
  noteKeyFromSourceRef,
  buildReviewQueue,
} from "./queue";

function assert(cond: unknown, msg: string) {
  if (!cond) throw new Error(msg);
}

function baseState(partial: Partial<SchedulerState> = {}): SchedulerState {
  return {
    status: "NEW",
    learningStep: 0,
    lapses: 0,
    easeFactor: 2.5,
    intervalDays: 0,
    repetitions: 0,
    ...partial,
  };
}

function minutesFrom(now: Date, next: Date): number {
  return Math.round((next.getTime() - now.getTime()) / 60_000);
}

const now = new Date("2026-08-03T12:00:00.000Z");

// New → learning on fail
{
  const r = scheduleCard(baseState(), "HARD", now);
  assert(r.status === "LEARNING", "NEW HARD → LEARNING");
  assert(r.learningStep === 0, "step 0");
  assert(minutesFrom(now, r.nextReviewAt) === LEARNING_STEPS_MIN[0], "1 min");
}

// New → advance learning on success (step 0 → step 1)
{
  const r = scheduleCard(baseState(), "MEDIUM", now);
  assert(r.status === "LEARNING", "NEW MEDIUM → LEARNING");
  assert(r.learningStep === 1, "step 1 after first success");
  assert(minutesFrom(now, r.nextReviewAt) === LEARNING_STEPS_MIN[1], "10 min");
}

// Graduate after step 1 success
{
  const r = scheduleCard(
    baseState({ status: "LEARNING", learningStep: 1 }),
    "EASY",
    now
  );
  assert(r.status === "REVIEW", "graduate");
  assert(r.repetitions === 1, "reps 1");
  assert(r.intervalDays === 2, "easy graduate 2d");
}

// Review fail → relearning + lapse
{
  const r = scheduleCard(
    baseState({
      status: "REVIEW",
      repetitions: 3,
      intervalDays: 7,
      easeFactor: 2.5,
    }),
    "HARD",
    now
  );
  assert(r.status === "RELEARNING", "review hard → relearning");
  assert(r.lapses === 1, "lapse++");
  assert(minutesFrom(now, r.nextReviewAt) === 1, "1 min relearn");
}

// Review success ladder
{
  const r = scheduleCard(
    baseState({ status: "REVIEW", repetitions: 1, intervalDays: 1 }),
    "MEDIUM",
    now
  );
  assert(r.status === "REVIEW", "stays review");
  assert(r.intervalDays === 3, "second success → 3d");
  assert(r.repetitions === 2, "reps 2");
}

// Sibling bury
{
  const cards = [
    { id: "a", sourceRef: "note:1:0" },
    { id: "b", sourceRef: "note:1:1" },
    { id: "c", sourceRef: "note:2:0" },
    { id: "d", sourceRef: null },
  ];
  const buried = burySiblingCards(cards);
  assert(buried.map((c) => c.id).join(",") === "a,c,d", "bury siblings");
  assert(noteKeyFromSourceRef("telc:ex:3") === "telc:ex", "note key");
}

// Queue order and caps
{
  const mk = (
    id: string,
    status: string,
    level: string,
    sourceRef: string | null = null
  ) => ({
    id,
    cardId: id,
    status,
    learningStep: 0,
    lapses: 0,
    easeFactor: 2.5,
    intervalDays: 0,
    repetitions: status === "REVIEW" ? 2 : 0,
    nextReviewAt: new Date(now.getTime() - 60_000),
    createdAt: now,
    card: {
      prompt: "x ___",
      context: "c",
      hint: null,
      level,
      sourceRef,
      theme: { nameFr: "T" },
    },
  });

  const rows = [
    mk("n1", "NEW", "A1"),
    mk("n2", "NEW", "A1"),
    mk("r1", "REVIEW", "A2"),
    mk("l1", "LEARNING", "A1"),
    mk("r2", "REVIEW", "B1", "same:0"),
    mk("r3", "REVIEW", "B1", "same:1"),
  ];

  const q = buildReviewQueue(rows, now, { review: 2, new: 1 });
  assert(q.cards[0].progressId === "l1", "learning first");
  assert(q.counts.learning === 1, "1 learning");
  assert(q.counts.review === 2, "review capped at 2 (with bury)");
  assert(q.counts.new === 1, "new capped at 1");
  assert(
    q.cards.some((c) => c.progressId === "r2") &&
      !q.cards.some((c) => c.progressId === "r3"),
    "sibling buried in review"
  );
  assert(REVIEW_CAP === 20 && NEW_CAP === 8, "default caps");
}

console.log("scheduler + queue tests OK");
