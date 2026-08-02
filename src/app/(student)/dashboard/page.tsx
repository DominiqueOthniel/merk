"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BrandHeader } from "@/components/nav";

type Dash = {
  user: {
    name: string;
    cefrLevel: string | null;
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

export default function DashboardPage() {
  const [data, setData] = useState<Dash | null>(null);

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/dashboard")
      .then(async (r) => {
        const text = await r.text();
        if (!r.ok) {
          throw new Error(text || `Erreur ${r.status}`);
        }
        if (!text) {
          throw new Error("Reponse vide du serveur");
        }
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
        <p className="text-[1.1rem] text-[var(--ink-soft)]">Chargement...</p>
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

  return (
    <>
      <BrandHeader subtitle={`Carnet de ${data.user.name}`} />

      <div className="lg:grid lg:grid-cols-[1.35fr_0.85fr] lg:items-start lg:gap-5">
        <section className="panel fade-up">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="eyebrow">Score de preparation</p>
              <p className="display mt-2 text-[clamp(3.4rem,12vw,4.6rem)] text-[var(--forest-deep)]">
                {data.prepScore}
              </p>
              <p className="mt-2 text-[1.1rem] font-semibold text-[var(--forest)]">
                {data.prepLabel}
              </p>
            </div>
            <div className="space-y-1 text-right text-[1.02rem] text-[var(--ink-soft)]">
              <p>Niveau {data.user.cefrLevel ?? "?"}</p>
              <p>Serie {data.user.streakDays} j</p>
              <p>{data.user.totalPoints} pts</p>
            </div>
          </div>
          {nextSession ? (
            <p className="mt-6 rounded-[1.25rem] bg-[var(--forest-soft)] px-4 py-3 text-[1.02rem] leading-relaxed text-[var(--forest-deep)]">
              Prochaine seance : {nextSession}
              {data.dueCount > 0
                ? ` · il te reste ${data.dueCount} carte${data.dueCount > 1 ? "s" : ""}`
                : " · tu es a jour"}
            </p>
          ) : null}
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <Link href="/review" className="btn-link btn-link-primary">
              {data.dueCount > 0
                ? `Reviser ${data.dueCount} carte${data.dueCount > 1 ? "s" : ""}`
                : "Ouvrir la revision"}
            </Link>
            <Link href="/exam" className="btn-link btn-link-secondary">
              Mode avant examen TELC
            </Link>
          </div>
        </section>

        <div className="mt-5 space-y-4 lg:mt-0">
          <section className="fade-up-delay grid grid-cols-2 gap-4">
            <div className="surface px-5 py-5">
              <p className="eyebrow">Aujourd hui</p>
              <p className="display mt-2 text-4xl">{data.doneToday}</p>
            </div>
            <div className="surface px-5 py-5">
              <p className="eyebrow">Encore dues</p>
              <p className="display mt-2 text-4xl">{data.dueCount}</p>
            </div>
          </section>

          {data.challenge ? (
            <section className="surface px-5 py-5">
              <p className="eyebrow">Defi de cohorte</p>
              <p className="mt-2 text-[1.15rem] font-semibold">{data.challenge.title}</p>
              <div className="progress-track mt-4">
                <div
                  className="progress-fill"
                  style={{ width: `${data.challenge.pct}%` }}
                />
              </div>
              <p className="mt-3 text-[1.02rem] text-[var(--ink-soft)]">
                {data.challenge.progress}/{data.challenge.goalCards}
              </p>
            </section>
          ) : null}
        </div>
      </div>

      <section className="mt-8">
        <h2 className="display text-[clamp(1.6rem,5vw,2rem)]">Progression par theme</h2>
        <div className="mt-4 grid gap-3 lg:grid-cols-2">
          {data.themes
            .filter((t) => t.total > 0)
            .map((t) => (
              <div key={t.slug} className="surface px-5 py-4">
                <div className="flex items-center justify-between gap-3 text-[1.02rem]">
                  <span>
                    {t.name}{" "}
                    <span className="text-[var(--ink-faint)]">({t.nameDe})</span>
                  </span>
                  <span className="font-semibold">{t.pct}%</span>
                </div>
                <div className="progress-track mt-3">
                  <div className="progress-fill" style={{ width: `${t.pct}%` }} />
                </div>
              </div>
            ))}
        </div>
      </section>
    </>
  );
}
