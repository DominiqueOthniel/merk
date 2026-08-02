import { ensureExamCards } from "@/lib/content/ensure-exam-cards";

/** @deprecated Prefer ensureExamCards("GOETHE") */
export function ensureGoetheCards(): Promise<void> {
  return ensureExamCards("GOETHE");
}
