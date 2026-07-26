import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";

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
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email.toLowerCase().trim() },
        });
        if (!user) return null;

        const ok = await bcrypt.compare(credentials.password, user.passwordHash);
        if (!ok) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          centreId: user.centreId,
          cohorteId: user.cohorteId,
          cefrLevel: user.cefrLevel,
          placedAt: user.placedAt?.toISOString() ?? null,
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
          placedAt?: string | null;
        };
        token.id = u.id;
        token.role = u.role;
        token.centreId = u.centreId;
        token.cohorteId = u.cohorteId;
        token.cefrLevel = u.cefrLevel;
        token.placedAt = u.placedAt;
      }
      if (trigger === "update" && session) {
        token.cefrLevel = session.cefrLevel ?? token.cefrLevel;
        token.placedAt = session.placedAt ?? token.placedAt;
        token.cohorteId = session.cohorteId ?? token.cohorteId;
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
        session.user.placedAt = (token.placedAt as string | null) ?? null;
      }
      return session;
    },
  },
};
