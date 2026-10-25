"use client";

import { useEffect, useRef } from "react";
import { recordBlogView } from "@/api/blogViews";

type Props = {
  blogId: number;
};

/**
 * Counts one view per post per browser session. Renders nothing; the count is not shown to readers.
 * Render it only when the API sends `viewsCount`, so an older backend never gets the POST.
 */
export default function BlogViewTracker({ blogId }: Props) {
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

    recordBlogView(blogId).catch(() => {
      // Fire-and-forget: 404/429/network errors are ignored, never retried.
    });
  }, [blogId]);

  return null;
}
