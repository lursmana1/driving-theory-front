# prava.ge

Same rules as `.cursor/rules/project-architecture.mdc`. Keep both in sync.

Georgian driving-license **theory** exam prep. This repo is the **Next.js frontend**. Backend: NestJS (`github.com/lursmana1/driving-theory-back`), port 3000. Frontend typically 3001.

**Stack:** Next 16 App Router, React 19, TS, Tailwind 4, Ant Design 6, next-intl (`ka` default, `en`, `ru`; `localePrefix: "as-needed"`, default `ka` URLs unprefixed). Alias `@/*` → `src/*`. Folder `src/utills` is misspelled — **do not rename**.

## Agent rules (save tokens)

- **Token budget (owner, 2026-11-26): ~600K tokens per task, hard cap.** Before any bulk job (reading many images, many files, subagents, workflows), write the estimate in chat first: items × tokens per item × how many times the context is re-sent (every agent step re-sends its whole context, so cost grows with each image already read). If the estimate is over the cap, split the job and do the smallest piece first (e.g. a 3-route town, not 10 routes). Never fan out parallel agents on image work. Give each agent a hard limit in its prompt ("at most N images, 2–3 per step"). Once a job is running, don't kill it on a whim: plan the cost before launching, not after. Mistake to never repeat: 5 parallel agents × 7 zoomed images × 59 maps burned ~21M cached tokens in minutes and wrote nothing.
- **Never create Artifacts or Claude Docs** (nothing published to the Claude app, not even via `edits`). Plans and notes are `.md` files in the repo; edit files with Edit/Write.
- Reuse existing hooks / utils / API helpers. Do not duplicate or re-map the repo.
- Client HTTP: `src/api/BaseApi.ts` (Axios, `withCredentials`; no token in JS). Server HTTP: `getServerBaseApi()`.
- Locale routes: `Link` / `useRouter` / `redirect` from `@/i18n/navigation`. Server redirect: `redirectTo()` in `@/i18n/redirectTo`.
- UI copy lives in `messages/{ka,en,ru}.json`.
- **Client messages are trimmed.** Only namespaces in `CLIENT_NAMESPACES` (`src/i18n/clientMessages.ts`) reach the browser; server-only ones (Meta, Home, Blogs, …) stay on the server. A new `useTranslations("X")` in a client component needs "X" there, or in its route layout (`/plan` adds `StudyPlan`). Landing client islands get their `Home` strings as props (`landingLabels.ts`).
- **antd is not global.** `AppShell` lazy-loads `AntdTheme` (the ConfigProvider) for every route except those in `NO_ANTD_PATHS` (the landing page). Keep antd out of the landing page and the header.
- **Design tokens only.** Colors/radius/type/shadow are tokens in `src/app/globals.css` (TS hex mirror for Ant Design/SVG/OG: `src/styles/tokens.ts`, keep in sync). Use `bg-canvas|surface|surface-muted|surface-sunken`, `text-fg|fg-muted|fg-subtle|fg-faint`, `border-line`, `bg-accent`/`text-on-accent`, `success|danger|warning(-soft)`, dark exam `stage-*`, `rounded-xs|control|card|panel`, `shadow-card|raised|overlay`. Never raw Tailwind palette (`slate-*`, `white`, `rose-*`), hex, or `text-[15px]`-style arbitrary values. Change the brand by editing the `--brand-*` ramp. **Dark theme:** the same semantic tokens get night values under `:root[data-theme="dark"]` (globals.css; TS mirror `darkColor` in tokens.ts for antd / theme-color). `data-theme` is set before paint (`THEME_INIT_SCRIPT`, `src/utills/helpers/theme.ts`); switch = `ThemeToggle` in the header on every width (phones move the streak into `BurgerMenu` instead). Large brand areas use `hero`/`hero-strong`/`on-hero` (not `accent`), black line-art icons use `.icon-ink` / `.icon-ink-on-accent`, icons with no background of their own sit on `bg-plate`. Never style for one theme only; OG images and the manifest stay light.
- Exam size/pass/mistakes: `getExamRules(categoryId)` in `@/CONSTS/categories` — not hardcoded 30/3.
- `/leaderboard`, `/createleaderboard`, `/exam/history` **redirect** (stubs). History is on `/profile`.
- Feature work: follow `.claude/rules/product-roadmap.md` **in order**. Do not add monetization until the study plan ships.

## Module sitemap (`src/app/[locale]/`)

```
/                      landing (hero demo ticket 13, plan steps, features, exam rules table, route, FAQ; `src/components/landingSections/`, class recipes in `CONSTS/landing.ts`)
/tickets → /tickets/1  tickets index redirect
/tickets/[category]    practice tickets (?page&subjects&questionId)
/subjectpicker         pick subjects → /exam?category=&subjects=
/exam                  timed exam (no site header)
/profile               readiness, weak topics, attempt history (auth)
/practice              mistake trainer (auth, noindex) ?category&subjects — due mistakes one at a time
/blogs, /blogs/[id]    articles
/city-exam             practical technical Q&A (category switcher)
/city-exam/[city]      official exam route maps for the 10 exam cities (`EXAM_CITIES` in `CONSTS/cityRoutes.ts`, data `src/data/cityRoutes/official.json` from sa.gov.ge order №598, built by `scripts/city-routes/publish-official.mjs`); antd Select for city/category, routes by category, links to the other cities, breadcrumb + CollectionPage JSON-LD, map images in the sitemap. Re-check sa.gov.ge every 1–2 months
/yard-exam             yard elements + penalty points (GIFs) + narrated walkthrough video (`YardExamVideo`, 9:16, S3, no preload, VideoObject JSON-LD; pinned right column on desktop)
/signs                 road-sign atlas, opens on warning signs (grid 2/3/4 per row, click → explanation panel under the row; name search across groups)
/signs/category/[group] one page per sign group (own title/h1/ItemList JSON-LD); warning → redirects to /signs
                       Road markings: one column, picture + explanation always shown. No page per sign: a sign is `<group page>#<slug>`
