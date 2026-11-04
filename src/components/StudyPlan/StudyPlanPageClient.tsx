"use client";

import { useTranslations } from "next-intl";
import { useStudyPlan } from "@/utills/helpers/hooks/useStudyPlan";
import { ProfileSectionSpinner } from "@/components/Profile/ProfileSectionSpinner";
import { PlanPicker } from "./PlanPicker";
import { PlanHome } from "./PlanHome";

type StudyPlanPageClientProps = {
  initialCategoryId: number;
};

/** `/plan`: the picker until a plan is started, then the plan home. */
export default function StudyPlanPageClient({
  initialCategoryId,
}: StudyPlanPageClientProps) {
  const t = useTranslations("StudyPlan");
  const { plan, ready, mode, offline, saveFailed, start, reset } =
    useStudyPlan();
  const save = { mode, offline, saveFailed };

  return (
    <main className="section space-y-5 py-6 font-georgian sm:py-8">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold text-fg sm:text-3xl">{t("title")}</h1>
        <p className="text-sm text-fg-muted">{t("subtitle")}</p>
      </header>
      {!ready ? (
        <ProfileSectionSpinner label={t("loading")} />
      ) : plan ? (
        <PlanHome plan={plan} onReset={reset} save={save} />
      ) : (
        <PlanPicker
          initialCategoryId={initialCategoryId}
          save={save}
          onStart={(preview) =>
            start({
              categoryId: preview.categoryId,
              dayCount: preview.dayCount,
              startDay: preview.startDay,
              examDay: preview.examDay,
            })
          }
        />
      )}
    </main>
  );
}
