import { getTranslations } from "next-intl/server";
import { getExamRules, licenseCategories } from "@/CONSTS/categories";
import { LANDING, LANDING_RULES_ORDER } from "@/CONSTS/landing";
import LandingExamRules, { type LandingRuleRow } from "./LandingExamRules";
import { LandingSectionHeader } from "./LandingSectionHeader";
import { RULES_LABEL_KEYS } from "./landingLabels";

/**
 * Exam rules for every category, built from `categories.json` via `getExamRules`
 * (never hardcoded). Header is server-rendered; only the picker/table is a client island.
 */
export default async function LandingExamRulesSection() {
  const t = await getTranslations("Home");

  const rows: LandingRuleRow[] = [...licenseCategories]
    .sort((a, b) => orderOf(a.id) - orderOf(b.id) || a.id - b.id)
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

  const labels = Object.fromEntries(
    RULES_LABEL_KEYS.map((k) => [k, t.raw(k) as string]),
  );

  return (
    <section id="exam-rules" className={LANDING.section} aria-labelledby="rules-title">
      <div className="section">
        <LandingSectionHeader
          id="rules-title"
          eyebrow={t("rulesEyebrow")}
          title={t("rulesTitle")}
          subtitle={t("rulesSubtitle")}
        />
        <LandingExamRules rows={rows} labels={labels} />
      </div>
    </section>
  );
}

function orderOf(id: number): number {
  const i = LANDING_RULES_ORDER.indexOf(id);
  return i === -1 ? LANDING_RULES_ORDER.length : i;
}
