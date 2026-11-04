# Build next (in order)

Same rules as `.cursor/rules/product-roadmap.mdc`. Keep both in sync.

The study plan is the only big item left. Build it phase by phase. Do not start monetization or extra landing sections before it ships.

## Shipped (do not rebuild)

- Mistake trainer: `/practice`, `useTrainerSession`, header bell (`GET /auth/me` → `trainer`)
- Post-exam review: wrong answers walked with AI tutor + audio (`ExamReview.tsx`)
- Auth polish: login/register errors, guest exam → progress saved after signup, forgot/reset password
- Honest landing: no 50k / 98% stats, leaderboard off the landing, blog copy translated
- PWA (installable app), road signs `/signs`, yard exam video
- Study plan phase 0: 04:00 Tbilisi study day (`STUDY_DAY_START_HOUR` + `study_day()` on the backend) and password reset

## Waiting on ops (no code)

- Password reset is hidden behind `PASSWORD_RESET_ENABLED` in `src/CONSTS/features.ts`. Set it to `true` once the Resend domain DNS is verified and the backend has `RESEND_API_KEY` / `EMAIL_FROM`

## 1. Study plan (the current feature)

Sources, in order of authority: `plans/reports/Study plan design research.md` (its phase table wins), then `plans/study-plan-roadmap.md` and backend `nneesstt/docs/study-plan-roadmap.md`. Each phase ships on its own, **backend first**. The front never fakes a field the API doesn't send.

1. **Preview (public).** Pure lesson + schedule builders, `GET /study-plans/preview`. `/plan` picker: exam date first (3–60 days), 7 / 14 / 28 presets, "not booked yet", minutes per day. Add `/plan` to `sitemap.ts` + `buildMetadata`
2. **Plan + day path (auth).** `study_plans` / `study_plan_steps`, day path (learn → mix → review → day test), one new day per study day (04:00, no bonus day). Day test graded on the server, **never** written to `exam_attempts`; end walk-through reuses `ExamReview`. Lesson runner reuses `TicketQuiz` + `onRecorded`
3. **Behind, edits, bell.** Rebalance instead of a backlog, change exam date, fresh-start restart, streak freezes, `ProfileStudyPlanCard`, a `plan` item kind in `HeaderNotifications` (no new badge)
4. **Guest day 1.** Guest answers in `localStorage`, uploaded once via `POST /practice-answers/bulk` after signup
5. **Review everything + effort score.** `reviewAt` ladder (+2 / +6 / +12 d, capped at days to exam − 1), plan end = readiness `readyForExam`. Leaderboard decision here: real weekly effort scores, opt-in, no filler names, or delete the stubs (`/leaderboard`, `/createleaderboard`, `CreateLeaderboardForm`)
6. **Extras, only if the data says so.** Push reminders, placement test. (Games — `pairs`, `speed`, matching, points — dropped by the owner.)

Thresholds are ratios of `getExamRules(categoryId)`, never fixed numbers.

**Lesson content (teach first, then ask):** `plans/study-plan-content-plan.md`. One card model for signs and rules from the start (JSON in git = source, Postgres = seeded copy): card → its tickets. Steps 0–4 in order. **No games** (no matching, speed round, pairs, points).

## 2. Tickets page (`/tickets`)

Can run alongside the study plan when it's blocked on the backend. Full detail: `plans/tickets-plan.md`; backend side: `plans/tickets-backend-plan.md` (backend clone: `C:/Users/lursm/Desktop/nneesstt`). `plans/` is gitignored. Order is easy → hard:

1. Page score bar + end-of-page summary ("try the wrong ones again", "next page"), jump-to-page input, copy/share link per ticket. Frontend only
2. Browse vs practice mode (browse sends no `POST /practice-answers`). "Remember my answers" toggle, **off by default**, `sessionStorage` only, with a reset button
3. Filters (unanswered / wrong before / has image) + ✓/✗ status chips. Share previews per ticket (needs a path route, because `opengraph-image` can't read `searchParams`). **Backend first**, don't fake params
4. One-question-at-a-time view: **research only** until the data says yes

Dropped: showing answer-save errors, and hiding the AI explanation until answered (tickets are the trainer, not the exam).

## 3. Later (only after the study plan)

- Dark mode: second set of values for the semantic tokens in `globals.css` + `tokens.ts`, antd `darkAlgorithm`, no-flash `data-theme` script in `<head>`, light tiles behind sign SVGs. System default + toggle. OG images and TikTok stay light
- Flag-for-review in exam, unfinished-attempt banner, 10-question quick test
- Tests for `useExamProgress` / finish rules
- Freemium / AI-tutor paywall (last)

## Always

- Keep `src/app/sitemap.ts` + `robots.ts` in sync when adding **public** routes; fill `buildMetadata` on public pages (share image in `src/lib/seo.ts`)

## Do not

- Invent new global state libraries
- Hardcode exam 30/3 — use `getExamRules`
- Index `/exam`, `/auth`, `/profile`, `/practice`, `/createblog` in the sitemap
- Rename `src/utills` unless the user asks
