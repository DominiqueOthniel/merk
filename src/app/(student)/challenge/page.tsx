"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BrandHeader } from "@/components/nav";

type Dash = {
  challenge: {
    title: string;
    goalCards: number;
    progress: number;
    pct: number;
    endsAt: string;
  } | null;
  ranking: { name: string; points: number; isYou: boolean }[];
  user: { cohorte: string | null };
};

export default function ChallengePage() {
  const [data, setData] = useState<Dash | null>(null);

  useEffect(() => {
    fetch("/api/dashboard")
      .then((r) => r.json())
      .then(setData);
  }, []);

  if (!data) {
    return (
      <>
        <BrandHeader subtitle="Emulation de groupe" />
        <p className="text-[1.1rem] text-[var(--ink-soft)]">Chargement...</p>
      </>
    );
  }

  return (
    <>
      <BrandHeader
        subtitle={
          data.user.cohorte
            ? `Cohorte ${data.user.cohorte}`
            : "Pas encore de cohorte"
        }
      />

      {data.challenge ? (
        <section className="panel fade-up">
          <p className="eyebrow">Objectif hebdomadaire</p>
          <h1 className="display mt-3 text-[clamp(1.8rem,6vw,2.4rem)]">
            {data.challenge.title}
          </h1>
          <div className="progress-track mt-6">
            <div
              className="progress-fill progress-pulse"
              style={{ width: `${data.challenge.pct}%` }}
            />
          </div>
          <p className="mt-4 text-[1.05rem] text-[var(--ink-soft)]">
            {data.challenge.progress} / {data.challenge.goalCards} cartes · fin{" "}
            {new Date(data.challenge.endsAt).toLocaleDateString("fr-FR")}
          </p>
          <Link href="/anki" className="btn-link btn-link-primary mt-7">
            Contribuer au defi
          </Link>
        </section>
      ) : (
        <section className="panel">
          <p className="text-[1.1rem]">Aucun defi actif pour ta cohorte cette semaine.</p>
        </section>
      )}

      <section className="mt-8">
        <h2 className="display text-[clamp(1.6rem,5vw,2rem)]">Classement</h2>
        <div className="mt-4 space-y-3">
          {data.ranking.length === 0 ? (
            <p className="text-[1.05rem] text-[var(--ink-soft)]">
              Rejoins une cohorte pour voir le classement.
            </p>
          ) : (
            data.ranking.map((row, i) => (
              <div
                key={`${row.name}-${i}`}
                className={`flex items-center justify-between rounded-[1.4rem] px-5 py-4 text-[1.05rem] ${
                  row.isYou
                    ? "bg-[var(--forest)] text-white shadow-[0_12px_24px_rgba(26,107,72,0.25)]"
                    : "surface"
                }`}
              >
                <span>
                  <span className={`mr-3 ${row.isYou ? "text-white/70" : "text-[var(--ink-faint)]"}`}>
                    {i + 1}.
                  </span>
                  {row.name}
                  {row.isYou ? " (toi)" : ""}
                </span>
                <span className="font-semibold">{row.points} pts</span>
              </div>
            ))
          )}
        </div>
      </section>
    </>
  );
}
