import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { answersMatch } from "@/lib/normalize";
import { PLACEMENT_ITEMS } from "@/lib/content/cards-de";
import { assignReviewCards } from "@/lib/assign-cards";
import {
  isCefrLevel,
  levelsBetween,
  levelsUpTo,
} from "@/lib/cefr";
import { normalizeExamProvider } from "@/lib/exam-provider";
import type { CefrLevel } from "@/lib/types";

function scoreToLevel(correct: number, total: number): CefrLevel {
  const ratio = correct / total;
  if (ratio < 0.35) return "A1";
  if (ratio < 0.55) return "A2";
  if (ratio < 0.75) return "B1";
  if (ratio < 0.9) return "B2";
  return "C1";
}

export async function GET() {
  return NextResponse.json({
    items: PLACEMENT_ITEMS.map((item, i) => ({
      id: i,
      prompt: item.prompt,
      level: item.level,
    })),
  });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non authentifie" }, { status: 401 });
  }

  const body = await req.json();
  const answers: string[] = Array.isArray(body.answers) ? body.answers : [];

  let correct = 0;
  PLACEMENT_ITEMS.forEach((item, i) => {
    if (answersMatch(answers[i] ?? "", item.answer)) correct += 1;
  });

  const level = scoreToLevel(correct, PLACEMENT_ITEMS.length);
  const now = new Date();

  const current = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { examProvider: true, targetLevel: true },
  });
  const provider = normalizeExamProvider(current?.examProvider);
  const target = isCefrLevel(current?.targetLevel)
    ? current!.targetLevel
    : level;

  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      cefrLevel: level,
      targetLevel: target,
      placedAt: now,
    },
  });

  const levels = isCefrLevel(target)
    ? levelsBetween(level, target)
    : levelsUpTo(level);

  const cardsAssigned = await assignReviewCards({
    userId: session.user.id,
    levels,
    provider,
    now,
  });

  return NextResponse.json({
    level,
    targetLevel: target,
    correct,
    total: PLACEMENT_ITEMS.length,
    cardsAssigned,
  });
}
