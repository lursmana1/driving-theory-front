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
};

export function QuestionAudioButton({
  id,
  src,
  namespace = "Tickets",
  size = "default",
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

  const listenLabel = t("questionListen");
  const stopLabel = t("questionStop");
  const iconClass = compact ? "h-3.5 w-3.5" : "h-5 w-5";

  return (
    <button
      type="button"
      onClick={handleClick}
      title={playing ? stopLabel : listenLabel}
      aria-label={playing ? stopLabel : listenLabel}
      aria-pressed={playing}
      className={`inline-flex shrink-0 items-center justify-center rounded-full border border-white/40 bg-white/10 text-white backdrop-blur-sm transition hover:bg-white/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 ${
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
        <span>{playing ? stopLabel : t("questionListenShort")}</span>
      ) : null}
    </button>
  );
}
