import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const user = await prisma.user.findUnique({ where: { email: "eleve@merk.demo" } });
console.log("user", !!user, user?.role, user?.cefrLevel);
console.log("password", await bcrypt.compare("merk1234", user.passwordHash));
const due = await prisma.cardProgress.count({
  where: { userId: user.id, nextReviewAt: { lte: new Date() } },
});
console.log("dueCards", due);
const admin = await prisma.user.findUnique({ where: { email: "admin@merk.demo" } });
console.log("admin", admin?.role, admin?.centreId);
await prisma.$disconnect();
