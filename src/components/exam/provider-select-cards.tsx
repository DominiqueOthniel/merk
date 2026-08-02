"use client";

import Link from "next/link";
import type { ExamProvider } from "@/lib/exam-provider";
import { MerkAvatar, MERK_AVATARS } from "@/components/ui/merk-avatar";

const PROVIDERS: {
  id: ExamProvider;
  label: string;
  title: string;
  blurb: string;
  levels: string[];
  skills: string[];
  tone: "telc" | "goethe";
  cta: string;
  avatar: string;
}[] = [
  {
    id: "TELC",
    label: "TELC",
    title: "telc Deutsch",
    blurb:
      "Parcours centre : Lesen, Sprachbausteine, Horen, Schreiben et Sprechen, avec repetition espacee.",
    levels: ["A1", "A2", "B1", "B2", "C1"],
    skills: ["Lesen", "Bausteine", "Horen", "Schreiben", "Sprechen"],
    tone: "telc",
    cta: "Commencer TELC",
    avatar: MERK_AVATARS.telc,
  },
  {
    id: "GOETHE",
    label: "Goethe",
    title: "Goethe-Zertifikat",
    blurb:
      "Parcours Goethe-Zertifikat : Lesen, Horen, Schreiben et Sprechen (sans Sprachbausteine), structure par Teils officiels.",
    levels: ["A1", "A2", "B1", "B2", "C1"],
    skills: ["Lesen", "Horen", "Schreiben", "Sprechen"],
    tone: "goethe",
    cta: "Commencer Goethe",
    avatar: MERK_AVATARS.goethe,
  },
];

type Props = {
  mode?: "links" | "select";
  value?: ExamProvider;
  onChange?: (value: ExamProvider) => void;
};

export function ProviderSelectCards({
  mode = "links",
  value,
  onChange,
}: Props) {
  return (
    <div className="provider-board">
      {PROVIDERS.map((p, index) => {
        const active = value === p.id;
        const inner = (
          <>
            <div className={`provider-card__hero provider-card__hero--${p.tone}`}>
              <MerkAvatar
                src={p.avatar}
                size="lg"
                shape="circle"
                className="provider-card__avatar"
              />
              <div className="provider-card__hero-text">
                <p className="provider-card__kicker">{p.label}</p>
                <p className="provider-card__title">{p.title}</p>
                <div className="provider-card__levels" aria-label="Niveaux">
                  {p.levels.map((level) => (
                    <span key={level}>{level}</span>
                  ))}
                </div>
              </div>
            </div>
            <div className="provider-card__body">
              <p className="provider-card__blurb">{p.blurb}</p>
              <ul className="provider-card__skills">
                {p.skills.map((skill) => (
                  <li key={skill}>{skill}</li>
                ))}
              </ul>
              {mode === "links" ? (
                <span className="provider-card__cta">{p.cta}</span>
              ) : (
                <span className="provider-card__cta">
                  {active ? "Selectionne" : "Choisir"}
                </span>
              )}
            </div>
          </>
        );

        if (mode === "select" && onChange) {
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => onChange(p.id)}
              aria-pressed={active}
              className={`provider-card provider-card--${p.tone} ${
                active ? "provider-card--active" : ""
              }`}
              style={{ animationDelay: `${index * 80}ms` }}
            >
              {inner}
            </button>
          );
        }

        return (
          <Link
            key={p.id}
            href={`/login?exam=${p.id}`}
            className={`provider-card provider-card--${p.tone}`}
            style={{ animationDelay: `${index * 80}ms` }}
          >
            {inner}
          </Link>
        );
      })}
    </div>
  );
}
