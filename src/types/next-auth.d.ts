import "next-auth";
import "next-auth/jwt";
import type { ExamProvider } from "@/lib/exam-provider";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      role: string;
      centreId: string | null;
      cohorteId: string | null;
      cefrLevel: string | null;
      placedAt: string | null;
      examProvider: ExamProvider;
    };
  }

  interface User {
    role: string;
    centreId?: string | null;
    cohorteId?: string | null;
    cefrLevel?: string | null;
    placedAt?: string | null;
    examProvider?: ExamProvider | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: string;
    centreId?: string | null;
    cohorteId?: string | null;
    cefrLevel?: string | null;
    placedAt?: string | null;
    examProvider?: ExamProvider;
  }
}
