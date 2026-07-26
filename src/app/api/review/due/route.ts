import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non authentifie" }, { status: 401 });
  }

  const now = new Date();
  const due = await prisma.cardProgress.findMany({
    where: {
      userId: session.user.id,
      nextReviewAt: { lte: now },
    },
    include: {
      card: { include: { theme: true } },
    },
    orderBy: { nextReviewAt: "asc" },
    take: 20,
  });

  return NextResponse.json({
    count: due.length,
    cards: due.map((p) => ({
      progressId: p.id,
      cardId: p.cardId,
      prompt: p.card.prompt,
      context: p.card.context,
      hint: p.card.hint,
      theme: p.card.theme.nameFr,
      level: p.card.level,
    })),
  });
}
