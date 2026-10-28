"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { useAuth } from "@/contexts/UserContext";
import { getCategoryById } from "@/CONSTS/categories";
import { TRAINER_AUTO_NEXT_STORAGE_KEY } from "@/CONSTS/trainer";
import { AUTO_ADVANCE_DELAY_MS } from "@/CONSTS/QuizExamConstats";
import TicketQuiz from "@/components/TicketsQuiz/TicketsQuiz";
import type { PracticeAnswerResponse } from "@/api/practiceAnswers";
import type { TrainerSessionItem } from "@/lib/types/trainer";
import { useTrainerSession } from "@/utills/helpers/hooks/useTrainerSession";
import useArrowNavigation from "@/utills/helpers/hooks/useArrowNavigation";
import { useAutoAdvance } from "@/utills/helpers/hooks/exam";
import ExamAutoAdvanceCheckbox from "@/components/ExamQuiz/ExamAutoAdvanceCheckbox";
import {
  examCtaPillBase,
  outlinePillBase,
} from "@/layoutComponents/Header/headerStyles";
import { ProfileSectionSpinner } from "@/components/Profile/ProfileSectionSpinner";
import { TrainerFeedback } from "./TrainerFeedback";
import { TrainerSummaryBar } from "./TrainerSummaryBar";
import { TrainerProgress } from "./TrainerProgress";
import { TrainerEndState } from "./TrainerEndState";

type TrainerPageClientProps = {
  categoryId: number;
  subjects: number[];
};

const secondaryButton = `h-10 px-4 ${outlinePillBase}`;

/**
 * Mistake trainer: one batch of due mistakes as a small module — progress
 * strip, one question at a time, auto-next after every answer (same delay as
 * the exam; the checkbox turns it off), and an end screen once every answer
 * is saved (or the user ends early).
 */
