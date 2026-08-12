"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import {
  isGlobalAudioPlaying,
  playGlobalAudio,
  stopGlobalAudio,
  subscribeGlobalAudio,
} from "@/lib/globalAudio";

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
        <StopIcon className={compact ? "h-3.5 w-3.5" : "h-5 w-5"} />
      ) : (
        <SpeakerIcon className={compact ? "h-3.5 w-3.5" : "h-5 w-5"} />
      )}
    </button>
  );
}

function SpeakerIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M11 5 6 9H3v6h3l5 4V5Z" />
      <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
      <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
    </svg>
  );
}

function StopIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <rect x="6" y="6" width="12" height="12" rx="1" />
    </svg>
  );
}
