"use client";

import { useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { PLAN_STEP_PARAM } from "@/CONSTS/studyPlan";
import { useStudyPlan } from "@/utills/helpers/hooks/useStudyPlan";

const STEP_PATTERN = /^(\d{1,2})\.(\d{1,2})$/;

/**
 * On /exam and /practice opened from a plan step (`?planStep=<day>.<step>`):
 * marks that step done once `finished` turns true, so opening the page alone
 * never counts. Without the param it renders nothing and loads no plan.
 */
export function PlanStepFinished({ finished }: { finished: boolean }) {
  const match = STEP_PATTERN.exec(useSearchParams().get(PLAN_STEP_PARAM) ?? "");
  if (!match) return null;
  return (
    <MarkStepDone
      day={Number(match[1])}
      step={Number(match[2])}
      finished={finished}
    />
  );
}

function MarkStepDone({
  day,
  step,
  finished,
}: {
  day: number;
  step: number;
  finished: boolean;
}) {
  const { ready, plan, markStepDone } = useStudyPlan();
  const marked = useRef(false);

  useEffect(() => {
    if (!finished || marked.current || !ready || !plan) return;
    if (day >= plan.dayCount) return;
    marked.current = true;
    markStepDone(day, step);
  }, [finished, ready, plan, day, step, markStepDone]);

  return null;
}
