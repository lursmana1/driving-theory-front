"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type RefObject } from "react";
import {
  getQuestionImageSrc,
  QUESTION_IMAGE,
} from "@/utills/helpers/getQuestionImageSrc";

type QuestionImageProps = {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
};

export default function QuestionImage({
  src,
  alt,
  className = "",
  priority,
}: QuestionImageProps) {
  const resolved = getQuestionImageSrc(src);
  return (
    <QuestionImageView
      key={resolved}
      src={resolved}
      alt={alt}
      className={className}
      priority={priority}
    />
  );
}

function QuestionImageView({
  src,
  alt,
  className,
  priority,
}: {
  src: string;
  alt: string;
  className: string;
  priority?: boolean;
}) {
  const [loaded, setLoaded] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  useFitToMaxHeight(imgRef);
  // The priority image is the page's LCP: no fade-in, or it stays invisible
  // (opacity 0) until hydration + onLoad, which delays LCP by seconds.
  const fade = !priority;

  return (
    <Image
      src={src}
      alt={alt}
      width={QUESTION_IMAGE.width}
      height={QUESTION_IMAGE.height}
      sizes={QUESTION_IMAGE.sizes}
      priority={priority}
      fetchPriority={priority ? "high" : undefined}
      onLoad={fade ? () => setLoaded(true) : undefined}
      ref={imgRef}
      className={`ticket-photo mx-auto w-full object-contain ${
        fade
          ? `transition-opacity duration-300 ease-out ${loaded ? "opacity-100" : "opacity-0"}`
          : ""
      } ${className}`}
      style={{ width: "100%", height: "auto" }}
    />
  );
}

/**
 * The photo is `w-full` with the caller's `max-h-*`. When max-h wins, object-contain
 * letterboxes it inside a wider box, and `ticket-photo` would clip the box, not the
 * photo's baked-in white frame. Cap the width at max-h × ratio so the box equals
 * the photo. Height never changes, so no layout shift. The ratio comes from the
 * loaded file: most photos are 1006×542, but sign-strip tickets are much wider.
 */
function useFitToMaxHeight(ref: RefObject<HTMLImageElement | null>) {
  useEffect(() => {
    const img = ref.current;
    const parent = img?.parentElement;
    if (!img || !parent) return;
    const fit = () => {
      if (!img.naturalWidth || !img.naturalHeight) return; // not loaded yet
      const ratio = img.naturalWidth / img.naturalHeight;
      const raw = getComputedStyle(img).maxHeight;
      const maxH = raw.endsWith("%")
        ? (parent.clientHeight * parseFloat(raw)) / 100
        : parseFloat(raw);
      img.style.maxWidth =
        Number.isFinite(maxH) && maxH > 0 ? `${maxH * ratio}px` : "";
    };
    fit();
    img.addEventListener("load", fit);
    const observer = new ResizeObserver(fit);
    observer.observe(parent);
    return () => {
      img.removeEventListener("load", fit);
      observer.disconnect();
    };
  }, [ref]);
}
