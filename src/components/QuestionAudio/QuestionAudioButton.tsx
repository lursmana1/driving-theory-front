"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import {
  isGlobalAudioPlaying,
  playGlobalAudio,
  stopGlobalAudio,
  subscribeGlobalAudio,
} from "@/lib/globalAudio";
import { Icon } from "@/components/Icon/Icon";

type QuestionAudioButtonProps = {
  id: string;
  src: string;
  namespace?: "Tickets" | "Exam";
  size?: "default" | "compact" | "labeled";
  /** Overrides the listen label (e.g. a lesson card, which is not a question) */
  label?: string;
  /** `stage` = on the dark exam / photo stage, `surface` = on a light card */
  tone?: "stage" | "surface";
};

const TONE_CLASS = {
  stage:
    "border-stage-fg/40 bg-stage-fg/10 text-stage-fg backdrop-blur-sm hover:bg-stage-fg/20 focus-visible:ring-stage-fg/60",
  surface:
    "border-line bg-surface-muted text-fg hover:bg-surface-sunken focus-visible:ring-accent",
} as const;

export function QuestionAudioButton({
  id,
  src,
  namespace = "Tickets",
  size = "default",
  label,
  tone = "stage",
}: QuestionAudioButtonProps) {
  const t = useTranslations(namespace);
  const [playing, setPlaying] = useState(false);
  const labeled = size === "labeled";
  const compact = size === "compact" || labeled;

  useEffect(() => {
    const sync = () => setPlaying(isGlobalAudioPlaying(id));
    return subscribeGlobalAudio(sync);
  }, [id]);

  useEffect(() => {
    return () => {
      if (isGlobalAudioPlaying(id)) stopGlobalAudio();
    };
  }, [id]);

  const handleClick = useCallback(() => {
    if (playing) {
      stopGlobalAudio();
      return;
    }

    const audio = new Audio(src);
    audio.onended = () => stopGlobalAudio();
    audio.onerror = () => stopGlobalAudio();
    playGlobalAudio(id, audio);
    audio.play().catch(() => stopGlobalAudio());
  }, [id, playing, src]);

  const listenLabel = label ?? t("questionListen");
  const stopLabel = t("questionStop");
  const iconClass = compact ? "h-3.5 w-3.5" : "h-5 w-5";

  return (
    <button
      type="button"
      onClick={handleClick}
      title={playing ? stopLabel : listenLabel}
      aria-label={playing ? stopLabel : listenLabel}
      aria-pressed={playing}
      className={`inline-flex shrink-0 items-center justify-center rounded-full border transition focus:outline-none focus-visible:ring-2 ${TONE_CLASS[tone]} ${
        labeled
          ? "h-8 gap-1.5 px-2.5 text-xs font-semibold sm:px-3"
          : compact
            ? "h-8 w-8"
            : "h-11 w-11"
      }`}
    >
      {playing ? (
        <Icon name="stop" className={iconClass} />
      ) : (
        <Icon name="speaker" className={iconClass} />
      )}
      {labeled ? (
        <span>{playing ? stopLabel : (label ?? t("questionListenShort"))}</span>
      ) : null}
    </button>
  );
}
