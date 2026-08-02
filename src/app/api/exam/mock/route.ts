import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import {
  buildMockItems,
  mockDurationLabel,
  mockDurationMinutes,
  mockSkillLabels,
  type MockLevel,
} from "@/lib/content/mock-exam";
import { ensureExamCards } from "@/lib/content/ensure-exam-cards";
import { ensureSpeakCards } from "@/lib/content/ensure-speak-cards";
import {
  examProviderLabel,
  normalizeExamProvider,
} from "@/lib/exam-provider";

function toLevel(raw: string | null): MockLevel {
  if (raw === "A1" || raw === "A2" || raw === "B2" || raw === "C1") return raw;
  return "B1";
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
  const level = toLevel(new URL(req.url).searchParams.get("level"));

  await ensureExamCards(provider);
  await ensureSpeakCards();

  const items = buildMockItems(provider, level);
  const skills = [...new Set(items.map((i) => i.skill))];

  return NextResponse.json({
    exam: provider,
    examLabel: examProviderLabel(provider),
    level,
    title: `${examProviderLabel(provider)} ${level} · Mock Test`,
    durationMinutes: mockDurationMinutes(level),
    durationLabel: mockDurationLabel(level),
    skills: mockSkillLabels(skills, provider),
    itemCount: items.length,
    features: [
      "Simulation chronometree",
      "Score detaille par competence",
      "Feedback IA dispo en mode pratique (Sprechen)",
    ],
    // Reponses incluses pour scoring local (entrainement, pas examen officiel)
    items,
  });
}
