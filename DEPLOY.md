# Deploying to Vercel

## Prerequisites

1. GitHub account
2. Vercel account (free tier works)
3. OpenAI API key with credits
4. Neon Postgres database (provisioned via Vercel Storage or neon.tech)

## Steps

### 1. Push to GitHub

```bash
# Create a new GitHub repo (via GitHub.com or gh CLI)
gh repo create ai-front-desk --public --source=. --remote=origin

# Push
git push -u origin main
```

Or manually:
1. Create a new repo on GitHub.com
2. Add it as remote: `git remote add origin <your-repo-url>`
3. Push: `git push -u origin main`

### 2. Deploy on Vercel

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "Add New Project"
3. Import your `ai-front-desk` repository
4. Configure:
   - **Framework Preset**: Next.js (auto-detected)
   - **Build Command**: `npm run build` (default)
   - **Output Directory**: `.next` (default)
   - **Install Command**: `npm install` (default)

5. **Environment Variables** (critical — all 3 are required):
   - `DATABASE_URL`: Your Neon **pooled** connection string (ends with `?sslmode=require`)
   - `DATABASE_URL_UNPOOLED`: Your Neon **unpooled / direct** connection string (ends with `?sslmode=require`)
   - `OPENAI_API_KEY`: Your OpenAI API key

   If you added Neon via Vercel Storage, these variables are auto-injected.

6. Click "Deploy"

### 3. Database setup

The database schema is pushed using `prisma db push` (no migrations directory needed).

If you need to re-push the schema or re-seed:

```bash
# Push schema to Neon
DATABASE_URL="<your-pooled-url>" DATABASE_URL_UNPOOLED="<your-direct-url>" npx prisma db push

# Seed the database
DATABASE_URL="<your-pooled-url>" npx tsx prisma/seed.mjs
```

### 4. How Prisma connects to Neon

The schema uses two connection strings:

- `DATABASE_URL` (pooled via pgbouncer) — used at runtime for queries
- `DATABASE_URL_UNPOOLED` (direct) — used by Prisma for schema push/migrations

Both are provided automatically if you provision Neon through Vercel Storage.

### 5. Vercel build pipeline

The `postinstall` script runs `prisma generate` to ensure the Prisma client is generated during Vercel's `npm install` step. The build script also chains `prisma generate && next build` as a fallback.

## Hosted URL

After deployment, Vercel gives you a URL like:
- `https://ai-front-desk-xyz.vercel.app`

This is what you submit for the assignment.
