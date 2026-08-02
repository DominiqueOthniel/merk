import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { ensureSchema } from "@/lib/ensure-schema";
import { normalizeExamProvider } from "@/lib/exam-provider";

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Mot de passe", type: "password" },
        examProvider: { label: "Examen", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) return null;

        try {
          await ensureSchema();
        } catch {
          // continue: login peut encore marcher si la colonne existe deja
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email.toLowerCase().trim() },
        });
        if (!user) return null;

        const ok = await bcrypt.compare(credentials.password, user.passwordHash);
        if (!ok) return null;

        let examProvider = normalizeExamProvider(user.examProvider);
        if (credentials.examProvider) {
          examProvider = normalizeExamProvider(credentials.examProvider);
          if (examProvider !== user.examProvider) {
            await prisma.user.update({
              where: { id: user.id },
              data: { examProvider },
            });
          }
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          centreId: user.centreId,
          cohorteId: user.cohorteId,
          cefrLevel: user.cefrLevel,
          targetLevel: user.targetLevel,
          placedAt: user.placedAt?.toISOString() ?? null,
          examProvider,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        const u = user as {
          id: string;
          role: string;
          centreId?: string | null;
          cohorteId?: string | null;
          cefrLevel?: string | null;
          targetLevel?: string | null;
          placedAt?: string | null;
          examProvider?: string | null;
        };
        token.id = u.id;
        token.role = u.role;
        token.centreId = u.centreId;
        token.cohorteId = u.cohorteId;
        token.cefrLevel = u.cefrLevel;
        token.targetLevel = u.targetLevel;
        token.placedAt = u.placedAt;
        token.examProvider = normalizeExamProvider(u.examProvider);
      }
      if (trigger === "update" && session) {
        token.cefrLevel = session.cefrLevel ?? token.cefrLevel;
        token.targetLevel = session.targetLevel ?? token.targetLevel;
        token.placedAt = session.placedAt ?? token.placedAt;
        token.cohorteId = session.cohorteId ?? token.cohorteId;
        if (session.examProvider) {
          token.examProvider = normalizeExamProvider(session.examProvider);
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.centreId = (token.centreId as string | null) ?? null;
        session.user.cohorteId = (token.cohorteId as string | null) ?? null;
        session.user.cefrLevel = (token.cefrLevel as string | null) ?? null;
        session.user.targetLevel = (token.targetLevel as string | null) ?? null;
        session.user.placedAt = (token.placedAt as string | null) ?? null;
        session.user.examProvider = normalizeExamProvider(token.examProvider);
      }
      return session;
    },
  },
};
