import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { normalizeExamProvider } from "@/lib/exam-provider";

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  centreId: z.string().min(1),
  cohorteId: z.string().optional().nullable(),
  examProvider: z.enum(["TELC", "GOETHE"]).optional(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const data = schema.parse(body);

    const centre = await prisma.centre.findUnique({ where: { id: data.centreId } });
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
        examProvider: normalizeExamProvider(data.examProvider),
      },
    });

    return NextResponse.json({ id: user.id, email: user.email });
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: "Donnees invalides" }, { status: 400 });
    }
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
