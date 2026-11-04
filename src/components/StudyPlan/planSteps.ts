import type { PlanStepKind } from "@/lib/types/studyPlan";
import type { LineIconName } from "@/components/Icon/LineIcon";

/** `StudyPlan.*` message key of each step kind. */
export const STEP_LABEL = {
  learn: "stepLearn",
  review: "stepReview",
  mix: "stepMix",
  test: "stepTest",
  exam: "stepExam",
} as const satisfies Record<PlanStepKind, string>;

export const STEP_ICON: Record<PlanStepKind, LineIconName> = {
  learn: "book",
  review: "repeat",
  mix: "shuffle",
  test: "clipboardCheck",
  exam: "timer",
};