export default function TrainerPageClient({
  categoryId,
  subjects,
}: TrainerPageClientProps) {
  const t = useTranslations("Trainer");
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const session = useTrainerSession(categoryId, subjects, !!user);
  const [confirmEnd, setConfirmEnd] = useState(false);
  const { autoAdvance, handleAutoAdvanceChange } = useAutoAdvance(
    TRAINER_AUTO_NEXT_STORAGE_KEY,
    true,
  );

  const current = session.current;
  const currentId = current ? String(current.question.id) : "";

  // Question whose saved answer moves the batch on. Leaving it (by hand or by
  // the timer) drops it, so coming back to an answered question never skips it.
  const [autoNextId, setAutoNextId] = useState<string | null>(null);
  if (autoNextId && autoNextId !== currentId) setAutoNextId(null);
  const autoNextPending = autoAdvance && !!autoNextId;
  const advance = session.advance;
  useEffect(() => {
    if (!autoNextPending) return;
    const timer = setTimeout(advance, AUTO_ADVANCE_DELAY_MS);
    return () => clearTimeout(timer);
  }, [autoNextPending, advance]);

  useEffect(() => {
    if (!authLoading && !user) router.replace("/auth");
  }, [authLoading, user, router]);

  // Arrows browse the batch; answering moves on by itself.
  useArrowNavigation(session.prev, session.next);

  if (!authLoading && !user) return null;

  const categoryName = getCategoryById(categoryId)?.name ?? "";
  const selected = current ? (session.answers[currentId] ?? null) : null;
  const { inProgress } = session;

  const handleRecorded = (
    item: TrainerSessionItem,
    response: PracticeAnswerResponse,
  ) => {
    session.record(item, response);
    if (response.correct != null) setAutoNextId(String(item.question.id));
  };

  const endSession = () => {
    if (session.unanswered > 0) setConfirmEnd(true);
    else session.finish();
  };

  let body: React.ReactNode;
  if (authLoading || session.status === "loading") {
    body = <ProfileSectionSpinner label={t("loading")} />;
  } else if (session.status === "error") {
    body = (
      <div className="space-y-4 py-10 text-center">
        <p className="text-sm text-danger">{t("error")}</p>
        <button
          type="button"
          onClick={session.reload}
          className={`h-11 px-5 text-sm ${examCtaPillBase}`}
        >
          {t("retry")}
        </button>
      </div>
    );
  } else if (session.items.length === 0) {
    body = (
      <TrainerEndState
        kind="empty"
        categoryId={categoryId}
        summary={session.summary}
      />
    );
  } else if (session.finished || !current) {
    body = (
      <TrainerEndState
        kind="done"
        categoryId={categoryId}
        totals={session.totals}
        onAgain={session.reload}
      />
    );
  } else {
    const lastOpen = session.unanswered === 0;
    body = (
      <div className="space-y-4">
        {/* Dark panel all the way down, so the answer keys and arrows stand out. */}
        <div
          className="overflow-hidden rounded-card bg-stage pb-2 shadow-card"
        >
          <TicketQuiz
            key={currentId}
            question={current.question}
            questionIndex={session.index + 1}
            selectedAnswer={selected}
            onSelect={(key) => session.select(currentId, key)}
            onRecorded={(response) => handleRecorded(current, response)}
            onRecordFailed={() => session.markFailed(current)}
            onPrevious={session.prev}
            onNext={session.next}
            keyboard
            priority
            belowQuestion={
              <ExamAutoAdvanceCheckbox
                checked={autoAdvance}
                onChange={handleAutoAdvanceChange}
                className="px-1"
              />
            }
          />
        </div>
        {selected && (
          <div className="flex flex-col gap-3 rounded-card border border-line bg-surface p-4 shadow-card sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <TrainerFeedback
                result={session.results[currentId]}
                failed={!!session.failed[currentId]}
                onRetry={() => session.retry(current)}
              />
              {autoNextPending && (
                <p className="text-xs text-fg-subtle">
                  {lastOpen ? t("autoFinish") : t("autoNext")}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={session.advance}
              className={`inline-flex h-12 shrink-0 items-center justify-center gap-2 px-7 text-base shadow-raised ${examCtaPillBase}`}
            >
              {lastOpen ? t("finish") : t("next")}
              <span aria-hidden>→</span>
            </button>
          </div>
        )}
        <p className="hidden text-center text-xs text-fg-subtle sm:block">
          {t("keyboardHint")}
        </p>
      </div>
    );
  }

  return (
    <main className="section space-y-4 py-6 font-georgian sm:space-y-5 sm:py-8">
      <header className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h1 className="text-xl font-bold text-fg sm:text-2xl">
            {t("title")}
            {categoryName && (
              <span className="ml-2 text-base font-medium text-fg-subtle">
                {categoryName}
              </span>
            )}
          </h1>
          {inProgress && (
            <button type="button" onClick={endSession} className={secondaryButton}>
              {t("endSession")}
            </button>
          )}
        </div>
        <p className="text-sm text-fg-muted">{t("subtitle")}</p>
      </header>

      {confirmEnd && inProgress && (
        <div
          role="alertdialog"
          aria-label={t("endSession")}
          className="flex flex-col gap-3 rounded-card border border-warning bg-warning-soft p-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <p className="text-sm font-medium text-fg">
            {t("endConfirm", { count: session.unanswered })}
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setConfirmEnd(false)}
              className={secondaryButton}
            >
              {t("keepGoing")}
            </button>
            <button
              type="button"
              onClick={() => {
                setConfirmEnd(false);
                session.finish();
              }}
              className={`h-10 px-4 text-sm ${examCtaPillBase}`}
            >
              {t("endNow")}
            </button>
          </div>
        </div>
      )}

      {inProgress && session.summary && (
        <section className="space-y-4 rounded-card border border-line bg-surface p-4 shadow-card sm:p-5">
          <TrainerSummaryBar
            stats={[
              { label: t("statDue"), value: session.summary.dueNow, tone: "danger" },
              { label: t("statCorrect"), value: session.totals.correct, tone: "neutral" },
              {
                label: t("statCleared"),
                value: session.summary.clearedRecently,
                tone: "success",
              },
            ]}
          />
          <TrainerProgress
            states={session.items.map((_, i) => session.answerState(i))}
            current={session.index}
            onSelect={session.goTo}
          />
        </section>
      )}

      {body}
    </main>
  );
}
