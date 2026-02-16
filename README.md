# AI Front Desk — 123 Preschool

An AI-powered front desk assistant for early education centers. Parents get fast, trustworthy answers grounded in school policies. Operators see what's being asked and can improve the system over time.

## Quick Start

```bash
npm install
npx prisma migrate dev --name init
npm run seed
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and select a user to log in.

## Seed Users

| Name | Role | Email |
|------|------|-------|
| Leslie Knope | Admin | leslie@123preschool.com |
| Dwight Schrute | Staff | dwight@123preschool.com |
| Monica Geller | Parent | monica@parent.com |
| David Rose | Parent | david@parent.com |

**To switch users:** Click your avatar at the bottom of the sidebar to log out, then select a different user.

## Environment Variables

Copy `.env.example` to `.env` and fill in:

- `DATABASE_URL` — SQLite connection string (default: `file:./dev.db`)
- `OPENAI_API_KEY` — Your OpenAI API key

## Tech Stack

- **Next.js 16** (App Router, TypeScript)
- **Prisma** + SQLite (Postgres-ready)
- **Vercel AI SDK** + OpenAI (GPT-4o mini)
- **shadcn/ui** components
- **Tailwind CSS v4**

## Features

### Parent Experience
- Proactive daily briefing (time-aware: today's lunch, pickup time, upcoming events)
- Conversational AI chat grounded in school policies
- Suggestion cards for common questions
- Graceful uncertainty handling

### Operator Experience
- Personalized welcome with question stats
- Knowledge base editor (inline edit, add new entries)
- Question log with "needs attention" badges for struggles
- All changes immediately reflected in AI responses

## Design

- **Palette**: Indigo/periwinkle (#6366F1) as the primary accent
- **Icons**: Lucide icon library throughout (no emojis)
- **Layout**: Light, airy with generous whitespace
- **Mobile-first**: Responsive design for all screens

## Architecture

- **Knowledge table**: All school policies stored as structured entries; AI grounds answers from this
- **Conversations + Messages**: Logged with `struggle` and `noMatch` flags for operator analytics
- **Briefing API**: Time-aware endpoint that returns contextual info cards for parents
- **Mock auth**: Cookie-based role switcher for prototype (no NextAuth overhead)
