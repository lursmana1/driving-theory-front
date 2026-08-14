"use client";

import Image from "next/image";
import type { ExamQuestion } from "@/lib/types/exam";
import {
  nearbyQuestionImageSrcs,
  QUESTION_IMAGE,
} from "@/utills/helpers/getQuestionImageSrc";

type ExamImagePreloaderProps = {
  questions: ExamQuestion[];
  currentIndex: number;
};

export default function ExamImagePreloader({
  questions,
  currentIndex,
}: ExamImagePreloaderProps) {
  const nearby = nearbyQuestionImageSrcs(questions, currentIndex);
  if (nearby.length === 0) return null;

  return (
    <div className="pointer-events-none absolute h-0 w-0 overflow-hidden" aria-hidden>
      {nearby.map((item) => (
        <Image
          key={item.src}
          src={item.src}
          alt=""
          width={QUESTION_IMAGE.width}
          height={QUESTION_IMAGE.height}
          sizes={QUESTION_IMAGE.sizes}
          fetchPriority="low"
        />
      ))}
    </div>
  );
}
