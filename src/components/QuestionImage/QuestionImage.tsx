"use client";

import Image from "next/image";
import { useState } from "react";
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

  return (
    <Image
      src={src}
      alt={alt}
      width={QUESTION_IMAGE.width}
      height={QUESTION_IMAGE.height}
      sizes={QUESTION_IMAGE.sizes}
      priority={priority}
      onLoad={() => setLoaded(true)}
      className={`mx-auto w-full object-contain transition-opacity duration-300 ease-out ${
        loaded ? "opacity-100" : "opacity-0"
      } ${className}`}
      style={{ width: "100%", height: "auto" }}
    />
  );
}
