"use client";

import { SessionProvider } from "next-auth/react";
import { ExamThemeSync } from "@/components/exam/exam-theme";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ExamThemeSync />
      {children}
    </SessionProvider>
  );
}
