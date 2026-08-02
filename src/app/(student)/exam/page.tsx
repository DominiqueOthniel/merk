"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { BrandHeader } from "@/components/nav";
import {
  MerkAvatar,
  MERK_AVATARS,
  avatarForSection,
} from "@/components/ui/merk-avatar";
import {
  mockDurationLabel,
  type MockLevel,
} from "@/lib/content/mock-exam-meta";
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

type ExamLevel = "A1" | "A2" | "B1" | "B2" | "C1";

type LevelInfo = {
  id: ExamLevel;
  label: string;
  available: boolean;
  note?: string;
};

const LEVEL_FALLBACK: LevelInfo[] = [
  { id: "A1", label: "A1", available: true },
  { id: "A2", label: "A2", available: true },
  { id: "B1", label: "B1", available: true },
  { id: "B2", label: "B2", available: true },
  { id: "C1", label: "C1", available: true },
];

const SKILL_CHIPS = [
  { key: "horen", label: "Horen", avatar: MERK_AVATARS.horen },
  { key: "lesen", label: "Lesen", avatar: MERK_AVATARS.lesen },
  { key: "schreiben", label: "Schreiben", avatar: MERK_AVATARS.schreiben },
  { key: "sprechen", label: "Sprechen", avatar: MERK_AVATARS.sprechen },
] as const;

function toExamLevel(value: string): ExamLevel | null {
  if (
    value === "A1" ||
    value === "A2" ||
    value === "B1" ||
    value === "B2" ||
    value === "C1"
  ) {
    return value;
  }
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
          .map(
            (item: {
              id?: string;
              label?: string;
              available?: boolean;
              note?: string;
            }) => {
              const id = toExamLevel(String(item.id ?? ""));
              if (!id) return null;
              return {
                id,
                label: item.label ?? id,
                available: Boolean(item.available),
                note: item.note,
              };
            },
          )
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
  const durationLabel = mockDurationLabel(level as MockLevel);
  const presentSkills = useMemo(() => {
    const set = new Set(sections.flatMap((g) => g.sets.map((s) => s.skill)));
    return SKILL_CHIPS.filter((s) => set.has(s.key) || set.size === 0);
  }, [sections]);

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
        </div>
        <button
          type="button"
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="btn-link btn-link-secondary !w-auto px-5"
        >
          Changer de parcours
        </button>
      </section>

      <section className="mb-6 lg:mb-8">
        <p className="eyebrow">Choisis ton niveau</p>
        <div className="mt-3 grid grid-cols-3 gap-2.5 lg:max-w-md">
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
              </button>
            );
          })}
        </div>
      </section>

      <section className="mock-card fade-up mb-8">
        <MerkAvatar
          src={isGoethe ? MERK_AVATARS.goethe : MERK_AVATARS.telc}
          size="lg"
          shape="circle"
          className="mock-card__avatar"
        />
        <div className="mock-card__tags">
          <span className="mock-tag mock-tag--level">{level}</span>
          <span className="mock-tag mock-tag--exam">{examLabel}</span>
          <span className="mock-tag mock-tag--free">Entrainement</span>
        </div>
        <h2 className="mock-card__title">
          {examLabel} {level} · Mock Test 1
        </h2>
        <p className="mock-card__meta">{durationLabel} total</p>

        <div className="mock-card__skills">
          {presentSkills.map((s) => (
            <span key={s.key} className="mock-skill-chip">
              <MerkAvatar src={s.avatar} size="sm" shape="circle" />
              {s.label}
            </span>
          ))}
        </div>

        <ul className="mock-card__features">
          <li>Simulation chronometree</li>
          <li>Score detaille par competence</li>
          <li>Feedback IA en mode pratique (Sprechen)</li>
        </ul>

        <div className="mock-card__actions">
          <Link
            href={`/exam/mock?level=${level}`}
            className={`btn-link btn-link-primary ${
              !available || loading ? "pointer-events-none opacity-50" : ""
            }`}
          >
            Lancer l examen
          </Link>
          <a href="#practice" className="btn-link btn-link-secondary">
            Pratiquer
          </a>
        </div>
      </section>

      <div id="practice" className="scroll-mt-24">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
          <h2 className="display text-[clamp(1.45rem,4vw,1.85rem)]">
            Mode pratique
          </h2>
          {available ? (
            <p className="text-[0.95rem] text-[var(--ink-faint)]">
              {totalDue} item{totalDue > 1 ? "s" : ""} dus en {level}
            </p>
          ) : null}
        </div>

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
                <div className="exam-section-head">
                  <MerkAvatar
                    src={avatarForSection(group.section, group.sets[0]?.skill)}
                    size="md"
                    shape="circle"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-end justify-between gap-2">
                      <h3 className="display text-[clamp(1.35rem,4vw,1.7rem)]">
                        {group.section}
                      </h3>
                      <p className="text-[0.95rem] text-[var(--ink-faint)]">
                        {group.due} dus
                      </p>
                    </div>
                  </div>
                </div>
                <div className="mt-3 grid gap-2.5 lg:grid-cols-2">
                  {group.sets.map((set) => (
                    <Link
                      key={set.sourceId}
                      href={`/exam/${encodeURIComponent(set.sourceId)}`}
                      className="exam-set-card surface"
                    >
                      <MerkAvatar
                        src={avatarForSection(group.section, set.skill)}
                        size="sm"
                        shape="circle"
                        className="exam-set-card__avatar"
                      />
                      <div className="min-w-0 pr-2">
                        <p className="font-semibold">{set.title}</p>
                        <p className="mt-1 text-[0.92rem] text-[var(--ink-soft)]">
                          {set.format === "MATCH"
                            ? `${set.pairCount} items`
                            : set.format === "TF" ||
                                set.format === "READING_MCQ"
                              ? `${set.pairCount} questions`
                              : set.format === "WRITE"
                                ? "Production ecrite"
                                : set.format === "SPEAK"
                                  ? "Production orale"
                                  : `${set.pairCount} lacunes`}{" "}
                          · {set.doneCount} deja vus
                        </p>
                      </div>
                      <span
                        className={`shrink-0 rounded-full px-3 py-1 text-[0.85rem] font-semibold ${
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
      </div>
    </>
  );
}
