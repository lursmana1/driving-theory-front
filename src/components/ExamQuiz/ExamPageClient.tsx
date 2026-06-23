"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Link } from "@/i18n/navigation";
import ExamQuiz from "./Quiz";
import type { ExamQuestion } from "@/lib/types/exam";
import type { CategoryExamRules } from "@/CONSTS/categories";

type ExamPageClientProps = {
  questions: ExamQuestion[];
  attemptId: number | null;
  endDate: string | null;
  examRules: CategoryExamRules;
};

export default function ExamPageClient({
  questions,
  attemptId,
  endDate,
  examRules,
}: ExamPageClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const onRestart = () => {
    startTransition(() => router.refresh());
  };
  if (!questions.length) {
    return (
      <div className="bg-[#193e4a] min-h-dvh flex items-center justify-center">
        <div className="text-white text-center">
          <p className="text-lg mb-4">კითხვები ვერ მოიძებნა</p>
          <Link href="/subjectpicker" className="text-rose-400 hover:underline">
            უკან დაბრუნება
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#193e4a] min-h-dvh flex flex-col relative">
      {isPending && (
        <div
          className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-[#193e4a]"
          aria-live="polite"
          aria-busy="true"
        >
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/30 border-t-white" />
          <p className="mt-4 font-georgian text-sm text-white/90">
            იტვირთება...
          </p>
        </div>
      )}
      <div className="section flex-1 min-h-0 flex flex-col">
        <ExamQuiz
          questions={questions}
          attemptId={attemptId}
          endDate={endDate}
          examRules={examRules}
          onRestart={onRestart}
        />
      </div>
    </div>
  );
}
