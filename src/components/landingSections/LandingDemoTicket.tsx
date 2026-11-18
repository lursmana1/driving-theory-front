"use client";

import Image from "next/image";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { LandingDemoQuestion } from "@/api/landingDemo";
import { QuestionAudioButton } from "@/components/QuestionAudio/QuestionAudioButton";
import { getQuestionTicketPath } from "@/utills/helpers/questionLinks";
import {
  getQuestionImageSrc,
  QUESTION_IMAGE,
} from "@/utills/helpers/getQuestionImageSrc";
import { LandingIcon } from "./LandingIcons";

type Props = { question: LandingDemoQuestion };

/** A real, playable ticket in the hero. SSR'd, so the question text is in the HTML. */
export default function LandingDemoTicket({ question }: Props) {
  const t = useTranslations("Home");
  const [picked, setPicked] = useState<number | null>(null);
  const correct = Number(question.correct_answer);
  const answered = picked != null;
  const isRight = picked === correct;

  return (
    <div className="relative w-full max-w-xl">
      {/* back plate for depth */}
      <div
        aria-hidden
        className="absolute inset-0 translate-x-3 translate-y-3 rounded-panel bg-accent-muted sm:translate-x-5 sm:translate-y-5"
      />
      <article
        className="relative overflow-hidden rounded-panel border border-line bg-surface shadow-raised"
        aria-labelledby="demo-question"
      >
        <header className="flex items-center justify-between gap-3 border-b border-line-subtle px-5 py-3">
          <span className="inline-flex items-center gap-2 text-xs font-semibold text-accent">
            <span className="relative flex h-2 w-2" aria-hidden>
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-60 motion-reduce:hidden" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
            </span>
            {t("demoLabel")}
          </span>
          <span className="text-xs font-medium tabular-nums text-fg-faint">
            {t("demoTicket", { id: question.id })}
          </span>
        </header>

        <div className="relative aspect-[1000/410] bg-surface-sunken">
          <Image
            src={getQuestionImageSrc(question.img)}
            alt={t("demoImageAlt", { id: question.id })}
            width={QUESTION_IMAGE.width}
            height={QUESTION_IMAGE.height}
            sizes="(max-width: 1024px) 100vw, 560px"
            className="h-full w-full object-cover"
            priority
          />
        </div>

        <div className="p-5 sm:p-6">
          <p
            id="demo-question"
            className="text-base font-semibold leading-snug text-fg sm:text-lg"
          >
            {question.question}
          </p>

          <ol className="mt-4 space-y-2">
            {question.answers.map((answer, i) => {
              const n = i + 1;
              const state = !answered
                ? "idle"
                : n === correct
                  ? "right"
                  : n === picked
                    ? "wrong"
                    : "muted";
              return (
                <li key={n}>
                  <button
                    type="button"
                    disabled={answered}
                    onClick={() => setPicked(n)}
                    className={`flex w-full items-center gap-3 rounded-control border px-3.5 py-3 text-left text-sm font-medium transition sm:text-base ${ANSWER_CLASS[state]}`}
                  >
                    <span
                      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold tabular-nums ${BADGE_CLASS[state]}`}
                    >
                      {state === "right" ? (
                        <LandingIcon name="check" className="h-4 w-4" />
                      ) : (
                        n
                      )}
                    </span>
                    <span>{answer}</span>
                  </button>
                </li>
              );
            })}
          </ol>

          <div aria-live="polite">
            {!answered ? (
              <p className="mt-4 text-sm text-fg-faint">{t("demoPick")}</p>
            ) : (
              <div className="mt-4 space-y-3">
                <p
                  className={`text-sm font-semibold ${isRight ? "text-success-strong" : "text-danger-strong"}`}
                >
                  {isRight ? t("demoCorrect") : t("demoWrong")}
                </p>

                {question.aiText ? (
                  <div className="rounded-card border border-accent-muted bg-accent-soft p-4">
                    <div className="flex items-center justify-between gap-3">
                      <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-accent">
                        <LandingIcon name="sparkle" className="h-4 w-4" />
                        {t("demoAiLabel")}
                      </span>
                      {question.audio ? (
                        <QuestionAudioButton
                          id={`landing-demo-${question.id}`}
                          src={question.audio}
                          size="labeled"
                          tone="surface"
                        />
                      ) : null}
                    </div>
                    <p className="mt-2 text-sm leading-6 text-fg-muted">
                      {question.aiText}
                    </p>
                  </div>
                ) : null}

                <div className="flex flex-wrap items-center gap-x-5 gap-y-2 pt-1">
                  <Link
                    href={getQuestionTicketPath(question.id, question)}
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-accent transition hover:text-accent-strong"
                  >
                    {t("demoMore")}
                    <LandingIcon name="arrow" className="h-4 w-4" />
                  </Link>
                  <button
                    type="button"
                    onClick={() => setPicked(null)}
                    className="text-sm font-medium text-fg-subtle transition hover:text-fg"
                  >
                    {t("demoRetry")}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </article>
    </div>
  );
}

const ANSWER_CLASS = {
  idle: "cursor-pointer border-line bg-surface text-fg hover:border-accent hover:bg-accent-soft",
  right: "border-success bg-success-soft text-success-strong",
  wrong: "border-danger bg-danger-soft text-danger-strong",
  muted: "border-line-subtle bg-surface text-fg-faint",
} as const;

const BADGE_CLASS = {
  idle: "bg-surface-sunken text-fg-muted",
  right: "bg-success text-on-accent",
  wrong: "bg-danger text-on-accent",
  muted: "bg-surface-sunken text-fg-faint",
} as const;
