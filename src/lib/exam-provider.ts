export type ExamProvider = "TELC" | "GOETHE";

export const EXAM_PROVIDERS: ExamProvider[] = ["TELC", "GOETHE"];

export function normalizeExamProvider(value: unknown): ExamProvider {
  const raw = String(value ?? "")
    .trim()
    .toUpperCase();
  return raw === "GOETHE" ? "GOETHE" : "TELC";
}

export function examProviderLabel(provider: ExamProvider | string | null | undefined): string {
  return String(provider ?? "").toUpperCase() === "GOETHE" ? "Goethe" : "TELC";
}

/** Prefixe sourceRef en base (TELC historique = deuropa). */
export function examSourcePrefix(provider: ExamProvider): string {
  return provider === "GOETHE" ? "goethe:" : "deuropa:";
}

export function examThemeSlug(provider: ExamProvider, level: string): string {
  const p = provider === "GOETHE" ? "goethe" : "telc";
  return `examen-${p}-${level.toLowerCase()}`;
}
