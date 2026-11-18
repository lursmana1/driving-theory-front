import { getExamRules, licenseCategories } from "@/CONSTS/categories";
import { LANDING_RULES_ORDER } from "@/CONSTS/landing";
import LandingExamRules, { type LandingRuleRow } from "./LandingExamRules";

/** Builds the rules table from `categories.json` via `getExamRules` (never hardcoded). */
export default function LandingExamRulesSection() {
  const rows: LandingRuleRow[] = [...licenseCategories]
    .sort(
      (a, b) =>
        orderOf(a.id) - orderOf(b.id) || a.id - b.id,
    )
    .map((c) => {
      const r = getExamRules(c.id);
      return {
        id: c.id,
        name: c.name,
        total: r.totalQuestions,
        pass: r.passScore,
        mistakes: r.maxMistakes,
      };
    });

  return <LandingExamRules rows={rows} />;
}

function orderOf(id: number): number {
  const i = LANDING_RULES_ORDER.indexOf(id);
  return i === -1 ? LANDING_RULES_ORDER.length : i;
}
