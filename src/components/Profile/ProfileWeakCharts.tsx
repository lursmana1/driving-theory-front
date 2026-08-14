"use client";

import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import type {
  OverviewWeakQuestion,
  OverviewWeakSubject,
} from "@/api/userStats";
import { ProfileSectionSpinner } from "@/components/Profile/ProfileSectionSpinner";

const WeakQuestionsChart = dynamic(
  () =>
    import("@/components/ExamHistory/WeakQuestionsChart").then(
      (m) => m.WeakQuestionsChart,
    ),
  { loading: () => null },
);

const WeakSubjectsChart = dynamic(
  () =>
    import("@/components/ExamHistory/WeakSubjectsChart").then(
      (m) => m.WeakSubjectsChart,
    ),
  { loading: () => null },
);

type ProfileWeakChartsProps = {
  categoryId: number;
  weakQuestions: OverviewWeakQuestion[];
  weakQuestionsLoading: boolean;
  weakSubjectsLoading: boolean;
  topWeakQuestions: OverviewWeakQuestion[];
  topWeakSubjects: OverviewWeakSubject[];
  subjectNames: { id: number; name: string }[];
  showChartsSection: boolean;
};

export function ProfileWeakCharts({
  categoryId,
  weakQuestions,
  weakQuestionsLoading,
  weakSubjectsLoading,
  topWeakQuestions,
  topWeakSubjects,
  subjectNames,
  showChartsSection,
}: ProfileWeakChartsProps) {
  const t = useTranslations("Profile");
  const tExam = useTranslations("Exam");

  if (!showChartsSection) return null;

  return (
    <section className="grid grid-cols-1 gap-4 sm:gap-6 xl:grid-cols-2">
      {weakQuestionsLoading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <ProfileSectionSpinner label={t("loading")} />
        </div>
      ) : (
        topWeakQuestions.length > 0 && (
          <WeakQuestionsChart
            data={topWeakQuestions}
            categoryId={categoryId}
            title={tExam("weakQuestionsTitle")}
            questionLabel={tExam("question")}
            wrongLabel={tExam("wrongCount")}
          />
        )
      )}
      {weakSubjectsLoading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <ProfileSectionSpinner label={t("loading")} />
        </div>
      ) : (
        topWeakSubjects.length > 0 && (
          <WeakSubjectsChart
            data={topWeakSubjects}
            subjects={subjectNames}
            weakQuestions={weakQuestions}
            categoryId={categoryId}
            title={tExam("weakSubjectsTitle")}
            questionLabel={tExam("question")}
            wrongLabel={tExam("wrongCount")}
            correctLabel={tExam("correctCount")}
            unansweredLabel={tExam("unanswered")}
          />
        )
      )}
    </section>
  );
}
