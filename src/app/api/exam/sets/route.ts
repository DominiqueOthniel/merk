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
  const sets = [];

  for (const exercise of exercises) {
    const cards = await prisma.card.findMany({
      where: {
        kind: { in: [...EXAM_CARD_KINDS] },
        level: exercise.level,
        sourceRef: { startsWith: `deuropa:${exercise.sourceId}:` },
      },
      include: {
        progress: {
          where: { userId: session.user.id },
        },
      },
    });

    const due = cards.filter(
      (c) => c.progress[0] && c.progress[0].nextReviewAt <= now
    ).length;
    const done = cards.filter((c) => (c.progress[0]?.repetitions ?? 0) >= 1).length;

    sets.push({
      sourceId: exercise.sourceId,
      title: exercise.sourceTitle,
      section: exercise.section,
      skill: exercise.skill,
      format: exercise.format,
      level: exercise.level,
      pairCount: exerciseItemCount(exercise),
      dueCount: due,
      doneCount: done,
      totalAssigned: cards.length,
    });
  }

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
