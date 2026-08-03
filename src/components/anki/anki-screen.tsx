"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ReviewSession } from "@/components/review/review-session";
import { NEW_CAP, REVIEW_CAP } from "@/lib/srs/sm2";

type QueueCounts = {
  learning: number;
  review: number;
  new: number;
  reviewBacklog: number;
  newBacklog: number;
};

type Caps = { review: number; new: number };

type Profile = {
  cefrLevel: string | null;
  targetLevel: string | null;
};

export function AnkiScreen() {
  const [phase, setPhase] = useState<"hub" | "session">("hub");
  const [loading, setLoading] = useState(true);
  const [counts, setCounts] = useState<QueueCounts | null>(null);
  const [caps, setCaps] = useState<Caps>({ review: REVIEW_CAP, new: NEW_CAP });
  const [profile, setProfile] = useState<Profile | null>(null);
  const [sessionTotal, setSessionTotal] = useState(0);
  const [sessionKey, setSessionKey] = useState(0);
  const [error, setError] = useState<string | null>(null);

  function loadHub() {
    setLoading(true);
    setError(null);
    fetch("/api/review/due")
      .then(async (r) => {
        const data = await r.json();
        if (!r.ok) throw new Error(data.detail || data.error || "Erreur");
        setCounts(data.counts ?? null);
        setCaps(data.caps ?? { review: REVIEW_CAP, new: NEW_CAP });
        setProfile(data.profile ?? null);
        setSessionTotal(data.count ?? 0);
        setLoading(false);
      })
      .catch((e: unknown) => {
        setError(e instanceof Error ? e.message : "Chargement impossible");
        setLoading(false);
      });
  }

  useEffect(() => {
    loadHub();
  }, []);

  if (phase === "session") {
    return (
      <div className="space-y-4">
        <div className="surface flex flex-wrap items-center justify-between gap-3 px-4 py-3">
          <div>
            <p className="eyebrow">Session Anki</p>
            <p className="mt-1 text-[0.95rem] text-[var(--ink-soft)]">
              File du jour · rappel actif · intervalles
            </p>
          </div>
          <Button
            variant="secondary"
            className="text-[0.95rem]"
            onClick={() => {
              setPhase("hub");
              loadHub();
            }}
          >
            Quitter la session
          </Button>
        </div>
        <ReviewSession
          key={sessionKey}
          onBackToHub={() => {
            setPhase("hub");
            loadHub();
          }}
        />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="skeleton h-40 w-full rounded-[28px]" />
        <div className="grid grid-cols-3 gap-3">
          <div className="skeleton h-28" />
          <div className="skeleton h-28" />
          <div className="skeleton h-28" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="panel">
        <p className="text-[1.05rem] text-[var(--danger)]">{error}</p>
        <Button className="mt-5" onClick={loadHub}>
          Reessayer
        </Button>
      </div>
    );
  }

  const learning = counts?.learning ?? 0;
  const review = counts?.review ?? 0;
  const neu = counts?.new ?? 0;
  const backlog =
    (counts?.reviewBacklog ?? 0) + (counts?.newBacklog ?? 0);
  const empty = sessionTotal === 0;

  return (
    <div className="space-y-5">
      <section className="panel-hero fade-up anki-hero">
        <p className="text-[0.78rem] font-bold uppercase tracking-[0.16em] text-white/70">
          Systeme Anki
        </p>
        <h2 className="display mt-3 max-w-[16ch] text-[clamp(2rem,7vw,2.8rem)] text-white">
          Memoire espacee
        </h2>
        <p className="mt-4 max-w-[34ch] text-[1.08rem] leading-relaxed text-white/85">
          Tu produis la reponse, puis tu notes la difficulte. Merk planifie le
          prochain rappel juste avant l oubli.
        </p>
        {profile?.cefrLevel ? (
          <p className="mt-5 text-[0.95rem] text-white/75">
            Niveau {profile.cefrLevel}
            {profile.targetLevel ? ` · objectif ${profile.targetLevel}` : ""}
          </p>
        ) : null}
      </section>

      <section className="grid gap-3 sm:grid-cols-3">
        <QueueStat
          label="A reapprendre"
          value={learning}
          hint="Echecs recents · priorite"
          tone="warn"
        />
        <QueueStat
          label="A revoir"
          value={review}
          hint={`Cap ${caps.review} / jour`}
          tone="forest"
        />
        <QueueStat
          label="Nouvelles"
          value={neu}
          hint={`Cap ${caps.new} / jour`}
          tone="soft"
        />
      </section>

      {backlog > 0 ? (
        <p className="text-[0.98rem] text-[var(--ink-soft)]">
          {backlog} carte{backlog > 1 ? "s" : ""} reportees a demain pour
          proteger ton rythme.
        </p>
      ) : null}

      <section className="panel fade-up">
        <p className="eyebrow">Comment ca marche</p>
        <ol className="mt-5 space-y-4 text-[1.05rem] leading-relaxed text-[var(--ink-soft)]">
          <li>
            <span className="font-semibold text-[var(--forest-deep)]">1. Apprentissage</span>
            {" "}
            : 1 min puis 10 min avant d entrer dans les jours.
          </li>
          <li>
            <span className="font-semibold text-[var(--forest-deep)]">2. Revision</span>
            {" "}
            : 1 j · 3 j · 7 j · 21 j et plus si ca tient.
          </li>
          <li>
            <span className="font-semibold text-[var(--forest-deep)]">3. Echec</span>
            {" "}
            : retour en reapprentissage court, pas de binge.
          </li>
        </ol>
        <div className="mt-6 flex flex-wrap gap-2">
          <span className="stat-chip">Difficile → court</span>
          <span className="stat-chip">Moyen → normal</span>
          <span className="stat-chip">Facile → plus long</span>
        </div>
      </section>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button
          className="w-full sm:flex-1"
          disabled={empty}
          onClick={() => {
            setSessionKey((k) => k + 1);
            setPhase("session");
          }}
        >
          {empty
            ? "Rien a revoir pour l instant"
            : `Commencer · ${sessionTotal} carte${sessionTotal > 1 ? "s" : ""}`}
        </Button>
        <Button variant="secondary" className="w-full sm:w-auto" onClick={loadHub}>
          Actualiser la file
        </Button>
      </div>
    </div>
  );
}

function QueueStat({
  label,
  value,
  hint,
  tone,
}: {
  label: string;
  value: number;
  hint: string;
  tone: "warn" | "forest" | "soft";
}) {
  const toneClass =
    tone === "warn"
      ? "border-amber-200/80 bg-amber-50/80"
      : tone === "forest"
        ? "border-[var(--forest-soft)] bg-[var(--forest-soft)]/40"
        : "border-white/80 bg-white/70";

  return (
    <div className={`surface px-4 py-4 ${toneClass}`}>
      <p className="text-[0.82rem] font-semibold uppercase tracking-[0.08em] text-[var(--ink-faint)]">
        {label}
      </p>
      <p className="display mt-2 text-[2rem] text-[var(--forest-deep)]">{value}</p>
      <p className="mt-1 text-[0.9rem] text-[var(--ink-soft)]">{hint}</p>
    </div>
  );
}
