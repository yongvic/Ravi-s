# Ravi's

> Plateforme francaise d'apprentissage de l'anglais professionnel pour le personnel cabine.

## Presentation

Ravi's est une application web full-stack pour entrainer l'anglais aeronautique avec un parcours pedagogique gamifie.

Fonctionnalites principales:
- Modes d'exercices (passager, accent, urgence, role-play, ecoute, quiz, vocabulaire, speaking, simulation cabine, etc.)
- Points Kiki, badges, progression hebdomadaire
- Upload video et revue admin
- Wizard onboarding et plan personnalise 30/60/90 jours
- Export PDF du plan

## Stack

- Next.js (App Router)
- TypeScript
- Auth.js / NextAuth
- Prisma + Neon (PostgreSQL)
- Cloudinary / Vercel Blob (selon integration)
- Puppeteer
- Tailwind + shadcn/ui

## Demarrage rapide

Voir [QUICKSTART.md](./QUICKSTART.md).

Commandes essentielles:
```bash
npm install
cp .env.example .env
npx prisma db push
npm run dev
```

## Variables d'environnement

| Variable | Requise | Description |
|---|---|---|
| `DATABASE_URL` | Oui | Chaine de connexion PostgreSQL/Neon |
| `AUTH_SECRET` | Oui | Secret de signature |
| `NEXTAUTH_URL` | Oui | URL de l'app |
| `BLOB_READ_WRITE_TOKEN` | Oui (upload video) | Token stockage blob |
| `RESEND_API_KEY` | Optionnelle | Envoi emails systeme |

## API (resume)

Public:
- `POST /api/auth/register`
- `POST /api/auth/[...nextauth]`

Utilisateur connecte:
- `GET /api/user/stats`
- `GET /api/user/progress`
- `GET /api/exercises`
- `POST /api/exercises/complete`
- `POST /api/videos/upload`
- `GET /api/gamification`

Admin:
- `GET /api/admin/stats`
- `GET /api/admin/videos`
- `GET /api/admin/videos/[id]`
- `PATCH /api/admin/videos/[id]`
- `GET /api/admin/students`

## Securite

- Hash des mots de passe (bcrypt)
- Sessions JWT via Auth.js
- Protection des routes par authentification et role
- Validation d'entrees cote serveur
- Prisma pour limiter les risques d'injection SQL

## Base de donnees

Schema Prisma principal:
- `User`, `Onboarding`, `LearningPlan`, `Module`, `Exercise`, `Video`, `AdminFeedback`, `KikiPoints`, `Badge`, `Wish`, `AirportMap`

Commandes utiles:
```bash
npx prisma db push
npx prisma generate
npx prisma studio
```

## Notes projet

- Nom officiel: `Ravi's`
- Interface: francais
- Contenus pedagogiques d'exercices: anglais

Derniere mise a jour: mars 2026

