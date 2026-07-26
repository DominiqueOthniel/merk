import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const centres = await prisma.centre.findMany({
    include: {
      cohorts: {
        select: { id: true, name: true },
        orderBy: { name: "asc" },
      },
    },
    orderBy: { name: "asc" },
  });

  return NextResponse.json(centres);
}
