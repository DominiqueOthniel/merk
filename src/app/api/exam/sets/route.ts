import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import {
  EXAM_CARD_KINDS,
  exerciseItemCount,
  getExamExercises,
  getExamLevels,
  sectionSortKey,
} from "@/lib/content/exam-catalog";
import { ensureGoetheCards } from "@/lib/content/ensure-goethe-cards";
import {
  examProviderLabel,
  examSourcePrefix,
  normalizeExamProvider,
} from "@/lib/exam-provider";

function sourceIdFromRef(ref: string | null | undefined, prefix: string): string | null {
  if (!ref?.startsWith(prefix)) return null;
  const rest = ref.slice(prefix.length);
  const lastColon = rest.lastIndexOf(":");
  if (lastColon <= 0) return null;
  return rest.slice(0, lastColon);
}

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non authentifie" }, { status: 401 });
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { examProvider: true },
  });
  const provider = normalizeExamProvider(
    dbUser?.examProvider ?? session.user.examProvider,
  );
  const levels = getExamLevels(provider);
  const prefix = examSourcePrefix(provider);

  const level = new URL(req.url).searchParams.get("level") || "B1";
  const levelInfo = levels.find((l) => l.id === level) ?? levels[0];

  if (!levelInfo.available) {
    return NextResponse.json({
      exam: provider,
      examLabel: examProviderLabel(provider),
      level: levelInfo.id,
      levels,
      available: false,
      note: levelInfo.note,
      sections: [],
      totalDue: 0,
    });
  }

  if (provider === "GOETHE") {
    await ensureGoetheCards();
  }

  const exercises = getExamExercises(provider, levelInfo.id);
  const now = new Date();

  const cards = await prisma.card.findMany({
    where: {
      kind: { in: [...EXAM_CARD_KINDS] },
      level: levelInfo.id,
      sourceRef: { startsWith: prefix },
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
    const sourceId = sourceIdFromRef(card.sourceRef, prefix);
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
    exam: provider,
    examLabel: examProviderLabel(provider),
    level: levelInfo.id,
    levels,
    available: true,
    sections: bySection,
    totalDue: sets.reduce((s, x) => s + x.dueCount, 0),
  });
}
