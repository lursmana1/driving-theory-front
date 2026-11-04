import { notFound } from "next/navigation";
import PlanDayClient from "@/components/StudyPlan/PlanDayClient";
import { STUDY_PLAN_MAX_DAYS } from "@/CONSTS/studyPlan";
import { pageMeta } from "@/lib/pageMeta";

type PlanDayPageProps = {
  params: Promise<{ locale: string; day: string }>;
};

export async function generateMetadata({ params }: PlanDayPageProps) {
  const { locale } = await params;
  return pageMeta("plan", { locale, index: false });
}

export default async function PlanDayPage({ params }: PlanDayPageProps) {
  const { day } = await params;
  const n = Number(day);
  if (!Number.isInteger(n) || n < 0 || n >= STUDY_PLAN_MAX_DAYS) notFound();
  return <PlanDayClient index={n} />;
}
