import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { answersMatch } from "@/lib/normalize";
import { PLACEMENT_ITEMS } from "@/lib/content/cards-de";
import type { CefrLevel } from "@/lib/types";

function scoreToLevel(correct: number, total: number): CefrLevel {
  const ratio = correct / total;
  if (ratio < 0.35) return "A1";
  if (ratio < 0.55) return "A2";
  if (ratio < 0.75) return "B1";
  if (ratio < 0.9) return "B2";
  return "C1";
}

function levelsUpTo(level: CefrLevel): CefrLevel[] {
  const order: CefrLevel[] = ["A1", "A2", "B1", "B2", "C1"];
  const idx = order.indexOf(level);
  return order.slice(0, Math.max(1, idx + 1));
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

  await prisma.user.update({
    where: { id: session.user.id },
    data: { cefrLevel: level, placedAt: now },
  });

  const assignLevels = levelsUpTo(level);
  const cards = await prisma.card.findMany({
    where: { language: "de", level: { in: assignLevels } },
  });

  for (const card of cards) {
    await prisma.cardProgress.upsert({
      where: {
        userId_cardId: { userId: session.user.id, cardId: card.id },
      },
      create: {
        userId: session.user.id,
        cardId: card.id,
        nextReviewAt: now,
      },
      update: {},
    });
  }

  return NextResponse.json({
    level,
    correct,
    total: PLACEMENT_ITEMS.length,
    cardsAssigned: cards.length,
  });
}
