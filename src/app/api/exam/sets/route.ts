import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import {
  EXAM_CARD_KINDS,
  EXAM_LEVELS,
  exerciseItemCount,
  getExamExercises,
  sectionSortKey,
} from "@/lib/content/exam-catalog";

function sourceIdFromRef(ref: string | null | undefined): string | null {
  if (!ref?.startsWith("deuropa:")) return null;
  const rest = ref.slice("deuropa:".length);
  const lastColon = rest.lastIndexOf(":");
  if (lastColon <= 0) return null;
  return rest.slice(0, lastColon);
}

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non authentifie" }, { status: 401 });
  }

  const level = new URL(req.url).searchParams.get("level") || "B1";
  const levelInfo = EXAM_LEVELS.find((l) => l.id === level) ?? EXAM_LEVELS[0];

  if (!levelInfo.available) {
    return NextResponse.json({
      exam: "TELC",
      level: levelInfo.id,
      levels: EXAM_LEVELS,
      available: false,
      note: levelInfo.note,
      sections: [],
      totalDue: 0,
    });
  }

  const exercises = getExamExercises(levelInfo.id);
  const now = new Date();

  // Une seule requete pour tout le niveau (evite N+1 : B2 = 373 roundtrips avant)
  const cards = await prisma.card.findMany({
    where: {
      kind: { in: [...EXAM_CARD_KINDS] },
      level: levelInfo.id,
      sourceRef: { startsWith: "deuropa:" },
    },
    select: {
      id: true,
      sourceRef: true,
      progress: {
        where: { userId: session.user.id },
        select: { nextReviewAt: true, repetitions: true },
      },
    },
  });

  const statsBySource = new Map<
    string,
    { total: number; due: number; done: number }
  >();

  for (const card of cards) {
    const sourceId = sourceIdFromRef(card.sourceRef);
    if (!sourceId) continue;

    let stats = statsBySource.get(sourceId);
    if (!stats) {
      stats = { total: 0, due: 0, done: 0 };
      statsBySource.set(sourceId, stats);
    }

    stats.total += 1;
    const progress = card.progress[0];
    if (progress && progress.nextReviewAt <= now) stats.due += 1;
    if ((progress?.repetitions ?? 0) >= 1) stats.done += 1;
  }

  const sets = exercises.map((exercise) => {
    const stats = statsBySource.get(exercise.sourceId) ?? {
      total: 0,
      due: 0,
      done: 0,
    };
    return {
      sourceId: exercise.sourceId,
      title: exercise.sourceTitle,
      section: exercise.section,
      skill: exercise.skill,
      format: exercise.format,
      level: exercise.level,
      pairCount: exerciseItemCount(exercise),
      dueCount: stats.due,
      doneCount: stats.done,
      totalAssigned: stats.total,
    };
  });

  const bySection = Object.values(
    sets.reduce<Record<string, { section: string; sets: typeof sets; due: number }>>(
      (acc, set) => {
        if (!acc[set.section]) {
          acc[set.section] = { section: set.section, sets: [], due: 0 };
        }
        acc[set.section].sets.push(set);
        acc[set.section].due += set.dueCount;
        return acc;
      },
      {}
    )
  ).sort(
    (a, b) =>
      sectionSortKey(a.section) - sectionSortKey(b.section) ||
      a.section.localeCompare(b.section, "de")
  );

  return NextResponse.json({
    exam: "TELC",
    level: levelInfo.id,
    levels: EXAM_LEVELS,
    available: true,
    sections: bySection,
    totalDue: sets.reduce((s, x) => s + x.dueCount, 0),
  });
}
