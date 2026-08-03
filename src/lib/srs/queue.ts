import type { CardSrsStatus } from "./types";
import { NEW_CAP, REVIEW_CAP, previewIntervals } from "./scheduler";

export { NEW_CAP, REVIEW_CAP };

export type QueueCardSelect = {
  id: string;
  cardId: string;
  status: string;
  learningStep: number;
  lapses: number;
  easeFactor: number;
  intervalDays: number;
  repetitions: number;
  nextReviewAt: Date;
  createdAt: Date;
  card: {
    prompt: string;
    context: string;
    hint: string | null;
    level: string;
    sourceRef: string | null;
    theme: { nameFr: string };
  };
};

export type QueueCardDto = {
  progressId: string;
  cardId: string;
  queueKind: "learning" | "review" | "new";
  status: CardSrsStatus;
  prompt: string;
  context: string;
  hint: string | null;
  theme: string;
  level: string;
  sourceRef: string | null;
  intervals: { HARD: string; MEDIUM: string; EASY: string };
};

/** Note key for sibling bury: everything before the last `:index`. */
export function noteKeyFromSourceRef(sourceRef: string | null | undefined): string | null {
  if (!sourceRef) return null;
  const idx = sourceRef.lastIndexOf(":");
  if (idx <= 0) return sourceRef;
  return sourceRef.slice(0, idx);
}

/**
 * Keep at most one card per note group (sourceRef prefix).
 * First occurrence wins (caller should pre-sort by priority).
 */
export function burySiblingCards<T extends { sourceRef?: string | null }>(
  cards: T[]
): T[] {
  const seen = new Set<string>();
  const out: T[] = [];
  for (const card of cards) {
    const key = noteKeyFromSourceRef(card.sourceRef ?? null);
    if (!key) {
      out.push(card);
      continue;
    }
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(card);
  }
  return out;
}

function toDto(
  row: QueueCardSelect,
  queueKind: QueueCardDto["queueKind"],
  now: Date
): QueueCardDto {
  const status = row.status as CardSrsStatus;
  return {
    progressId: row.id,
    cardId: row.cardId,
    queueKind,
    status,
    prompt: row.card.prompt,
    context: row.card.context,
    hint: row.card.hint,
    theme: row.card.theme.nameFr,
    level: row.card.level,
    sourceRef: row.card.sourceRef,
    intervals: previewIntervals(
      {
        status,
        learningStep: row.learningStep,
        lapses: row.lapses,
        easeFactor: row.easeFactor,
        intervalDays: row.intervalDays,
        repetitions: row.repetitions,
      },
      now
    ),
  };
}

function noteUnused(
  sourceRef: string | null,
  usedNotes: Set<string>
): boolean {
  const key = noteKeyFromSourceRef(sourceRef);
  if (!key) return true;
  return !usedNotes.has(key);
}

function markNote(sourceRef: string | null, usedNotes: Set<string>) {
  const key = noteKeyFromSourceRef(sourceRef);
  if (key) usedNotes.add(key);
}

export type BuiltQueue = {
  cards: QueueCardDto[];
  counts: {
    learning: number;
    review: number;
    new: number;
    reviewBacklog: number;
    newBacklog: number;
  };
  caps: { review: number; new: number };
};

/**
 * Build today's Anki-style queue:
 * learning/relearning due → review due (cap) → new (cap), with sibling bury.
 */
export function buildReviewQueue(
  rows: QueueCardSelect[],
  now: Date = new Date(),
  caps: { review: number; new: number } = { review: REVIEW_CAP, new: NEW_CAP }
): BuiltQueue {
  const usedNotes = new Set<string>();

  const learningRows = rows
    .filter(
      (r) =>
        (r.status === "LEARNING" || r.status === "RELEARNING") &&
        r.nextReviewAt <= now
    )
    .sort((a, b) => a.nextReviewAt.getTime() - b.nextReviewAt.getTime());

  const reviewRows = rows
    .filter((r) => r.status === "REVIEW" && r.nextReviewAt <= now)
    .sort((a, b) => a.nextReviewAt.getTime() - b.nextReviewAt.getTime());

  const newRows = rows
    .filter((r) => r.status === "NEW")
    .sort((a, b) => {
      const levelCmp = a.card.level.localeCompare(b.card.level);
      if (levelCmp !== 0) return levelCmp;
      return a.createdAt.getTime() - b.createdAt.getTime();
    });

  const learningDto = burySiblingCards(
    learningRows.map((r) => toDto(r, "learning", now))
  );
  for (const c of learningDto) markNote(c.sourceRef, usedNotes);

  const reviewFiltered = reviewRows
    .map((r) => toDto(r, "review", now))
    .filter((c) => noteUnused(c.sourceRef, usedNotes));
  const reviewDto = burySiblingCards(reviewFiltered).slice(0, caps.review);
  for (const c of reviewDto) markNote(c.sourceRef, usedNotes);

  const newFiltered = newRows
    .map((r) => toDto(r, "new", now))
    .filter((c) => noteUnused(c.sourceRef, usedNotes));
  const newDto = burySiblingCards(newFiltered).slice(0, caps.new);

  return {
    cards: [...learningDto, ...reviewDto, ...newDto],
    counts: {
      learning: learningDto.length,
      review: reviewDto.length,
      new: newDto.length,
      reviewBacklog: Math.max(0, reviewRows.length - reviewDto.length),
      newBacklog: Math.max(0, newRows.length - newDto.length),
    },
    caps,
  };
}
