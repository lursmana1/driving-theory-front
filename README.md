# prava.ge

> Georgian driving license theory exam prep — practice tickets, timed exams, and progress tracking.

[![Live on Vercel](https://img.shields.io/badge/Live-prava--orcin.vercel.app-000?style=for-the-badge&logo=vercel&logoColor=white)](https://prava-orcin.vercel.app)
[![Website](https://img.shields.io/badge/Website-prava.ucos.ge-0ea5e9?style=for-the-badge)](https://prava.ucos.ge)

**Try it:** [prava-orcin.vercel.app](https://prava-orcin.vercel.app) · [prava.ucos.ge](https://prava.ucos.ge)

---

## About

**prava.ge** helps users prepare for the Georgian driving license theory exam. Pick a license category (AM, A/A1, B/B1, C, D…), practice by topic, take realistic timed exams, and review weak areas on a personal profile.

| | |
|---|---|
| **Frontend** | This repo — [github.com/lursmana1/prava](https://github.com/lursmana1/prava) |
| **Backend** | [github.com/lursmana1/nest](https://github.com/lursmana1/nest) |
| **Deploy** | [Vercel](https://prava-orcin.vercel.app) + [Render](https://nest-bw53.onrender.com) (API) |

## Features

- Practice questions by **category** and **subject**
- **Timed exams** with official rules per category (question count, pass score, max mistakes)
- **Subject picker** before starting an exam
- **Profile** — history, pass rate, weak questions & subjects
- **Languages** — Georgian (default), English, Russian
- **Auth** — email/password + Google

## Tech stack

- **Next.js 16** (App Router) · **React 19** · **TypeScript**
- **Tailwind CSS 4** · **Ant Design 6**
- **next-intl** · **Axios** (cookie-based auth)
- **NestJS** API ([separate repo](https://github.com/lursmana1/nest))

## Getting started

### Requirements

- Node.js 20+
- [Nest backend](https://github.com/lursmana1/nest) running locally or use the deployed API

### Install

```bash
git clone https://github.com/lursmana1/prava.git
cd prava
npm install
```

### Environment

Create `.env.local`:

```env
NEXT_PUBLIC_BACKEND_URL=http://localhost:3000
```

For production builds, point to the deployed API:

```env
NEXT_PUBLIC_BACKEND_URL=https://nest-bw53.onrender.com
```

### Run

```bash
# Terminal 1 — backend (see nest repo), port 3000
# Terminal 2 — frontend
npm run dev
```

Open [http://localhost:3001](http://localhost:3001).

### Scripts

```bash
npm run dev        # development
npm run build      # production build
npm run start      # serve build
npm run lint       # eslint
npm run typecheck  # tsc --noEmit
```

## Deploy on Vercel

1. Fork or import [this repository](https://github.com/lursmana1/prava)
2. Add env var: `NEXT_PUBLIC_BACKEND_URL=https://nest-bw53.onrender.com`
3. Deploy

Preview / production URL: **[https://prava-orcin.vercel.app](https://prava-orcin.vercel.app)**

## Routes

| Path | Description |
|------|-------------|
| `/` | Landing |
| `/subjectpicker` | Category + topics → start exam |
| `/exam` | Timed exam |
| `/tickets/[category]` | Practice by topic |
| `/profile` | Stats & history |
| `/auth` | Login / register |

## Exam rules

Per-category rules (questions, pass score, allowed mistakes) live in `src/data/categories.json` and are loaded via `getExamRules()` in `src/CONSTS/categories.ts`.

## Google sign-in (production)

OAuth runs on the **API**, not on Vercel.

| | Value |
|---|--------|
| Callback (`GOOGLE_CALLBACK_URL` on Render) | `https://nest-bw53.onrender.com/auth/google/callback` |
| After login (`GOOGLE_REDIRECT_AFTER_LOGIN`) | `https://prava.ucos.ge/ka/profile` |
| [Google Console](https://console.cloud.google.com/apis/credentials) redirect URIs | `…/auth/google/callback` on localhost + Render only |

## Project layout

```
src/
├── app/[locale]/     # App Router (ka, en, ru)
├── api/              # API client
├── components/       # Feature UI
├── CONSTS/           # Categories, subjects, rules
├── contexts/         # Auth (client)
├── data/             # Static JSON
└── i18n/             # Locales
```

## License

Private / all rights reserved unless stated otherwise.
