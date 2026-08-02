"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import type { ExamProvider } from "@/lib/exam-provider";
import { normalizeExamProvider } from "@/lib/exam-provider";

export function applyExamTheme(provider: ExamProvider | string | null | undefined) {
  const value = normalizeExamProvider(provider).toLowerCase();
  document.documentElement.setAttribute("data-exam", value);
}

/** Applique le theme TELC / Goethe selon la session. */
export function ExamThemeSync({
  preview,
}: {
  preview?: ExamProvider | null;
}) {
  const { data } = useSession();

  useEffect(() => {
    if (preview) {
      applyExamTheme(preview);
      return;
    }
    applyExamTheme(data?.user?.examProvider ?? "TELC");
  }, [data?.user?.examProvider, preview]);

  return null;
}
