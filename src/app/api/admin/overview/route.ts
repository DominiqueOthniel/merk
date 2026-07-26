import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { subDays } from "date-fns";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "CENTER_ADMIN") {
    return NextResponse.json({ error: "Acces refuse" }, { status: 403 });
  }

  const admin = await prisma.user.findUnique({
    where: { id: session.user.id },
  });
  if (!admin?.centreId) {
    return NextResponse.json({ error: "Centre manquant" }, { status: 400 });
  }

  const centre = await prisma.centre.findUnique({
    where: { id: admin.centreId },
    include: {
      cohorts: { orderBy: { name: "asc" } },
    },
  });

  const students = await prisma.user.findMany({
    where: { centreId: admin.centreId, role: "STUDENT" },
    include: {
      cohorte: true,
      reviewLogs: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
      prepScores: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
      _count: {
        select: { reviewLogs: true, cardProgress: true },
      },
    },
    orderBy: { name: "asc" },
  });

  const inactiveThreshold = subDays(new Date(), 7);

  const rows = students.map((s) => {
    const lastReview = s.reviewLogs[0]?.createdAt ?? null;
    const inactive = !lastReview || lastReview < inactiveThreshold;
    const recentLogsPromise = s._count.reviewLogs;

    return {
      id: s.id,
      name: s.name,
      email: s.email,
      cefrLevel: s.cefrLevel,
      cohorte: s.cohorte?.name ?? "Sans cohorte",
      cohorteId: s.cohorteId,
      streakDays: s.streakDays,
      totalPoints: s.totalPoints,
      cardsAssigned: s._count.cardProgress,
      reviewsTotal: recentLogsPromise,
      lastReviewAt: lastReview,
      prepScore: s.prepScores[0]?.value ?? null,
      inactive,
    };
  });

  const byCohort = centre?.cohorts.map((c) => {
    const members = rows.filter((r) => r.cohorteId === c.id);
    const inactiveCount = members.filter((m) => m.inactive).length;
    const avgPrep =
      members.length === 0
        ? null
        : Math.round(
            members.reduce((sum, m) => sum + (m.prepScore ?? 0), 0) /
              members.length
          );
    return {
      id: c.id,
      name: c.name,
      nextSessionAt: c.nextSessionAt,
      studentCount: members.length,
      inactiveCount,
      avgPrepScore: avgPrep,
    };
  });

  return NextResponse.json({
    centre: { id: centre?.id, name: centre?.name },
    cohorts: byCohort ?? [],
    students: rows,
    alerts: rows.filter((r) => r.inactive),
  });
}
