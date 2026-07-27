"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BrandHeader } from "@/components/nav";

type ExamSet = {
  sourceId: string;
  title: string;
  section: string;
  skill: string;
  format?: string;
  pairCount: number;
  dueCount: number;
  doneCount: number;
};

type SectionGroup = {
  section: string;
  due: number;
  sets: ExamSet[];
};

type ExamLevel = "B1" | "B2" | "C1";

type LevelInfo = {
  id: ExamLevel;
  label: string;
  available: boolean;
  note?: string;
};

const LEVEL_FALLBACK: LevelInfo[] = [
  { id: "B1", label: "B1", available: true },
  { id: "B2", label: "B2", available: true },
  { id: "C1", label: "C1", available: false },
];

function toExamLevel(value: string): ExamLevel | null {
  if (value === "B1" || value === "B2" || value === "C1") return value;
  return null;
}

export default function ExamHubPage() {
  const [level, setLevel] = useState<ExamLevel>("B1");
  const [levels, setLevels] = useState<LevelInfo[]>([]);
  const [sections, setSections] = useState<SectionGroup[]>([]);
  const [totalDue, setTotalDue] = useState(0);
  const [available, setAvailable] = useState(true);
  const [note, setNote] = useState<string | undefined>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/exam/sets?level=${level}`)
      .then((r) => r.json())
      .then((data) => {
        const rawLevels = Array.isArray(data.levels) ? data.levels : [];
        const parsed: LevelInfo[] = rawLevels
          .map((item: { id?: string; label?: string; available?: boolean; note?: string }) => {
            const id = toExamLevel(String(item.id ?? ""));
            if (!id) return null;
            return {
              id,
              label: item.label ?? id,
              available: Boolean(item.available),
              note: item.note,
            };
          })
          .filter(Boolean) as LevelInfo[];
        setLevels(parsed.length ? parsed : LEVEL_FALLBACK);
        setSections(data.sections ?? []);
        setTotalDue(data.totalDue ?? 0);
        setAvailable(data.available !== false);
        setNote(data.note);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [level]);

  const levelChips = levels.length ? levels : LEVEL_FALLBACK;

  return (
    <>
      <BrandHeader subtitle="Mode avant examen · TELC Lesen et Sprachbausteine" />

      <section className="panel fade-up mb-6">
        <p className="eyebrow">Choisis ton niveau</p>
        <div className="mt-4 grid grid-cols-3 gap-2.5">
          {levelChips.map((item) => {
            const active = level === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setLevel(item.id)}
                className={`rounded-[1.25rem] px-3 py-4 text-center transition ${
                  active
                    ? "bg-[var(--forest)] text-white shadow-[0_10px_20px_rgba(26,107,72,0.25)]"
                    : "bg-white/85 text-[var(--ink)] border border-[var(--line)]"
                }`}
              >
                <span className="display block text-2xl">{item.label}</span>
                {!item.available ? (
                  <span className={`mt-1 block text-[0.75rem] ${active ? "text-white/80" : "text-[var(--ink-faint)]"}`}>
                    Bientot
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>

        <p className="mt-5 text-[1.05rem] leading-relaxed text-[var(--ink-soft)]">
          Lesen (titres) et Sprachbausteine (lacunes), format examen, avec repetition espacee.
        </p>
        {available ? (
          <p className="mt-3 text-[1.02rem] font-semibold text-[var(--forest-deep)]">
            {totalDue} item{totalDue > 1 ? "s" : ""} a revoir en {level}
          </p>
        ) : (
          <p className="mt-3 text-[1.02rem] text-[var(--ink-soft)]">{note}</p>
        )}
      </section>

      {loading ? (
        <p className="text-[var(--ink-soft)]">Chargement...</p>
      ) : !available ? (
        <div className="surface px-5 py-6 text-[1.05rem] text-[var(--ink-soft)]">
          Le niveau C1 arrivera dans MERK. Pour l instant, entraine-toi en B1 ou B2.
        </div>
      ) : (
        <div className="space-y-6">
          {sections.map((group) => (
            <section key={group.section}>
              <h2 className="display text-[clamp(1.35rem,4vw,1.7rem)]">
                {group.section}
              </h2>
              <p className="mt-1 text-[0.95rem] text-[var(--ink-faint)]">
                {group.due} dus dans cette section
              </p>
              <div className="mt-3 space-y-2.5">
                {group.sets.map((set) => (
                  <Link
                    key={set.sourceId}
                    href={`/exam/${set.sourceId}`}
                    className="surface flex items-center justify-between gap-3 px-4 py-4 transition hover:bg-[var(--forest-soft)]/40"
                  >
                    <div>
                      <p className="font-semibold">{set.title}</p>
                      <p className="mt-1 text-[0.92rem] text-[var(--ink-soft)]">
                        {set.format === "MATCH" || !set.format
                          ? `${set.pairCount} textes`
                          : `${set.pairCount} lacunes`}{" "}
                        · {set.doneCount} deja vus
                      </p>
                    </div>
                    <span
                      className={`rounded-full px-3 py-1 text-[0.85rem] font-semibold ${
                        set.dueCount > 0
                          ? "bg-[var(--forest)] text-white"
                          : "bg-[var(--forest-soft)] text-[var(--forest-deep)]"
                      }`}
                    >
                      {set.dueCount > 0 ? `${set.dueCount} dus` : "A jour"}
                    </span>
                  </Link>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </>
  );
}
