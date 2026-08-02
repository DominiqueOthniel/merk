"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { MerkAvatar, MERK_AVATARS, avatarForSection } from "@/components/ui/merk-avatar";

type MockItem = {
  id: string;
  sourceId: string;
  sourceTitle: string;
  skill: string;
  section: string;
  format: string;
  prompt: string;
  passage?: string | null;
  options: string[];
  answer: string;
  selfScore?: boolean;
};

type MockPayload = {
  examLabel: string;
  level: string;
  title: string;
  durationMinutes: number;
  durationLabel: string;
  skills: string[];
  items: MockItem[];
};

type SkillScore = {
  skill: string;
  label: string;
  ok: number;
  total: number;
  pct: number;
};

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function skillLabel(skill: string) {
  const map: Record<string, string> = {
    lesen: "Lesen",
    sprachbausteine: "Bausteine",
    horen: "Horen",
    schreiben: "Schreiben",
    sprechen: "Sprechen",
  };
  return map[skill] ?? skill;
}

function formatClock(totalSeconds: number) {
  const s = Math.max(0, totalSeconds);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (h > 0) {
    return `${h}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  }
  return `${m}:${String(sec).padStart(2, "0")}`;
}

export function MockExamSession({ level }: { level: string }) {
  const router = useRouter();
  const [data, setData] = useState<MockPayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [results, setResults] = useState<{ id: string; skill: string; ok: boolean }[]>(
    [],
  );
  const [phase, setPhase] = useState<"run" | "done">("run");
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    fetch(`/api/exam/mock?level=${encodeURIComponent(level)}`)
      .then(async (r) => {
        const json = await r.json();
        if (!r.ok) throw new Error(json.error || "Erreur");
        return json as MockPayload;
      })
      .then((payload) => {
        setData(payload);
        setSecondsLeft(payload.durationMinutes * 60);
      })
      .catch((e: unknown) => {
        setError(e instanceof Error ? e.message : "Chargement impossible");
      });
  }, [level]);

  useEffect(() => {
    if (!data || phase !== "run") return;
    if (secondsLeft <= 0) {
      setPhase("done");
      return;
    }
    const t = window.setTimeout(() => setSecondsLeft((n) => n - 1), 1000);
    return () => window.clearTimeout(t);
  }, [data, phase, secondsLeft]);

  const current = data?.items[index];
  const choices = useMemo(() => {
    if (!current || current.selfScore) return current?.options ?? [];
    const pool = current.options.includes(current.answer)
      ? current.options
      : [...current.options, current.answer];
    return shuffle(pool).slice(0, Math.min(6, pool.length));
  }, [current]);

  const skillScores: SkillScore[] = useMemo(() => {
    const map = new Map<string, { ok: number; total: number }>();
    for (const r of results) {
      const row = map.get(r.skill) ?? { ok: 0, total: 0 };
      row.total += 1;
      if (r.ok) row.ok += 1;
      map.set(r.skill, row);
    }
    return [...map.entries()].map(([skill, v]) => ({
      skill,
      label: skillLabel(skill),
      ok: v.ok,
      total: v.total,
      pct: v.total ? Math.round((v.ok / v.total) * 100) : 0,
    }));
  }, [results]);

  const overallPct = useMemo(() => {
    if (!results.length) return 0;
    return Math.round(
      (results.filter((r) => r.ok).length / results.length) * 100,
    );
  }, [results]);

  function confirm() {
    if (!current || busy) return;
    if (!current.selfScore && !selected) return;
    setBusy(true);
    const ok = current.selfScore
      ? true
      : selected?.trim() === current.answer.trim();
    setResults((prev) => [...prev, { id: current.id, skill: current.skill, ok }]);
    setSelected(null);
    if (index + 1 >= (data?.items.length ?? 0)) {
      setPhase("done");
    } else {
      setIndex((i) => i + 1);
    }
    setBusy(false);
  }

  if (error) {
    return (
      <div className="panel">
        <p className="text-[var(--danger)]">{error}</p>
        <Button className="mt-4" onClick={() => router.push("/exam")}>
          Retour
        </Button>
      </div>
    );
  }

  if (!data) {
    return <p className="text-[var(--ink-soft)]">Preparation du mock...</p>;
  }

  if (phase === "done") {
    return (
      <div className="panel fade-up space-y-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="eyebrow">Rapport mock</p>
            <p className="display mt-2 text-[clamp(1.8rem,5vw,2.4rem)]">
              {data.title}
            </p>
            <p className="mt-2 text-[1.05rem] text-[var(--ink-soft)]">
              {results.filter((r) => r.ok).length}/{results.length} items ·{" "}
              {overallPct}%
            </p>
          </div>
          <MerkAvatar
            src={
              data.examLabel.toLowerCase().includes("goethe")
                ? MERK_AVATARS.goethe
                : MERK_AVATARS.telc
            }
            size="lg"
            shape="circle"
          />
        </div>

        <div
          className={`rounded-[1.4rem] px-5 py-4 text-[1.1rem] font-semibold ${
            overallPct >= 60
              ? "bg-[var(--forest-soft)] text-[var(--forest-deep)]"
              : "bg-rose-50 text-[var(--danger)]"
          }`}
        >
          {overallPct >= 60
            ? "Bon rythme. Continue en pratique ciblee sur les points faibles."
            : "Encore du travail. Reprends les series en mode pratique."}
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {skillScores.map((s) => (
            <div key={s.skill} className="surface px-4 py-4">
              <div className="flex items-center justify-between gap-2">
                <span className="font-semibold">{s.label}</span>
                <span className="text-[var(--forest-deep)] font-semibold">
                  {s.pct}%
                </span>
              </div>
              <div className="progress-track mt-3">
                <div className="progress-fill" style={{ width: `${s.pct}%` }} />
              </div>
              <p className="mt-2 text-[0.9rem] text-[var(--ink-faint)]">
                {s.ok}/{s.total}
              </p>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button onClick={() => router.push("/exam")}>Retour au hub</Button>
          <Button
            variant="secondary"
            onClick={() => {
              window.location.href = `/exam/mock?level=${data.level}`;
            }}
          >
            Recommencer
          </Button>
          <Link href="/exam#practice" className="btn-link btn-link-secondary">
            Mode pratique
          </Link>
        </div>
      </div>
    );
  }

  if (!current) {
    return <p className="text-[var(--ink-soft)]">Aucun item dans ce mock.</p>;
  }

  const urgent = secondsLeft <= 5 * 60;

  return (
    <div className="space-y-4">
      <div className="mock-topbar">
        <div>
          <p className="eyebrow">{data.title}</p>
          <p className="mt-1 text-[0.95rem] text-[var(--ink-soft)]">
            {index + 1} / {data.items.length} · {skillLabel(current.skill)}
          </p>
        </div>
        <div className={`mock-timer ${urgent ? "mock-timer--urgent" : ""}`}>
          {formatClock(secondsLeft)}
        </div>
      </div>

      <div className="progress-track">
        <div
          className="progress-fill"
          style={{
            width: `${(index / Math.max(1, data.items.length)) * 100}%`,
          }}
        />
      </div>

      <div className="panel fade-up">
        <div className="flex items-start gap-3">
          <MerkAvatar
            src={avatarForSection(current.section, current.skill)}
            size="sm"
            shape="circle"
          />
          <div className="min-w-0">
            <p className="text-[0.92rem] font-semibold text-[var(--forest-deep)]">
              {current.sourceTitle}
            </p>
            <p className="mt-2 text-[1.05rem] font-semibold">{current.prompt}</p>
          </div>
        </div>

        {current.passage && current.skill !== "horen" ? (
          <div className="exam-passage mt-4">
            {current.passage}
          </div>
        ) : null}

        {current.skill === "horen" ? (
          <p className="mt-4 text-[0.95rem] text-[var(--ink-faint)]">
            Mode mock : base-toi sur l affirmation. L audio detaille reste en
            pratique serie.
          </p>
        ) : null}

        <div className="mt-5 space-y-2.5">
          {current.selfScore ? (
            <Button className="w-full" disabled={busy} onClick={confirm}>
              Marquer comme pret
            </Button>
          ) : (
            <>
              {choices.map((choice) => {
                const active = selected === choice;
                return (
                  <button
                    key={choice}
                    type="button"
                    onClick={() => setSelected(choice)}
                    className={`w-full rounded-[1.2rem] border px-4 py-3.5 text-left text-[0.98rem] transition ${
                      active
                        ? "border-[var(--forest)] bg-[var(--forest-soft)] text-[var(--forest-deep)]"
                        : "border-[var(--line)] bg-white/90 hover:bg-[var(--forest-soft)]/50"
                    }`}
                  >
                    {choice}
                  </button>
                );
              })}
              <Button
                className="mt-2 w-full"
                disabled={!selected || busy}
                onClick={confirm}
              >
                Valider
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
