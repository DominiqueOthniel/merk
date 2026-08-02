"use client";

import type { ExamProvider } from "@/lib/exam-provider";
import { ProviderSelectCards } from "@/components/exam/provider-select-cards";

type Props = {
  value: ExamProvider;
  onChange: (value: ExamProvider) => void;
  className?: string;
};

export function ExamProviderPicker({ value, onChange, className = "" }: Props) {
  return (
    <fieldset className={`m-0 border-0 p-0 ${className}`}>
      <legend className="field-label mb-3 w-full">Choisis ton parcours</legend>
      <ProviderSelectCards mode="select" value={value} onChange={onChange} />
      <p className="mt-3 text-[0.92rem] leading-relaxed text-[var(--ink-faint)]">
        Ce choix fixe le contenu et les couleurs. Pour changer, deconnecte-toi
        puis reconnecte-toi.
      </p>
    </fieldset>
  );
}
