# prava.ge

Same rules as `.cursor/rules/project-architecture.mdc`. Keep both in sync.

Georgian driving-license **theory** exam prep. This repo is the **Next.js frontend**. Backend: NestJS (`github.com/lursmana1/driving-theory-back`), port 3000. Frontend typically 3001.

**Stack:** Next 16 App Router, React 19, TS, Tailwind 4, Ant Design 6, next-intl (`ka` default, `en`, `ru`; `localePrefix: "as-needed"`, default `ka` URLs unprefixed). Alias `@/*` → `src/*`. Folder `src/utills` is misspelled — **do not rename**.

## Agent rules (save tokens)

- **Never create Artifacts or Claude Docs** (nothing published to the Claude app, not even via `edits`). Plans and notes are `.md` files in the repo; edit files with Edit/Write.
- Reuse existing hooks / utils / API helpers. Do not duplicate or re-map the repo.
- Client HTTP: `src/api/BaseApi.ts` (Axios, `withCredentials`; no token in JS). Server HTTP: `getServerBaseApi()`.
- Locale routes: `Link` / `useRouter` / `redirect` from `@/i18n/navigation`. Server redirect: `redirectTo()` in `@/i18n/redirectTo`.
- UI copy lives in `messages/{ka,en,ru}.json`.
- **Design tokens only.** Colors/radius/type/shadow are tokens in `src/app/globals.css` (TS hex mirror for Ant Design/SVG/OG: `src/styles/tokens.ts`, keep in sync). Use `bg-canvas|surface|surface-muted|surface-sunken`, `text-fg|fg-muted|fg-subtle|fg-faint`, `border-line`, `bg-accent`/`text-on-accent`, `success|danger|warning(-soft)`, dark exam `stage-*`, `rounded-xs|control|card|panel`, `shadow-card|raised|overlay`. Never raw Tailwind palette (`slate-*`, `white`, `rose-*`), hex, or `text-[15px]`-style arbitrary values. Change the brand by editing the `--brand-*` ramp.
- Exam size/pass/mistakes: `getExamRules(categoryId)` in `@/CONSTS/categories` — not hardcoded 30/3.
- `/leaderboard`, `/createleaderboard`, `/exam/history` **redirect** (stubs). History is on `/profile`.
- Feature work: follow `.claude/rules/product-roadmap.md` **in order**. Do not add monetization/PWA until listed items ship.

## Module sitemap (`src/app/[locale]/`)

```
/                      landing
/tickets → /tickets/1  tickets index redirect
/tickets/[category]    practice tickets (?page&subjects&questionId)
/subjectpicker         pick subjects → /exam?category=&subjects=
/exam                  timed exam (no site header)
/profile               readiness, weak topics, attempt history (auth)
/blogs, /blogs/[id]    articles
/city-exam             practical technical Q&A (category switcher)
/yard-exam             yard elements + penalty points (GIFs)
/signs                 road-sign atlas, opens on warning signs (grid 2/3/4 per row, click → explanation panel under the row; name search across groups)
/signs/category/[group] one page per sign group (own title/h1/ItemList JSON-LD); warning → redirects to /signs
                       Road markings: one column, picture + explanation always shown. No page per sign: a sign is `<group page>#<slug>`
