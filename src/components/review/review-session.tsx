"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AudioRecorder } from "@/components/review/audio-recorder";

type DueCard = {
  progressId: string;
  cardId: string;
  queueKind: "learning" | "review" | "new";
  status: string;
  prompt: string;
  context: string;
  hint?: string | null;
  theme: string;
  level: string;
  intervals: { HARD: string; MEDIUM: string; EASY: string };
};

type ReviewProfile = {
  cefrLevel: string | null;
  targetLevel: string | null;
  examProvider: string;
};

type QueueCounts = {
  learning: number;
  review: number;
  new: number;
  reviewBacklog: number;
  newBacklog: number;
};

type CheckResult = {
  correct: boolean;
  expected: string;
  context: string;
};

type SubmitResult = {
  points: number;
  prepScore: number;
  streakDays: number;
};

function queueLabel(kind: DueCard["queueKind"]): string {
  if (kind === "learning") return "Apprentissage";
  if (kind === "new") return "Nouvelle";
  return "Revision";
}

export function ReviewSession({
  onBackToHub,
}: {
  onBackToHub?: () => void;
} = {}) {
  const router = useRouter();
  const [cards, setCards] = useState<DueCard[]>([]);
  const [profile, setProfile] = useState<ReviewProfile | null>(null);
  const [counts, setCounts] = useState<QueueCounts | null>(null);
  const [loading, setLoading] = useState(true);
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [phase, setPhase] = useState<"answer" | "quality" | "done">("answer");
  const [check, setCheck] = useState<CheckResult | null>(null);
  const [submitMeta, setSubmitMeta] = useState<SubmitResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [startedAt, setStartedAt] = useState<number>(Date.now());
  const [sessionPoints, setSessionPoints] = useState(0);

  useEffect(() => {
    fetch("/api/review/due")
      .then((r) => r.json())
      .then((data) => {
        setCards(data.cards ?? []);
        setProfile(data.profile ?? null);
        setCounts(data.counts ?? null);
        setLoading(false);
        setStartedAt(Date.now());
      })
      .catch(() => setLoading(false));
  }, []);

  const current = cards[index];
  const remaining = Math.max(0, cards.length - index);

  const promptParts = useMemo(() => {
    if (!current) return null;
    return current.prompt.split("___");
  }, [current]);

  async function verify() {
    if (!current || !answer.trim() || busy) return;
    setBusy(true);
    try {
      const res = await fetch("/api/review/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ progressId: current.progressId, answer }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur");
      setCheck(data);
      setPhase("quality");
    } catch {
      /* ignore */
    } finally {
      setBusy(false);
    }
  }

  async function rate(quality: "HARD" | "MEDIUM" | "EASY") {
    if (!current || !check || busy) return;
    setBusy(true);
    try {
      const res = await fetch("/api/review/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          progressId: current.progressId,
          answer,
          quality: check.correct ? quality : "HARD",
          responseMs: Date.now() - startedAt,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur");
      setSubmitMeta({
        points: data.points,
        prepScore: data.prepScore,
        streakDays: data.streakDays,
      });
      setSessionPoints((p) => p + (data.points ?? 0));

      let nextCards = cards;
      if (data.requeue) {
        const requeued: DueCard = {
          ...current,
          queueKind: "learning",
          status: data.status ?? "LEARNING",
          intervals: data.intervals ?? current.intervals,
        };
        nextCards = [...cards, requeued];
        setCards(nextCards);
      }

      if (index + 1 >= nextCards.length) {
        setPhase("done");
      } else {
        setIndex((i) => i + 1);
        setAnswer("");
        setCheck(null);
        setSubmitMeta(null);
        setPhase("answer");
        setStartedAt(Date.now());
      }
    } catch {
      /* ignore */
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="skeleton h-3 w-full rounded-full" />
        <div className="skeleton h-56 w-full rounded-[28px]" />
      </div>
    );
  }

  if (!current || phase === "done") {
    const backlog =
      (counts?.reviewBacklog ?? 0) + (counts?.newBacklog ?? 0);
    return (
      <div className="panel fade-up">
        <p className="eyebrow">Session</p>
        <p className="display mt-2 text-[clamp(2rem,7vw,2.7rem)] text-[var(--forest-deep)]">
          {cards.length === 0 ? "Rien a revoir" : "Bien joue"}
        </p>
        <p className="mt-4 text-[1.1rem] leading-relaxed text-[var(--ink-soft)]">
          {cards.length === 0
            ? "Aucune carte due pour le moment. Reviens demain, la regularite gagne."
            : backlog > 0
              ? `+${sessionPoints} points. Dues du jour terminees. Il reste ${backlog} carte${backlog > 1 ? "s" : ""} reportees a demain.`
              : `+${sessionPoints} points. Ta memoire garde mieux ce que tu revisites.`}
        </p>
        <div className="mt-8 flex flex-col gap-3">
          {onBackToHub ? (
            <Button onClick={onBackToHub}>Retour au systeme Anki</Button>
          ) : (
            <Button onClick={() => router.push("/anki")}>Retour Anki</Button>
          )}
          <Button variant="secondary" onClick={() => router.push("/dashboard")}>
            Voir mon carnet
          </Button>
          <Button variant="secondary" onClick={() => router.push("/exam")}>
            Entrainer l examen
          </Button>
        </div>
      </div>
    );
  }

  const sessionPct = Math.round(((index + (phase === "quality" ? 1 : 0)) / cards.length) * 100);
  const intervals = current.intervals;

  return (
    <div className="space-y-5">
      {profile?.cefrLevel ? (
        <div className="surface flex flex-wrap items-center gap-2 px-4 py-3 text-[0.95rem]">
          <span className="font-semibold text-[var(--forest-deep)]">
            Niveau {profile.cefrLevel}
          </span>
          {profile.targetLevel ? (
            <span className="text-[var(--ink-soft)]">
              · objectif {profile.targetLevel}
            </span>
          ) : null}
          <span className="text-[var(--ink-faint)]">
            Cartes entre ton niveau et ton objectif.
          </span>
        </div>
      ) : null}

      {counts ? (
        <p className="text-[0.95rem] text-[var(--ink-soft)]">
          {counts.learning > 0
            ? `${counts.learning} a reapprendre · `
            : null}
          {counts.review} a revoir · {counts.new} nouvelle
          {counts.new > 1 ? "s" : ""}
        </p>
      ) : null}

      <div className="flex items-center justify-between gap-3 text-[1rem] text-[var(--ink-soft)]">
        <span className="font-semibold text-[var(--forest-deep)]">
          {index + 1} / {cards.length}
        </span>
        <span className="stat-chip">
          {queueLabel(current.queueKind)} · {current.theme} · {current.level}
        </span>
      </div>
      <div className="progress-track" aria-label={`Progression ${sessionPct}%`}>
        <div
          className="progress-fill"
          style={{
            width: `${Math.min(100, sessionPct)}%`,
          }}
        />
      </div>

      <div className="panel fade-up lg:grid lg:grid-cols-[1.15fr_0.85fr] lg:gap-8 lg:items-start">
        <div>
          <p className="eyebrow">Contexte</p>
          <p className="mt-2 text-[1.08rem] leading-relaxed text-[var(--ink-soft)] lg:text-[1.12rem]">
            {current.context}
          </p>

          <p className="display mt-8 text-[clamp(1.85rem,6.5vw,2.55rem)] leading-[1.25]">
            {promptParts?.[0]}
            <span className="mx-1.5 inline-block min-w-[5rem] border-b-[3px] border-[var(--forest)] px-1 text-center text-[var(--forest)]">
              {phase === "quality" && check ? check.expected : "?"}
            </span>
            {promptParts?.[1]}
          </p>

          {current.hint ? (
            <p className="mt-5 text-[1.02rem] text-[var(--ink-faint)]">
              Indice : {current.hint}
            </p>
          ) : null}
        </div>

        <div className="mt-8 lg:mt-0">
          {phase === "answer" ? (
            <div className="space-y-4">
              <Input
                autoFocus
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="Ecris ta reponse ici"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && answer.trim()) verify();
                }}
              />
              <Button className="w-full" disabled={!answer.trim() || busy} onClick={verify}>
                Verifier
              </Button>
              {!answer.trim() ? (
                <p className="text-center text-[0.95rem] text-[var(--warn)]">
                  Tape ta reponse ci-dessus pour activer Verifier. L audio est optionnel.
                </p>
              ) : null}
              <AudioRecorder key={current.progressId} />
              <p className="text-center text-[0.98rem] text-[var(--ink-faint)]">
                {remaining} carte{remaining > 1 ? "s" : ""} restante
                {remaining > 1 ? "s" : ""}
              </p>
            </div>
          ) : null}

          {phase === "quality" && check ? (
            <div className="fade-up-delay space-y-5">
              <div
                className={`pop-in rounded-[1.4rem] px-5 py-4 text-[1.05rem] leading-relaxed ${
                  check.correct ? "feedback-ok" : "feedback-bad"
                }`}
              >
                {check.correct
                  ? "Correct. Choisis la difficulte pour planifier la suite."
                  : `Attendu : ${check.expected}`}
              </div>
              <p className="text-[1.05rem] text-[var(--ink-soft)]">Comment c etait pour toi ?</p>
              {check.correct ? (
                <div className="grid grid-cols-3 gap-2.5">
                  <Button
                    variant="secondary"
                    className="flex h-auto flex-col gap-0.5 px-2 py-2.5 text-[0.95rem]"
                    disabled={busy}
                    onClick={() => rate("HARD")}
                  >
                    <span>Difficile</span>
                    <span className="text-[0.8rem] font-normal text-[var(--ink-faint)]">
                      {intervals.HARD}
                    </span>
                  </Button>
                  <Button
                    variant="secondary"
                    className="flex h-auto flex-col gap-0.5 px-2 py-2.5 text-[0.95rem]"
                    disabled={busy}
                    onClick={() => rate("MEDIUM")}
                  >
                    <span>Moyen</span>
                    <span className="text-[0.8rem] font-normal text-[var(--ink-faint)]">
                      {intervals.MEDIUM}
                    </span>
                  </Button>
                  <Button
                    className="flex h-auto flex-col gap-0.5 px-2 py-2.5 text-[0.95rem]"
                    disabled={busy}
                    onClick={() => rate("EASY")}
                  >
                    <span>Facile</span>
                    <span className="text-[0.8rem] font-normal text-[var(--ink-faint)]">
                      {intervals.EASY}
                    </span>
                  </Button>
                </div>
              ) : (
                <Button className="w-full" disabled={busy} onClick={() => rate("HARD")}>
                  Continuer ({intervals.HARD})
                </Button>
              )}
              {submitMeta ? (
                <p className="text-[0.95rem] text-[var(--ink-faint)]">
                  +{submitMeta.points} pts · prep {submitMeta.prepScore} · serie{" "}
                  {submitMeta.streakDays}j
                </p>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
