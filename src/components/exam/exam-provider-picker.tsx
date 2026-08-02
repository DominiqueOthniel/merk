"use client";

import type { ExamProvider } from "@/lib/exam-provider";

type Props = {
  value: ExamProvider;
  onChange: (value: ExamProvider) => void;
  className?: string;
};

const OPTIONS: { id: ExamProvider; label: string; hint: string }[] = [
  { id: "TELC", label: "TELC", hint: "telc Deutsch" },
  { id: "GOETHE", label: "Goethe", hint: "Goethe-Zertifikat" },
];

export function ExamProviderPicker({ value, onChange, className = "" }: Props) {
  return (
    <div className={className}>
      <span className="field-label">Examen vise</span>
      <div className="mt-2 grid grid-cols-2 gap-2.5">
        {OPTIONS.map((option) => {
          const active = value === option.id;
          return (
            <button
              key={option.id}
              type="button"
              onClick={() => onChange(option.id)}
              className={`rounded-[1.25rem] px-3 py-3.5 text-left transition ${
                active
                  ? "bg-[var(--forest)] text-white shadow-[0_10px_20px_rgba(26,107,72,0.25)]"
                  : "border border-[var(--line)] bg-white/85 text-[var(--ink)] hover:bg-[var(--forest-soft)]"
              }`}
            >
              <span className="block text-[1.05rem] font-semibold">{option.label}</span>
              <span
                className={`mt-1 block text-[0.82rem] ${
                  active ? "text-white/75" : "text-[var(--ink-faint)]"
                }`}
              >
                {option.hint}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
