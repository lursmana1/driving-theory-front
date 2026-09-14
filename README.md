# prava.ge

Georgian driving-license theory exam prep — practice tickets, timed exams, and progress tracking.

[![Website](https://img.shields.io/badge/Live-prava.ge-B4543C?style=for-the-badge)](https://prava.ge)
[![API](https://img.shields.io/badge/API-api.prava.ge-22251C?style=for-the-badge)](https://api.prava.ge)

**Live:** [https://prava.ge](https://prava.ge) · **API:** [https://api.prava.ge](https://api.prava.ge)

---

## About

**prava.ge** helps users prepare for the Georgian driving license theory exam. Pick a license category (AM, A/A1, B/B1, C, D…), practice by topic, take realistic timed exams, and review weak areas on a personal profile.

| | |
|---|---|
| **Frontend** | This repo — [github.com/lursmana1/driving-theory-front](https://github.com/lursmana1/driving-theory-front) |
| **Backend** | [github.com/lursmana1/driving-theory-back](https://github.com/lursmana1/driving-theory-back) |
| **Host** | Hetzner via Coolify (Nixpacks). Site `https://prava.ge`, API `https://api.prava.ge`. |

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
- **next-intl** · **Axios** (Bearer token; Google session cookie on the API)
- **NestJS** API ([driving-theory-back](https://github.com/lursmana1/driving-theory-back))

## Getting started

### Requirements

- Node.js 22
- [Nest backend](https://github.com/lursmana1/driving-theory-back) running locally, or the live API

### Install

```bash
git clone https://github.com/lursmana1/driving-theory-front.git
cd prava
npm install
```

### Environment

Create `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

`getApiBaseUrl()` also accepts `NEXT_PUBLIC_BACKEND_URL` if `NEXT_PUBLIC_API_URL` is unset. No trailing slash.

Production (already set in Coolify as **Build** variables):

```env
NEXT_PUBLIC_API_URL=https://api.prava.ge
NEXT_PUBLIC_SITE_URL=https://prava.ge
```

`NEXT_PUBLIC_*` is compiled into the browser bundle. Changing one needs a Coolify **redeploy** (force without cache if the old host sticks), not a restart.

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

## Deploy (Coolify / Hetzner)

The production app is **https://prava.ge**. Coolify uses **Nixpacks** (no Dockerfile). Full checklist: [`deploy/coolify.md`](deploy/coolify.md).

| Setting | Value |
|---|---|
| Build pack | Nixpacks |
| Ports Exposes | `3000` |
| Domain | `https://prava.ge` |
| Health check | `/api/health` |
| API | `NEXT_PUBLIC_API_URL=https://api.prava.ge` (Build + Runtime) |
| Canonical | `NEXT_PUBLIC_SITE_URL=https://prava.ge` (Build + Runtime) |

The NestJS app must allow CORS from `https://prava.ge` with credentials. Tickets render on the Next server; exam, auth, and answers run in the browser.

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

OAuth runs on the **API**, not on the Next app.

| | Value |
|---|--------|
| Callback | `https://api.prava.ge/auth/google/callback` |
| After login | `https://prava.ge/ka/profile` |
| [Google Console](https://console.cloud.google.com/apis/credentials) redirect URIs | `…/auth/google/callback` on localhost + `https://api.prava.ge` |

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
