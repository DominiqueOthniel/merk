import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { EXAM_TELC_B1 } from "@/lib/content/exam-telc-b1";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non authentifie" }, { status: 401 });
  }

  const now = new Date();
  const sets = [];

  for (const exercise of EXAM_TELC_B1) {
    const cards = await prisma.card.findMany({
      where: {
        kind: "MATCH",
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
      level: exercise.level,
      pairCount: exercise.pairs.length,
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
  );

  return NextResponse.json({
    exam: "TELC",
    level: "B1",
    sections: bySection,
    totalDue: sets.reduce((s, x) => s + x.dueCount, 0),
  });
}
