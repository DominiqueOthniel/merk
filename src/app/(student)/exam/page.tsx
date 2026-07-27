"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BrandHeader } from "@/components/nav";

type ExamSet = {
  sourceId: string;
  title: string;
  section: string;
  skill: string;
  pairCount: number;
  dueCount: number;
  doneCount: number;
};

type SectionGroup = {
  section: string;
  due: number;
  sets: ExamSet[];
};

export default function ExamHubPage() {
  const [sections, setSections] = useState<SectionGroup[]>([]);
  const [totalDue, setTotalDue] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/exam/sets")
      .then((r) => r.json())
      .then((data) => {
        setSections(data.sections ?? []);
        setTotalDue(data.totalDue ?? 0);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <>
      <BrandHeader subtitle="Mode avant examen · TELC B1 Lesen" />

      <section className="panel fade-up mb-6">
        <p className="eyebrow">Preparation intensive</p>
        <p className="display mt-2 text-[clamp(1.7rem,5.5vw,2.2rem)]">
          Associe titre et texte
        </p>
        <p className="mt-3 text-[1.05rem] leading-relaxed text-[var(--ink-soft)]">
          Contenu format examen, rejoue avec repetition espacee. Mobile : un
          texte, un choix, pas de glisser-deposer.
        </p>
        <p className="mt-4 text-[1.02rem] font-semibold text-[var(--forest-deep)]">
          {totalDue} item{totalDue > 1 ? "s" : ""} a revoir
        </p>
      </section>

      {loading ? (
        <p className="text-[var(--ink-soft)]">Chargement...</p>
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
                        {set.pairCount} textes · {set.doneCount} deja vus
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
