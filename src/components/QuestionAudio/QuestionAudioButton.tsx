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
  size?: "default" | "compact";
};

export function QuestionAudioButton({
  id,
  src,
  namespace = "Tickets",
  size = "default",
}: QuestionAudioButtonProps) {
  const t = useTranslations(namespace);
  const [playing, setPlaying] = useState(false);

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

  const compact = size === "compact";

  return (
    <button
      type="button"
      onClick={handleClick}
      title={playing ? t("questionStop") : t("questionListen")}
      aria-label={playing ? t("questionStop") : t("questionListen")}
      aria-pressed={playing}
      className={`inline-flex shrink-0 items-center justify-center rounded-full border border-white/40 bg-white/10 text-white backdrop-blur-sm transition hover:bg-white/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 ${
        compact ? "h-8 w-8" : "h-11 w-11"
      }`}
    >
      {playing ? (
        <Icon name="stop" className={compact ? "h-3.5 w-3.5" : "h-5 w-5"} />
      ) : (
        <Icon name="speaker" className={compact ? "h-3.5 w-3.5" : "h-5 w-5"} />
      )}
    </button>
  );
}
