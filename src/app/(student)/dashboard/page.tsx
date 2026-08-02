"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BrandHeader } from "@/components/nav";

type Dash = {
  user: {
    name: string;
    cefrLevel: string | null;
    targetLevel?: string | null;
    streakDays: number;
    totalPoints: number;
    centre: string | null;
    cohorte: string | null;
    nextSessionAt: string | null;
  };
  dueCount: number;
  doneToday: number;
  prepScore: number;
  prepLabel: string;
  themes: {
    slug: string;
    name: string;
    nameDe: string;
    total: number;
    mastered: number;
    pct: number;
  }[];
  challenge: {
    title: string;
    goalCards: number;
    progress: number;
    pct: number;
  } | null;
};

function nudge(dueCount: number, streakDays: number, doneToday: number) {
  if (dueCount === 0 && doneToday > 0) {
    return "Tu es a jour. Garde le rythme demain.";
  }
  if (dueCount === 0) {
    return "Rien d urgent. Une petite serie maintient ta memoire.";
  }
  if (streakDays >= 3) {
    return `${streakDays} jours de suite. Continue, c est la que ca colle.`;
  }
  if (dueCount <= 8) {
    return "Une courte session suffit pour rester pret.";
  }
  return "Commence par 10 cartes. Le reste suivra.";
}

export default function DashboardPage() {
  const [data, setData] = useState<Dash | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/dashboard")
      .then(async (r) => {
        const text = await r.text();
        if (!r.ok) throw new Error(text || `Erreur ${r.status}`);
        if (!text) throw new Error("Reponse vide du serveur");
        return JSON.parse(text) as Dash;
      })
      .then(setData)
      .catch((e: unknown) => {
        setError(e instanceof Error ? e.message : "Chargement impossible");
      });
  }, []);

  if (error) {
    return (
      <>
        <BrandHeader subtitle="Ton carnet personnel" />
        <p className="text-[1.1rem] text-[var(--danger)]">{error}</p>
      </>
    );
  }

  if (!data) {
    return (
      <>
        <BrandHeader subtitle="Ton carnet personnel" />
        <div className="space-y-4">
          <div className="skeleton h-48 w-full rounded-[28px]" />
          <div className="grid grid-cols-2 gap-3">
            <div className="skeleton h-28" />
            <div className="skeleton h-28" />
          </div>
        </div>
      </>
    );
  }

  const nextSession = data.user.nextSessionAt
    ? new Date(data.user.nextSessionAt).toLocaleString("fr-FR", {
        weekday: "short",
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

  const firstName = data.user.name.split(" ")[0] || data.user.name;

  return (
    <>
      <BrandHeader subtitle={`Carnet de ${firstName}`} />

      <div className="lg:grid lg:grid-cols-[1.35fr_0.85fr] lg:items-start lg:gap-5">
        <section className="panel fade-up">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="eyebrow">Score de preparation</p>
              <p className="mt-3 text-[1.12rem] font-semibold text-[var(--forest)]">
                {data.prepLabel}
              </p>
              <p className="mt-3 max-w-[32ch] text-[1.05rem] leading-relaxed text-[var(--ink-soft)]">
                {nudge(data.dueCount, data.user.streakDays, data.doneToday)}
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                <span className="stat-chip">Niveau {data.user.cefrLevel ?? "?"}</span>
                {data.user.targetLevel ? (
                  <span className="stat-chip">Objectif {data.user.targetLevel}</span>
                ) : null}
                <span
                  className={`stat-chip ${
                    data.user.streakDays >= 2 ? "stat-chip--hot pop-in" : ""
                  }`}
                >
                  Serie {data.user.streakDays} j
                </span>
                <span className="stat-chip">{data.user.totalPoints} pts</span>
              </div>
            </div>
            <div
              className="score-ring shrink-0"
              style={{ ["--pct" as string]: Math.min(100, Math.max(0, data.prepScore)) }}
              aria-label={`Score ${data.prepScore} sur 100`}
            >
              <span>{data.prepScore}</span>
            </div>
          </div>

          {nextSession ? (
            <p className="mt-6 rounded-[1.25rem] bg-[var(--forest-soft)] px-4 py-3.5 text-[1.02rem] leading-relaxed text-[var(--forest-deep)]">
              Prochaine seance : <strong>{nextSession}</strong>
              {data.dueCount > 0
                ? ` · ${data.dueCount} carte${data.dueCount > 1 ? "s" : ""} encore dues`
                : " · tu es a jour"}
            </p>
          ) : null}

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <Link href="/review" className="btn-link btn-link-primary">
              {data.dueCount > 0
                ? `Reviser ${Math.min(data.dueCount, 20)} carte${data.dueCount > 1 ? "s" : ""}`
                : "Ouvrir la revision"}
            </Link>
            <Link href="/exam" className="btn-link btn-link-secondary">
              Mode avant examen
            </Link>
          </div>
        </section>

        <div className="mt-5 space-y-4 lg:mt-0">
          <section className="fade-up-delay grid grid-cols-2 gap-3">
            <div className="surface px-5 py-5">
              <p className="eyebrow">Aujourd hui</p>
              <p className="display mt-2 text-4xl text-[var(--forest-deep)]">
                {data.doneToday}
              </p>
              <p className="mt-1 text-[0.92rem] text-[var(--ink-faint)]">cartes faites</p>
            </div>
            <div className="surface px-5 py-5">
              <p className="eyebrow">Encore dues</p>
              <p className="display mt-2 text-4xl text-[var(--forest-deep)]">
                {data.dueCount}
              </p>
              <p className="mt-1 text-[0.92rem] text-[var(--ink-faint)]">a revoir</p>
            </div>
          </section>

          {data.challenge ? (
            <section className="surface px-5 py-5 fade-up-late">
              <p className="eyebrow">Defi de cohorte</p>
              <p className="mt-2 text-[1.12rem] font-semibold">{data.challenge.title}</p>
              <div className="progress-track mt-4">
                <div
                  className="progress-fill progress-pulse"
                  style={{ width: `${data.challenge.pct}%` }}
                />
              </div>
              <p className="mt-3 text-[1.02rem] text-[var(--ink-soft)]">
                {data.challenge.progress}/{data.challenge.goalCards} · {data.challenge.pct}%
              </p>
            </section>
          ) : null}
        </div>
      </div>

      <section className="mt-8">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <h2 className="display text-[clamp(1.6rem,5vw,2rem)]">Progression par theme</h2>
          <p className="text-[0.95rem] text-[var(--ink-faint)]">Ce qui tient vraiment</p>
        </div>
        <div className="mt-4 grid gap-3 lg:grid-cols-2">
          {data.themes
            .filter((t) => t.total > 0)
            .map((t, i) => (
              <div
                key={t.slug}
                className="surface px-5 py-4"
                style={{ animationDelay: `${i * 40}ms` }}
              >
                <div className="flex items-center justify-between gap-3 text-[1.02rem]">
                  <span>
                    {t.name}{" "}
                    <span className="text-[var(--ink-faint)]">({t.nameDe})</span>
                  </span>
                  <span className="font-semibold text-[var(--forest-deep)]">{t.pct}%</span>
                </div>
                <div className="progress-track mt-3">
                  <div className="progress-fill" style={{ width: `${t.pct}%` }} />
                </div>
                <p className="mt-2 text-[0.9rem] text-[var(--ink-faint)]">
                  {t.mastered}/{t.total} ancrees
                </p>
              </div>
            ))}
        </div>
      </section>
    </>
  );
}
