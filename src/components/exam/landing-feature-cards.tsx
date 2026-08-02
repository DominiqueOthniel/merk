import Link from "next/link";
import { MerkAvatar, MERK_AVATARS } from "@/components/ui/merk-avatar";

const FEATURES = [
  {
    title: "Lesen & structure",
    blurb: "Textes, lacunes et associations au format examen.",
    avatar: MERK_AVATARS.lesen,
    tone: "lesen",
  },
  {
    title: "Horen guide",
    blurb: "Audio original ou synthese, avec limite d ecoutes.",
    avatar: MERK_AVATARS.horen,
    tone: "horen",
  },
  {
    title: "Schreiben & Sprechen",
    blurb: "Production ecrite et orale avec feedback entraineur.",
    avatar: MERK_AVATARS.sprechen,
    tone: "schreiben",
  },
] as const;

export function LandingFeatureCards() {
  return (
    <div className="feature-board">
      {FEATURES.map((f) => (
        <article key={f.title} className={`feature-card feature-card--${f.tone}`}>
          <MerkAvatar src={f.avatar} size="lg" shape="rounded" />
          <div>
            <h3 className="feature-card__title">{f.title}</h3>
            <p className="feature-card__blurb">{f.blurb}</p>
          </div>
        </article>
      ))}
      <Link href="/register" className="feature-card feature-card--cta">
        <MerkAvatar src={MERK_AVATARS.sprechen} size="lg" shape="rounded" />
        <div>
          <h3 className="feature-card__title">Creer mon compte</h3>
          <p className="feature-card__blurb">
            Choisis TELC ou Goethe et commence ta serie du jour.
          </p>
        </div>
      </Link>
    </div>
  );
}
