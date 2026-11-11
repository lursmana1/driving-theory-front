"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import SignLinkedText from "@/components/Signs/SignLinkedText";
import { LineIcon } from "@/components/Icon/LineIcon";
import { QuestionAudioButton } from "@/components/QuestionAudio/QuestionAudioButton";
import { examCtaPillBase } from "@/layoutComponents/Header/headerStyles";
import type { LessonCard as LessonCardData } from "@/lib/types/studyPlan";

type LessonCardProps = {
  card: LessonCardData;
  /** The card's sign group page; omitted for rule cards. */
  signsHref?: string;
  onContinue: () => void;
  /** Button label instead of "to the tickets" / "next card" (last card). */
  continueLabel?: string;
};

/**
 * The "teach" half of a lesson: one sign / marking / rule with its picture
 * and explanation, then a button to its tickets. The same view serves every
 * card kind; signs also link to their group page on /signs.
 */
export function LessonCard({
  card,
  signsHref,
  onContinue,
  continueLabel,
}: LessonCardProps) {
  const t = useTranslations("StudyPlan");
  const count = card.questionIds.length;
  const text = card.tutor ?? card.body;

  return (
    <article className="overflow-hidden rounded-card border border-line bg-surface shadow-raised">
      {card.image && (
        <div className="flex justify-center bg-surface-muted px-6 py-6">
          <div className="aspect-square h-36 sm:h-44">
            {/* eslint-disable-next-line @next/next/no-img-element -- static sign SVG */}
            <img
              src={card.image}
              alt={card.title}
              width={176}
              height={176}
              className="h-full w-full object-contain"
            />
          </div>
        </div>
      )}
      <div className="space-y-3 p-5 sm:p-6">
        <div>
          {card.signNumber && (
            <p className="text-sm font-semibold tabular-nums text-accent">
              {card.signNumber}
            </p>
          )}
          <h2 className="text-xl font-bold text-fg">{card.title}</h2>
        </div>
        {card.audio && (
          <QuestionAudioButton
            id={`card-audio-${card.id}`}
            src={card.audio}
            size="labeled"
            tone="surface"
            label={t("cardListen")}
          />
        )}
        {text && (
          <p className="font-georgian text-base leading-relaxed text-fg-muted">
            <SignLinkedText text={text} />
          </p>
        )}
        <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-fg-subtle">
            {t("cardTickets", { count })}
          </p>
          <button
            type="button"
            onClick={onContinue}
            className={`inline-flex h-12 items-center justify-center gap-2 px-6 text-base ${examCtaPillBase}`}
          >
            {count > 0
              ? t("cardToTickets")
              : (continueLabel ?? t("cardNext"))}
            <LineIcon name="arrowRight" className="h-5 w-5" />
          </button>
        </div>
        {signsHref && (
          <Link
            href={signsHref}
            className="inline-block text-sm font-medium text-accent hover:underline"
          >
            {t("signsLink")}
          </Link>
        )}
      </div>
    </article>
  );
}
