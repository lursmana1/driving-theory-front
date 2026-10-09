# prava.ge

Same rules as `.cursor/rules/project-architecture.mdc`. Keep both in sync.

Georgian driving-license **theory** exam prep. This repo is the **Next.js frontend**. Backend: NestJS (`github.com/lursmana1/driving-theory-back`), port 3000. Frontend typically 3001.

**Stack:** Next 16 App Router, React 19, TS, Tailwind 4, Ant Design 6, next-intl (`ka` default, `en`, `ru`; `localePrefix: "always"`). Alias `@/*` → `src/*`. Folder `src/utills` is misspelled — **do not rename**.

## Agent rules (save tokens)

- Reuse existing hooks / utils / API helpers. Do not duplicate or re-map the repo.
- Client HTTP: `src/api/BaseApi.ts` (Axios, Bearer from `src/lib/authToken.ts`). Server HTTP: `getServerBaseApi()`.
- Locale routes: `Link` / `useRouter` / `redirect` from `@/i18n/navigation`. Server redirect: `redirectTo()` in `@/i18n/redirectTo`.
- UI copy lives in `messages/{ka,en,ru}.json`.
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
/auth, /auth/logout    login/register
/createblog            admin only
```

SEO: `src/app/sitemap.ts` + `src/app/robots.ts` (public: home, tickets, subjectpicker, city-exam, yard-exam, blogs). Categories 0–9 (AM, B, A, C, D, …).

## Where code lives

| Area | Path |
|---|---|
| Exam UI | `src/components/ExamQuiz/` (`Quiz.tsx` + `useExamQuiz`) |
| Tickets UI | `src/components/TicketsQuiz/` |
| Profile | `ProfileClient` (auth gate), `ProfileHeader`, `ProfileAttemptStats`, `ProfileExamHistory`, `ProfileOverviewSection` |
| Auth UI | `src/components/AuthForm/`, `src/contexts/UserContext.tsx` |
| Header | `src/layoutComponents/Header/` |
| i18n / proxy | `src/i18n/`, `src/proxy.ts` |
| Types | `src/lib/types/` (`exam.ts` has `getAiTutorText`, `getQuestionAudioUrl`) |

## API (`src/api/`)

- `categories.ts` — `getCategories`, `getCategoryById`
- `examAttempts.ts` — `fetchExamClient`, `startPersonalizedExam`, `submitAnswer`, `finishExam`, `getAttemptsHistory`
- `examAttemptsServer.ts` — `fetchExamServer` (RSC)
- `userStats.ts` — `getReadiness`, `getWeakQuestions`, `getWeakSubjects`, `getSubjectProgress`, `getQuestionPool`
- `auth.ts` — `login`, `register`, `logout`, `getAuthConfig`

Backend in use: `POST /exam-attempts/start`, answers/finish, `GET /exam-attempts`, `GET /user-stats/*`, `GET /auth/me`, blogs. **Auth is Bearer in localStorage**, not httpOnly cookies.

## Hooks (`src/utills/helpers/hooks/`)

`exam/useExamQuiz`, `useAutoAdvance`, `useExamRestart`, `useExamProgress`, `useQuizNavigation`, `useArrowNavigation`, `useAnswerKeyboard`, `useSwipeable`, `useMediaQuery`, `useWindowSize`, `useProfileOverview`. Prefer these over `src/hooks/useWindowSize.tsx`.

## Utils (`src/utills/helpers/`)

`normalizeQuestions`, `getAnswers`, `getQuestionImageSrc`, `questionLinks` (`getQuestionTicketPath`), `formatDate`, `formatExamDuration`, `getReadTime`, `pagination`.

## lib / CONSTS

- lib: `auth.ts` (`getUser` RSC), `authToken.ts`, `apiBaseUrl.ts`, `statsRefresh.ts`, `sanitize.ts`, `seo.ts`, `site-metadata.ts`, `sitemap.ts`, `searchParams.ts`
- CONSTS: `categories.ts` (`DEFAULT_CATEGORY_ID = 1`), `subjects.ts`, `QuizExamConstats.ts`, `pagination.ts`, `navLinks.ts`, `categoryAssets.ts`, `icons.ts`