/auth, /auth/logout    login/register; /auth/forgot-password, /auth/reset-password (noindex). Forgot-password link + page hidden while `PASSWORD_RESET_ENABLED` (`src/CONSTS/features.ts`) is `false`; the page then redirects to /auth
/createblog            admin only
```

SEO: `src/app/sitemap.ts` + `src/app/robots.ts` (public: home, tickets, subjectpicker, city-exam + the 10 city route pages, yard-exam, signs + sign group pages, blogs). Categories 0–9 (AM, B, A, C, D, …).

## Where code lives

| Area | Path |
|---|---|
| Exam UI | `src/components/ExamQuiz/` (`Quiz.tsx` + `useExamQuiz`) |
| Tickets UI | `src/components/TicketsQuiz/` |
| Profile | `ProfileClient` (auth gate), `ProfileHeader`, `ProfileAttemptStats`, `ProfileExamHistory`, `ProfileOverviewSection` (+ `ProfileTrainerCard`) |
| Mistake trainer | `src/components/Trainer/` (`TrainerPageClient`, `TrainerFeedback`, `TrainerSummaryBar`, `TrainerEndState`), hook `useTrainerSession`; reuses `TicketQuiz` (`onRecorded` prop) |
| Auth UI | `src/components/AuthForm/` (`LoginForm`, `ForgotPasswordForm`, `ResetPasswordForm`, `AuthPageShell`), `src/contexts/UserContext.tsx` |
| Header | `src/layoutComponents/Header/` (`HeaderNotifications` = bell panel; items come from `GET /auth/me` → `trainer: { categoryId, dueNow }[]`, one row per studied category. New sources such as the study plan add an item kind there, not a new badge) |
| Signs | `src/components/Signs/` (`SignsIndexView`, `SignsExplorer`, `SignGrid`, `SignMarkingsList`, `SignTile`, `SignLinkedText`), data `src/data/signs/` + `public/images/signs/`, helpers `src/lib/signs.ts` (server only) + `src/utills/helpers/signLinks.ts` |
| City routes | `src/components/CityRoutes/` (client: `CityRoutesViewer` → `RouteSidePanel`, `RoutePanel`, `MapFrame`, lazy `RouteZoomDialog`; server: `CityRoutesInfo`, `ExamCityLinks`; recipes `classes.ts`), hook `useCityRouteSelection`, server logic `src/lib/cityRoutes.ts` (groups, route numbers, updates; tested), data `src/data/cityRoutes/official.{json,ts}` |
| i18n / proxy | `src/i18n/`, `src/proxy.ts` |
| Types | `src/lib/types/` (`exam.ts` has `getAiTutorText`, `getQuestionAudioUrl`) |

## API (`src/api/`)

- `categories.ts` — `getCategories`, `getCategoryById`
- `examAttempts.ts` — `fetchExamClient`, `startPersonalizedExam`, `submitAnswer`, `finishExam`, `getAttemptsHistory`
- `examAttemptsServer.ts` — `fetchExamServer` (RSC)
- `userStats.ts` — `getReadiness`, `getWeakQuestions`, `getWeakSubjects`, `getSubjectProgress`, `getQuestionPool`
- `auth.ts` — `login`, `register`, `logout`, `getAuthConfig`, `forgotPassword`, `resetPassword`
- `trainer.ts` — `getTrainerSummary`, `getTrainerSession` (`GET /trainer/*`); `practiceAnswers.ts` response carries `progress` (review schedule is server-side)

Backend in use: `POST /exam-attempts/start`, answers/finish, `GET /exam-attempts`, `GET /user-stats/*`, `GET /auth/me`, blogs. **Auth is the httpOnly `access_token` cookie** set by the API (never stored in JS); signed-in state comes from `GET /auth/me`.

## Hooks (`src/utills/helpers/hooks/`)

`exam/useExamQuiz`, `useAutoAdvance`, `useExamRestart`, `useExamProgress`, `useQuizNavigation`, `useArrowNavigation`, `useAnswerKeyboard`, `useSwipeable`, `useMediaQuery`, `useWindowSize`, `useProfileOverview`, `useTrainerSession`, `usePracticeAnswers`. Prefer these over `src/hooks/useWindowSize.tsx`.

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
- CONSTS: `categories.ts` (`DEFAULT_CATEGORY_ID = 1`), `subjects.ts`, `QuizExamConstats.ts`, `pagination.ts`, `navLinks.ts`, `categoryAssets.ts`, `icons.ts`, `features.ts` (plain feature switches, not env), `yardExamVideo.ts` (video URL/poster/duration)
