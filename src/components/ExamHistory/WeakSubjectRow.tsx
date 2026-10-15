"use client";

import { useState } from "react";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import type {
  OverviewWeakQuestion,
  OverviewWeakSubject,
} from "@/lib/types/userStats";
import {
  getQuestionPreview,
  getQuestionTicketPath,
} from "@/utills/helpers/questionLinks";
import { Icon } from "@/components/Icon/Icon";

type WeakSubjectRowProps = {
  item: OverviewWeakSubject;
  subjectName: string;
  questions: OverviewWeakQuestion[];
  categoryId?: number;
  questionLabel: string;
  wrongLabel: string;
  correctLabel: string;
  unansweredLabel?: string;
};

function StatBadges({
  wrong,
  correct,
  unanswered,
  wrongLabel,
  correctLabel,
  unansweredLabel,
}: {
  wrong: number;
  correct: number;
  unanswered: number;
  wrongLabel: string;
  correctLabel: string;
  unansweredLabel?: string;
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      <span className="rounded-xs bg-danger-muted px-2 py-1 text-xs font-medium text-danger-strong">
        {wrong} {wrongLabel}
      </span>
      <span className="rounded-xs bg-success-muted px-2 py-1 text-xs font-medium text-success-strong">
        {correct} {correctLabel}
      </span>
      {unansweredLabel != null && unanswered > 0 && (
        <span className="rounded-xs bg-surface-strong px-2 py-1 text-xs font-medium text-fg-muted">
          {unanswered} {unansweredLabel}
        </span>
      )}
    </div>
  );
}

function ProgressBar({
  wrongPct,
  correctPct,
  unansweredPct,
  wrongLabel,
  correctLabel,
  wrong,
  correct,
  unanswered,
  unansweredLabel,
}: {
  wrongPct: number;
  correctPct: number;
  unansweredPct: number;
  wrongLabel: string;
  correctLabel: string;
  wrong: number;
  correct: number;
  unanswered: number;
  unansweredLabel?: string;
}) {
  return (
    <div className="flex h-2.5 overflow-hidden rounded-full bg-surface-sunken sm:h-3">
      <div
        className="bg-linear-to-r from-danger to-danger transition-all duration-500"
        style={{ width: `${wrongPct}%` }}
        title={`${wrongLabel}: ${wrong}`}
      />
      <div
        className="bg-linear-to-r from-success to-success transition-all duration-500"
        style={{ width: `${correctPct}%` }}
        title={`${correctLabel}: ${correct}`}
      />
      <div
        className="bg-linear-to-r from-line-strong to-fg-faint transition-all duration-500"
        style={{ width: `${unansweredPct}%` }}
        title={
          unansweredLabel
            ? `${unansweredLabel}: ${unanswered}`
            : `${unanswered}`
        }
      />
    </div>
  );
}

export function WeakSubjectRow({
  item,
  subjectName,
  questions,
  categoryId,
  questionLabel,
  wrongLabel,
  correctLabel,
  unansweredLabel,
}: WeakSubjectRowProps) {
  const t = useTranslations("Exam");
  const [open, setOpen] = useState(false);

  const wrong = Math.max(0, Number(item.wrongCount) || 0);
  const correct = Math.max(0, Number(item.correctCount) || 0);
  const pool = Math.max(0, Number(item.totalQuestions) || 0);
  const unanswered = Math.max(0, pool - wrong - correct);
  const wrongPct = pool > 0 ? (wrong / pool) * 100 : 0;
  const correctPct = pool > 0 ? (correct / pool) * 100 : 0;
  const unansweredPct = pool > 0 ? (unanswered / pool) * 100 : 0;
  const hasQuestions = questions.length > 0;
  const panelId = `weak-subject-panel-${item.subjectId}`;

  const body = (
    <div className="space-y-2.5">
      <div className="flex items-start gap-2">
        {hasQuestions ? (
          <Icon
            name="chevronDown"
            className={`mt-0.5 h-4 w-4 shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          />
        ) : null}
        <p className="min-w-0 flex-1 text-sm font-medium leading-snug text-fg sm:text-base">
          {subjectName}
        </p>
      </div>

      <StatBadges
        wrong={wrong}
        correct={correct}
        unanswered={unanswered}
        wrongLabel={wrongLabel}
        correctLabel={correctLabel}
        unansweredLabel={unansweredLabel}
      />

      <ProgressBar
        wrongPct={wrongPct}
        correctPct={correctPct}
        unansweredPct={unansweredPct}
        wrongLabel={wrongLabel}
        correctLabel={correctLabel}
        wrong={wrong}
        correct={correct}
        unanswered={unanswered}
        unansweredLabel={unansweredLabel}
      />

      <p className="text-xs text-fg-subtle sm:text-sm">
        {t("totalQuestions", { count: pool })}
        {hasQuestions ? (
          <span className="text-fg-faint">
            {" "}
            · {questions.length} {questionLabel.toLowerCase()}
          </span>
        ) : null}
      </p>
    </div>
  );

  return (
    <div className="overflow-hidden rounded-control border border-line bg-surface-muted/50">
      {hasQuestions ? (
        <button
          type="button"
          id={`weak-subject-trigger-${item.subjectId}`}
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => setOpen((value) => !value)}
          className="w-full px-3 py-3.5 text-left transition hover:bg-surface-muted sm:px-4"
        >
          {body}
        </button>
      ) : (
        <div className="px-3 py-3.5 sm:px-4">{body}</div>
      )}

      {hasQuestions && open && (
        <ul
          id={panelId}
          role="region"
          aria-labelledby={`weak-subject-trigger-${item.subjectId}`}
          className="space-y-2 border-t border-line bg-surface px-3 py-3 sm:px-4"
        >
          {questions.map((wq) => {
            const preview = getQuestionPreview(wq.question, 500);
            const href = getQuestionTicketPath(
              wq.questionId,
              wq.question,
              categoryId,
            );

            return (
              <li key={wq.questionId}>
                <Link
                  href={href}
                  className="block rounded-control border border-line-subtle bg-surface-muted/80 p-3 transition hover:border-accent/30 hover:bg-accent/5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <span className="shrink-0 text-sm font-semibold text-fg">
                      #{wq.questionId}
                    </span>
                    <span className="shrink-0 rounded-xs bg-danger-muted px-2 py-0.5 text-xs font-medium text-danger-strong">
                      {wq.wrongCount} {wrongLabel}
                    </span>
                  </div>
                  {preview ? (
                    <p className="mt-2 text-sm leading-relaxed text-fg-muted">
                      {preview}
                    </p>
                  ) : null}
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
