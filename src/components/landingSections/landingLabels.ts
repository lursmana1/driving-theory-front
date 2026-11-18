/** Raw `Home.*` strings handed from a server component to a landing client island,
 *  so the `Home` namespace does not have to be sent to every page's client. */
export type LandingLabels = Record<string, string>;

/** `t("key", { id: 13 })` over raw strings with simple `{name}` placeholders. */
export function labelFormatter(labels: LandingLabels) {
  return (key: string, values?: Record<string, string | number>) => {
    const raw = labels[key] ?? key;
    return values
      ? raw.replace(/\{(\w+)\}/g, (m, k: string) =>
          k in values ? String(values[k]) : m,
        )
      : raw;
  };
}

export const DEMO_LABEL_KEYS = [
  "demoLabel",
  "demoTicket",
  "demoPick",
  "demoCorrect",
  "demoWrong",
  "demoAiLabel",
  "demoRetry",
  "demoMore",
  "demoImageAlt",
] as const;

export const RULES_LABEL_KEYS = [
  "rulesQuestions",
  "rulesPass",
  "rulesMistakes",
  "rulesCategory",
  "rulesBNote",
  "rulesCta",
  "rulesTableCaption",
] as const;
