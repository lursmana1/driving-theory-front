"use client";

import { useEffect } from "react";

/** Drop in your image or GIF path or URL. */
export const NOT_FOUND_IMAGE_SRC = "/gif/wrongturngif.gif";

type NotFoundViewProps = {
  title: string;
  backLabel: string;
};

export default function NotFoundView({ title, backLabel }: NotFoundViewProps) {
  useEffect(() => {
    document.title = title;
  }, [title]);

  const goBack = () => {
    if (window.history.length > 1) {
      window.history.back();
      return;
    }
    window.location.assign("/");
  };

  return (
    <main className="section flex min-h-[70vh] flex-col items-center justify-center py-16 text-center">
      <img
        src={NOT_FOUND_IMAGE_SRC}
        alt={title}
        className="mb-8 h-72 w-full max-w-2xl object-fill sm:h-80"
      />
      <h1 className="font-georgian text-2xl font-semibold text-ink sm:text-3xl">
        {title}
      </h1>
      <button
        type="button"
        onClick={goBack}
        className="mt-8 inline-flex h-12 items-center justify-center rounded-xl bg-accent px-6 text-sm font-semibold text-white transition hover:bg-accent-strong"
      >
        {backLabel}
      </button>
    </main>
  );
}
