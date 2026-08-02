"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { BrandHeader } from "@/components/nav";
import { examProviderLabel, type ExamProvider } from "@/lib/exam-provider";

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
  { id: "C1", label: "C1", available: true },
];

function toExamLevel(value: string): ExamLevel | null {
  if (value === "B1" || value === "B2" || value === "C1") return value;
  return null;
}

export default function ExamHubPage() {
  const { data: session } = useSession();
  const provider = (session?.user?.examProvider ?? "TELC") as ExamProvider;
  const [examLabel, setExamLabel] = useState(examProviderLabel(provider));
  const [level, setLevel] = useState<ExamLevel>("B1");
  const [levels, setLevels] = useState<LevelInfo[]>([]);
  const [sections, setSections] = useState<SectionGroup[]>([]);
  const [totalDue, setTotalDue] = useState(0);
  const [available, setAvailable] = useState(true);
  const [note, setNote] = useState<string | undefined>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setExamLabel(examProviderLabel(provider));
  }, [provider]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetch(`/api/exam/sets?level=${level}`)
      .then(async (r) => {
        const text = await r.text();
        if (!r.ok) throw new Error(text || `Erreur ${r.status}`);
        return text ? JSON.parse(text) : {};
      })
      .then((data) => {
        if (cancelled) return;
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
        if (data.examLabel) setExamLabel(String(data.examLabel));
        setLoading(false);
      })
      .catch(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [level]);

  const levelChips = levels.length ? levels : LEVEL_FALLBACK;
  const isGoethe = provider === "GOETHE";

  return (
    <>
      <BrandHeader subtitle={`Mode avant examen · ${examLabel}`} />

      <section className="track-banner fade-up mb-6 lg:mb-8">
        <div>
          <p className="eyebrow">Parcours verrouille</p>
          <div className="mt-2 flex flex-wrap items-center gap-2.5">
            <span className="track-pill">
              <span className="track-pill__dot" />
              {examLabel}
            </span>
            <span className="text-[1.02rem] text-[var(--ink-soft)]">
              {isGoethe
                ? "Contenu Goethe uniquement"
                : "Contenu TELC uniquement"}
            </span>
          </div>
          <p className="mt-2 max-w-[40ch] text-[0.95rem] leading-relaxed text-[var(--ink-faint)]">
            Pour passer a {isGoethe ? "TELC" : "Goethe"}, deconnecte-toi puis
            reconnecte-toi avec l autre parcours.
          </p>
        </div>
        <button
          type="button"
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="btn-link btn-link-secondary !w-auto px-5"
        >
          Changer de parcours
        </button>
      </section>

      <section className="panel fade-up mb-6 lg:mb-8 lg:grid lg:grid-cols-[1fr_1.1fr] lg:items-center lg:gap-8">
        <div>
          <p className="eyebrow">Choisis ton niveau</p>
          <div className="mt-4 grid grid-cols-3 gap-2.5 lg:max-w-md">
            {levelChips.map((item) => {
              const active = level === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setLevel(item.id)}
                  className={`rounded-[1.25rem] px-3 py-4 text-center transition ${
                    active
                      ? "bg-[var(--forest)] text-white shadow-[var(--shadow-glow)]"
                      : "bg-white/85 text-[var(--ink)] border border-[var(--line)]"
                  }`}
                >
                  <span className="display block text-2xl">{item.label}</span>
                  {!item.available ? (
                    <span
                      className={`mt-1 block text-[0.75rem] ${
                        active ? "text-white/80" : "text-[var(--ink-faint)]"
                      }`}
                    >
                      Bientot
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>
        <div className="mt-5 lg:mt-0">
          <p className="text-[1.05rem] leading-relaxed text-[var(--ink-soft)] lg:text-[1.1rem]">
            {isGoethe
              ? "Goethe-Zertifikat : Lesen, Sprachbausteine, Horen, Schreiben et Sprechen."
              : level === "C1"
                ? "telc C1 : Lesen, Sprachbausteine, Horen, Schreiben et Sprechen."
                : "TELC : Lesen, Sprachbausteine, Horen et Schreiben, avec repetition espacee."}
          </p>
          {available ? (
            <p className="mt-3 text-[1.02rem] font-semibold text-[var(--forest-deep)]">
              {totalDue} item{totalDue > 1 ? "s" : ""} a revoir en {level}
            </p>
          ) : (
            <p className="mt-3 text-[1.02rem] text-[var(--ink-soft)]">{note}</p>
          )}
        </div>
      </section>

      {loading ? (
        <div className="space-y-3">
          <div className="skeleton h-24 w-full rounded-[1.4rem]" />
          <div className="skeleton h-24 w-full rounded-[1.4rem]" />
        </div>
      ) : !available ? (
        <div className="surface px-5 py-6 text-[1.05rem] text-[var(--ink-soft)]">
          {note || "Ce niveau n est pas encore disponible."}
        </div>
      ) : sections.length === 0 ? (
        <div className="surface px-5 py-6 text-[1.05rem] text-[var(--ink-soft)]">
          Aucune serie {examLabel} pour ce niveau pour le moment.
        </div>
      ) : (
        <div className="space-y-8">
          {sections.map((group) => (
            <section key={group.section}>
              <div className="flex flex-wrap items-end justify-between gap-2">
                <h2 className="display text-[clamp(1.35rem,4vw,1.7rem)]">
                  {group.section}
                </h2>
                <p className="text-[0.95rem] text-[var(--ink-faint)]">
                  {group.due} dus dans cette section
                </p>
              </div>
              <div className="mt-3 grid gap-2.5 lg:grid-cols-2">
                {group.sets.map((set) => (
                  <Link
                    key={set.sourceId}
                    href={`/exam/${encodeURIComponent(set.sourceId)}`}
                    className="surface flex items-center justify-between gap-3 px-4 py-4"
                  >
                    <div>
                      <p className="font-semibold">{set.title}</p>
                      <p className="mt-1 text-[0.92rem] text-[var(--ink-soft)]">
                        {set.format === "MATCH"
                          ? `${set.pairCount} items`
                          : set.format === "TF" || set.format === "READING_MCQ"
                            ? `${set.pairCount} questions`
                            : set.format === "WRITE"
                              ? "Production ecrite"
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
