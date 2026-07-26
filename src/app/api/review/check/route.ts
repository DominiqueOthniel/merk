import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { answersMatch } from "@/lib/normalize";

const schema = z.object({
  progressId: z.string(),
  answer: z.string(),
});

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non authentifie" }, { status: 401 });
  }

  try {
    const data = schema.parse(await req.json());
    const progress = await prisma.cardProgress.findFirst({
      where: { id: data.progressId, userId: session.user.id },
      include: { card: true },
    });
    if (!progress) {
      return NextResponse.json({ error: "Carte introuvable" }, { status: 404 });
    }

    const correct = answersMatch(data.answer, progress.card.answer);
    return NextResponse.json({
      correct,
      expected: progress.card.answer,
      context: progress.card.context,
    });
  } catch {
    return NextResponse.json({ error: "Donnees invalides" }, { status: 400 });
  }
}
