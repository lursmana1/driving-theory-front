"use client";

import { useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { recordBlogView } from "@/api/blogViews";
import { viewsMessageValues } from "@/utills/helpers/formatViews";
import { Icon } from "@/components/Icon/Icon";

type Props = {
  blogId: number;
  initialCount: number;
};

/**
 * Counts one view per post per browser session and shows the live count.
 * Render it only when the API sends `viewsCount`, so an older backend never gets the POST.
 */
export default function BlogViewTracker({ blogId, initialCount }: Props) {
  const t = useTranslations("Blogs");
  const locale = useLocale();
  const [count, setCount] = useState(initialCount);
  // StrictMode runs effects twice in dev; storage may also be unavailable.
  const sent = useRef(false);

  useEffect(() => {
    if (sent.current) return;
    sent.current = true;

    const key = `blog-viewed:${blogId}`;
    try {
      if (sessionStorage.getItem(key)) return;
      sessionStorage.setItem(key, "1");
    } catch {
      // Private mode: fall back to the ref guard only.
    }

    recordBlogView(blogId)
      .then((viewsCount) => {
        if (typeof viewsCount === "number") setCount(viewsCount);
      })
      .catch(() => {
        // Fire-and-forget: 404/429/network errors are ignored, never retried.
      });
  }, [blogId]);

  return (
    <span className="flex items-center gap-2">
      <Icon name="eye" className="h-4 w-4 shrink-0 opacity-80" />
      {t("views", viewsMessageValues(count, locale))}
    </span>
  );
}
