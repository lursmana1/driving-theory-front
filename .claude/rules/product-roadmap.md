# Build next (in order)

Same rules as `.cursor/rules/product-roadmap.mdc`. Keep both in sync.

Do not skip ahead to monetization, PWA, or extra landing sections. Close the study loop first.

## 1. Mistake trainer (highest value)

Profile already loads `getWeakQuestions` / `getWeakSubjects`. Add a real practice session from those lists.

- CTA on `ProfileOverviewSection` charts: “Practice these”
- Reuse `getQuestionTicketPath` in `src/utills/helpers/questionLinks.ts` to open a ticket
- Prefer a dedicated drill (wrong-only queue) over only linking one question
- Wire to existing `user-stats` APIs; add a backend `ids=` fetch only if needed

## 2. Post-exam review

After pass/fail, walk **wrong answers only** with explanation + AI tutor + audio.

- Entry: `ExamSucessModal` / `ExamRetryModal`
- State already in `useExamQuiz` (selected answers, questions)
- Do not send the user home with no review

## 3. Auth polish

- Show login/register errors (`LoginForm` has a TODO)
- Forgot-password flow
- Guest exam → save progress after signup (if backend allows)

## 4. Honest marketing + SEO

- Landing stats (50k / 98%) must match reality or come down
- Keep `src/app/sitemap.ts` + `robots.ts` in sync when adding **public** routes
- Fill `generateMetadata` / `buildMetadata` on public pages; share image in `src/lib/seo.ts`
- Translate hardcoded blog copy (`"Blogs"`, `"No posts yet."`)

## 5. Leaderboard — ship or remove

`/leaderboard` and `/createleaderboard` redirect home, but the landing still advertises XP/board. Either implement with existing `src/lib/types/leaderboard.ts` + `CreateLeaderboardForm`, or remove from landing/`LandingLeaderboardPreview`.

## 6. Later (only after 1–5)

Flag-for-review in exam, unfinished-attempt banner, 10-question quick test, daily drill, freemium/AI-tutor paywall, PWA/offline, tests for `useExamProgress` / finish rules.

## Tickets page (`/tickets`) plan

Full detail, edge cases and sizes: `plans/tickets-plan.md`. Backend side (B1–B7, what exists, decisions): `plans/tickets-backend-plan.md` (backend local clone: `C:/Users/lursm/Desktop/nneesstt`). `plans/` is gitignored (local notes). Read it before working on tickets. Order is easy → hard:

1. Page score bar + end-of-page summary ("try the wrong ones again", "next page"), jump-to-page input, copy/share link per ticket. Frontend only
2. Browse vs practice mode (browse sends no `POST /practice-answers`). "Remember my answers" toggle, **off by default**, `sessionStorage` only, with a reset button
3. Filters (unanswered / wrong before / has image) + ✓/✗ status chips. Share previews per ticket (needs a path route, because `opengraph-image` can't read `searchParams`). **Backend first**, don't fake params
4. Mistake trainer (= item 1 above) → spaced repetition (needs backend fields)
5. One-question-at-a-time view: **research only** until the data says yes

Dropped: showing answer-save errors, and hiding the AI explanation until answered (tickets are the trainer, not the exam).

## Do not

- Invent new global state libraries
- Hardcode exam 30/3 — use `getExamRules`
- Index `/exam`, `/auth`, `/profile`, `/createblog` in the sitemap
- Rename `src/utills` unless the user asks
