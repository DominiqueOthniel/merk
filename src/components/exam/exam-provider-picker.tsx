"use client";

import type { ExamProvider } from "@/lib/exam-provider";

type Props = {
  value: ExamProvider;
  onChange: (value: ExamProvider) => void;
  className?: string;
};

const OPTIONS: {
  id: ExamProvider;
  label: string;
  hint: string;
  vibe: string;
  swatch: string;
}[] = [
  {
    id: "TELC",
    label: "TELC",
    hint: "telc Deutsch",
    vibe: "Vert foret, rythme centre",
    swatch: "linear-gradient(145deg, #21915c, #0c3d29)",
  },
  {
    id: "GOETHE",
    label: "Goethe",
    hint: "Goethe-Zertifikat",
    vibe: "Encre & laiton, focus litteraire",
    swatch: "linear-gradient(145deg, #3d6a9a, #12263f)",
  },
];

export function ExamProviderPicker({ value, onChange, className = "" }: Props) {
  return (
    <fieldset className={`border-0 p-0 m-0 ${className}`}>
      <legend className="field-label mb-3 w-full">Choisis ton parcours</legend>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {OPTIONS.map((option) => {
          const active = value === option.id;
          return (
            <button
              key={option.id}
              type="button"
              onClick={() => onChange(option.id)}
              aria-pressed={active}
              className={`exam-choice ${active ? "exam-choice--active" : ""}`}
            >
              <span
                className="exam-choice__swatch"
                style={{ background: option.swatch }}
                aria-hidden
              />
              <span className="exam-choice__body">
                <span className="exam-choice__label">{option.label}</span>
                <span className="exam-choice__hint">{option.hint}</span>
                <span className="exam-choice__vibe">{option.vibe}</span>
              </span>
              {active ? (
                <span className="exam-choice__check" aria-hidden>
                  ✓
                </span>
              ) : null}
            </button>
          );
        })}
      </div>
      <p className="mt-3 text-[0.92rem] leading-relaxed text-[var(--ink-faint)]">
        Ce choix fixe le contenu et les couleurs. Pour changer, deconnecte-toi
        puis reconnecte-toi.
      </p>
    </fieldset>
  );
}