/auth, /auth/logout    login/register
/createblog            admin only
```

SEO: `src/app/sitemap.ts` + `src/app/robots.ts` (public: home, tickets, subjectpicker, city-exam, yard-exam, signs + sign group pages, blogs). Categories 0–9 (AM, B, A, C, D, …).

## Where code lives

| Area | Path |
|---|---|
| Exam UI | `src/components/ExamQuiz/` (`Quiz.tsx` + `useExamQuiz`) |
| Tickets UI | `src/components/TicketsQuiz/` |
| Profile | `ProfileClient` (auth gate), `ProfileHeader`, `ProfileAttemptStats`, `ProfileExamHistory`, `ProfileOverviewSection` |
| Auth UI | `src/components/AuthForm/`, `src/contexts/UserContext.tsx` |
| Header | `src/layoutComponents/Header/` |
| Signs | `src/components/Signs/` (`SignsIndexView`, `SignsExplorer`, `SignGrid`, `SignMarkingsList`, `SignTile`, `SignLinkedText`), data `src/data/signs/` + `public/images/signs/`, helpers `src/lib/signs.ts` (server only) + `src/utills/helpers/signLinks.ts` |
| i18n / proxy | `src/i18n/`, `src/proxy.ts` |
| Types | `src/lib/types/` (`exam.ts` has `getAiTutorText`, `getQuestionAudioUrl`) |

## API (`src/api/`)

- `categories.ts` — `getCategories`, `getCategoryById`
- `examAttempts.ts` — `fetchExamClient`, `startPersonalizedExam`, `submitAnswer`, `finishExam`, `getAttemptsHistory`
- `examAttemptsServer.ts` — `fetchExamServer` (RSC)
- `userStats.ts` — `getReadiness`, `getWeakQuestions`, `getWeakSubjects`, `getSubjectProgress`, `getQuestionPool`
- `auth.ts` — `login`, `register`, `logout`, `getAuthConfig`

Backend in use: `POST /exam-attempts/start`, answers/finish, `GET /exam-attempts`, `GET /user-stats/*`, `GET /auth/me`, blogs. **Auth is the httpOnly `access_token` cookie** set by the API (never stored in JS); signed-in state comes from `GET /auth/me`.

## Hooks (`src/utills/helpers/hooks/`)

`exam/useExamQuiz`, `useAutoAdvance`, `useExamRestart`, `useExamProgress`, `useQuizNavigation`, `useArrowNavigation`, `useAnswerKeyboard`, `useSwipeable`, `useMediaQuery`, `useWindowSize`, `useProfileOverview`. Prefer these over `src/hooks/useWindowSize.tsx`.

## Utils (`src/utills/helpers/`)

`normalizeQuestions`, `getAnswers`, `getQuestionImageSrc`, `questionLinks` (`getQuestionTicketPath`), `formatDate`, `formatExamDuration`, `getReadTime`, `pagination`.

## Signs (front-only, no API)

- Data comes from teoria.on.ge: `node scripts/signs/crawl.mjs` → `Desktop/pravage-signs`. English/Russian names + explanations live in `Desktop/pravage-signs/i18n/{en,ru}.json` (translated by Claude, not Gemini — keep sign numbers exact, ПДД / Vienna terms). `node scripts/signs/import.mjs` → `src/data/signs/signs.json` (ka, server only), `src/data/signs/i18n/{en,ru}.json` (server only), `lookup.{ka,en,ru}.json` (slim number → sign map, the client loads only its own language, lazily) and the SVGs. Sign translations never go into `messages/`. Don't hand-edit the JSON; re-run import.
- Slugs never contain dots (`3-24`, `1-4-1--1-4-6`, `marking-1-1`): `src/proxy.ts` skips any path with a dot.
- Group URLs: `src/CONSTS/signGroups.ts` (`signGroupHref`). Search is by sign name only, with a simple Georgian stem match (drops the final vowel of longer words).
- Every sign `<img>` has width/height and sits in an aspect-ratio box (no layout shift).
- Sign numbers in ticket explanations / AI tutor text / sign explanations become popover links via `SignLinkedText`. A number only links when the word next to it is ნიშანი/ნიშნ…/მონიშვნ…, sign(s)/marking(s), знак…/разметк… (`splitSignRefs`), so "დანართის 4.3 პუნქტის" / "clause 4.3" stays plain text. Touch devices use click, hover devices use hover.
- Every sign's explanation is in the HTML (a hidden copy under each grid item) so the group's text is indexed. Don't write the URL hash on click (Next router error); only read `#slug` on load / `hashchange`.
- Desktop picks groups with link chips at the top; phones use an antd `Select` (the chips stay in the HTML for crawlers).

## lib / CONSTS

- lib: `auth.ts` (`getUser` RSC), `legacyAuthStorage.ts`, `apiBaseUrl.ts`, `statsRefresh.ts`, `sanitize.ts`, `seo.ts`, `site-metadata.ts`, `sitemap.ts`, `searchParams.ts`
- CONSTS: `categories.ts` (`DEFAULT_CATEGORY_ID = 1`), `subjects.ts`, `QuizExamConstats.ts`, `pagination.ts`, `navLinks.ts`, `categoryAssets.ts`, `icons.ts`


## Dev-only changes (do not merge `dev` into `main`)

- **2026-10-26:** `dev` has a sitemap change that must not reach `main`: commit `b761abe` gives the `src/lib/sitemap.ts` API calls an 8 s timeout (`SITEMAP_FETCH_TIMEOUT_MS`), because the dev API's Neon database was down and the Vercel Preview build hung on `/sitemap.xml`. `main` keeps the original sitemap.
- The user does **not** want `dev` merged into `main` while this is on `dev`. Agents: refuse to merge / push it to `main`; to merge, first `git revert b761abe` on `dev` and remove this section.
- Local guard (not in the repo, this machine only): `.git/hooks/reference-transaction` and `.git/hooks/pre-push` block moving or pushing `main` to a commit whose sitemap contains `SITEMAP_FETCH_TIMEOUT_MS`. They do **not** stop a merge on GitHub (PR merge button).
