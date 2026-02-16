# Deploying to Vercel

## Prerequisites

1. GitHub account
2. Vercel account (free tier works)
3. OpenAI API key with credits

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

5. **Environment Variables** (critical):
   - `DATABASE_URL`: For production, use Vercel Postgres or Neon:
     - **Vercel Postgres**: Create a database in the Vercel dashboard -> copy the `POSTGRES_PRISMA_URL`
     - **Neon**: Sign up at neon.tech -> create database -> copy connection string
   - `OPENAI_API_KEY`: Your OpenAI API key

6. Click "Deploy"

### 3. Set up the database

After the first deploy (it may fail if DB isn't ready):

```bash
# Install Vercel CLI
npm i -g vercel

# Link project
vercel link

# Run migration on production database
vercel env pull .env.production
DATABASE_URL="<your-production-db-url>" npx prisma migrate deploy

# Run seed
DATABASE_URL="<your-production-db-url>" npx tsx prisma/seed.mjs
```

Or use Vercel's dashboard to run these as one-time commands.

### 4. Production database options

**Vercel Postgres** (easiest):
- Create in Vercel dashboard -> Storage -> Create Database -> Postgres
- Auto-injects `POSTGRES_PRISMA_URL` as `DATABASE_URL`
- Update `prisma/schema.prisma` provider to `"postgresql"`

**Neon** (free tier, fast):
1. Sign up at [neon.tech](https://neon.tech)
2. Create a database
3. Copy the connection string (ends with `?sslmode=require`)
4. Add to Vercel env vars as `DATABASE_URL`
5. Update `prisma/schema.prisma` provider to `"postgresql"`

### 5. Note on SQLite vs Postgres

The prototype uses SQLite for local dev. For production on Vercel:
1. Change `prisma/schema.prisma` datasource provider to `"postgresql"`
2. Run `npx prisma migrate dev` locally to create a new migration
3. Commit the new migration
4. Deploy to Vercel
5. Run `npx prisma migrate deploy` on production DB (see step 3)

## Hosted URL

After deployment, Vercel gives you a URL like:
- `https://ai-front-desk-xyz.vercel.app`

This is what you submit for the assignment.
