import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { assignReviewCards } from "@/lib/assign-cards";
import {
  isCefrLevel,
  levelsBetween,
} from "@/lib/cefr";
import { ensureSchema } from "@/lib/ensure-schema";
import { normalizeExamProvider } from "@/lib/exam-provider";
import type { CefrLevel } from "@/lib/types";

const cefrSchema = z.enum(["A1", "A2", "B1", "B2", "C1"]);

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  centreId: z.string().min(1),
  cohorteId: z.string().optional().nullable(),
  examProvider: z.enum(["TELC", "GOETHE"]).optional(),
  currentLevel: cefrSchema,
  targetLevel: cefrSchema,
  motivation: z.string().max(80).optional().nullable(),
});

export async function POST(req: Request) {
  try {
    try {
      await ensureSchema();
    } catch {
      // continue si la colonne existe deja
    }

    const body = await req.json();
    const data = schema.parse(body);

    const centre = await prisma.centre.findUnique({
      where: { id: data.centreId },
    });
    if (!centre) {
      return NextResponse.json({ error: "Centre introuvable" }, { status: 400 });
    }

    if (data.cohorteId) {
      const cohort = await prisma.cohorte.findFirst({
        where: { id: data.cohorteId, centreId: data.centreId },
      });
      if (!cohort) {
        return NextResponse.json({ error: "Cohorte introuvable" }, { status: 400 });
      }
    }

    const exists = await prisma.user.findUnique({
      where: { email: data.email.toLowerCase().trim() },
    });
    if (exists) {
      return NextResponse.json({ error: "Email deja utilise" }, { status: 409 });
    }

    const currentLevel = data.currentLevel as CefrLevel;
    let targetLevel = data.targetLevel as CefrLevel;
    if (!isCefrLevel(currentLevel) || !isCefrLevel(targetLevel)) {
      return NextResponse.json({ error: "Niveaux invalides" }, { status: 400 });
    }

    // Le niveau vise ne peut pas etre en dessous du niveau actuel
    const order = ["A1", "A2", "B1", "B2", "C1"];
    if (order.indexOf(targetLevel) < order.indexOf(currentLevel)) {
      targetLevel = currentLevel;
    }

    const now = new Date();
    const examProvider = normalizeExamProvider(data.examProvider);
    const passwordHash = await bcrypt.hash(data.password, 10);

    const user = await prisma.user.create({
      data: {
        name: data.name.trim(),
        email: data.email.toLowerCase().trim(),
        passwordHash,
        role: "STUDENT",
        centreId: data.centreId,
        cohorteId: data.cohorteId || null,
        language: "de",
        examProvider,
        cefrLevel: currentLevel,
        targetLevel,
        placedAt: now,
      },
    });

    const levels = levelsBetween(currentLevel, targetLevel);
    const cardsAssigned = await assignReviewCards({
      userId: user.id,
      levels,
      provider: examProvider,
      now,
    });

    return NextResponse.json({
      id: user.id,
      email: user.email,
      cefrLevel: currentLevel,
      targetLevel,
      cardsAssigned,
      placedAt: now.toISOString(),
    });
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: "Donnees invalides" }, { status: 400 });
    }
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
