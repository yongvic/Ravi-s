# Quick Start - Ravi's

## Prerequis

- Node.js 18+
- Base PostgreSQL/Neon
- Token Blob pour upload video (si utilise)

## 1) Installation

```bash
git clone https://github.com/your-org/ravis.git
cd ravis
npm install
```

## 2) Configuration

```bash
cp .env.example .env
```

Exemple minimal:

```env
DATABASE_URL="postgresql://user:password@host/dbname?sslmode=require"
AUTH_SECRET="votre-secret"
NEXTAUTH_URL="http://localhost:3000"
BLOB_READ_WRITE_TOKEN="votre-token"
NODE_ENV="development"
```

## 3) Base de donnees

```bash
npx prisma db push
npx prisma generate
```

Optionnel:
```bash
npx prisma studio
```

## 4) Lancer le projet

```bash
npm run dev
```

Ouvrir `http://localhost:3000`.

## 5) Compte admin

1. Creer un compte utilisateur via les pages auth.
2. Ouvrir Prisma Studio.
3. Dans la table `User`, passer `role` a `ADMIN`.
4. Se reconnecter.

## Commandes utiles

| Commande | Action |
|---|---|
| `npm run dev` | Lancer en local |
| `npm run build` | Build production |
| `npx prisma db push` | Synchroniser le schema |
| `npx prisma generate` | Regenerer le client Prisma |
| `npx prisma studio` | Explorer la base |

## Depannage

- Erreur `DATABASE_URL`: verifier la chaine de connexion et l'acces DB.
- Erreur secret Auth: regenerer le secret et redemarrer.
- Echec upload video: verifier `BLOB_READ_WRITE_TOKEN`.
- Erreurs Prisma: `npx prisma generate`, puis restart serveur.

