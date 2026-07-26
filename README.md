# MERK.

Plateforme de retention linguistique complementaire aux centres de formation.
MVP aligne sur le cahier des charges (auth, placement CECR, banque theme x niveau, moteur SM-2, dashboard, defi de cohorte, back-office centre).

## Stack

- Next.js 15 (App Router) + TypeScript + Tailwind CSS 4
- Prisma 5 + SQLite (dev), schema portable vers Postgres
- Auth.js (credentials)
- Algorithme de repetition espacee type SM-2

## Demarrage

```bash
npm install
npx prisma migrate dev
npm run db:seed
npm run dev
```

Ouvre [http://localhost:3000](http://localhost:3000).

## Comptes demo

| Role | Email | Mot de passe |
|------|-------|--------------|
| Eleve | eleve@merk.demo | merk1234 |
| Eleve 2 | eleve2@merk.demo | merk1234 |
| Admin centre | admin@merk.demo | merk1234 |

Le seed cree aussi un centre `Akademie Berlin Demo`, une cohorte `A2 Abendgruppe`, 12 themes, 72 cartes allemandes (A1 a B1) et un defi hebdomadaire.

## Parcours cles

1. **Eleve** : login → revision immediate des cartes dues → feedback → Difficile / Moyen / Facile
2. **Placement** : apres inscription, mini-test CECR puis attribution des cartes
3. **Carnet** : score de preparation, streak, progression par theme
4. **Defi** : objectif collectif + classement de cohorte
5. **Admin** : vue cohortes, retention, alertes inactifs (> 7 jours)

## Scripts utiles

- `npm run dev` : serveur de developpement
- `npm run build` : build production
- `npm run db:seed` : recharger les donnees demo
- `npm run db:reset` : reset DB + seed

## Decisions techniques

- Contenu autonome (pas d'import OCR des supports centre)
- Production active en texte ; enregistrement audio visible sans evaluation auto (V2)
- Points de retention dans une fourchette 30–50 selon difficulte et regularite
- Architecture multi-langue prete : `Card.language` + themes independants de la langue
