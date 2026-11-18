import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { LANDING } from "@/CONSTS/landing";
import {
  STUDY_PLAN_PRESET_DAYS,
  STUDY_PLAN_RECOMMENDED_DAYS,
} from "@/CONSTS/studyPlan";
import { LandingIcon } from "./LandingIcons";
import { LandingSectionHeader } from "./LandingSectionHeader";

type MockKey =
  | "mockDays"
  | "mockRecommended"
  | "mockRuleCard"
  | "mockTickets"
  | "mockDayTest"
  | "mockCoverage"
  | "mockMocks"
  | "mockReady";
type T = (key: MockKey) => string;

/** "How it works" = the study plan's three steps, each with a small UI sketch. */
export async function LandingHowSteps() {
  const t = await getTranslations("Home");
  const tm: T = (key) => t(key);

  const steps = [
    { n: 1, title: t("step1Title"), text: t("step1Text"), mock: <PickMock t={tm} /> },
    { n: 2, title: t("step2Title"), text: t("step2Text"), mock: <DayMock t={tm} /> },
    { n: 3, title: t("step3Title"), text: t("step3Text"), mock: <ReadyMock t={tm} /> },
  ];

  return (
    <section
      id="how"
      className="border-t border-line bg-surface-muted py-16 md:py-24"
      aria-labelledby="how-title"
    >
      <div className="section">
        <LandingSectionHeader
          id="how-title"
          eyebrow={t("howSectionLabel")}
          title={t("howTitle")}
          subtitle={t("howSubtitle")}
          action={
            <Link
              href="/plan"
              className={`h-12 shrink-0 self-start md:self-auto ${LANDING.ctaPrimary}`}
            >
              {t("howCta")}
              <LandingIcon name="arrow" className="h-5 w-5" />
            </Link>
          }
        />

        <ol className="mt-12 grid gap-5 lg:grid-cols-3">
          {steps.map((step) => (
            <li
              key={step.n}
              className="flex flex-col overflow-hidden rounded-panel border border-line bg-surface shadow-card md:flex-row lg:flex-col"
            >
              <div
                className="flex h-44 shrink-0 items-center justify-center border-b border-line-subtle bg-canvas px-6 md:h-auto md:w-80 md:border-b-0 md:border-r lg:h-44 lg:w-auto lg:border-b lg:border-r-0"
                aria-hidden
              >
                {step.mock}
              </div>
              <div className="p-6 md:self-center lg:self-auto">
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-accent text-xs font-bold tabular-nums text-on-accent">
                  {step.n}
                </span>
                <h3 className={`mt-4 ${LANDING.headingCard}`}>{step.title}</h3>
                <p className={`mt-2 ${LANDING.body}`}>{step.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function PickMock({ t }: { t: T }) {
  return (
    <div className="grid w-full max-w-xs grid-cols-3 gap-2">
      {STUDY_PLAN_PRESET_DAYS.map((d) => {
        const on = d === STUDY_PLAN_RECOMMENDED_DAYS;
        return (
          <div
            key={d}
            className={`relative flex flex-col items-center rounded-card border px-2 py-3 ${
              on
                ? "border-accent bg-accent-soft text-accent"
                : "border-line bg-surface text-fg-muted"
            }`}
          >
            {on ? (
              <span className="absolute -top-2.5 rounded-full bg-accent px-2 text-3xs font-semibold leading-5 text-on-accent">
                {t("mockRecommended")}
              </span>
            ) : null}
            <span className="text-2xl font-extrabold tabular-nums">{d}</span>
            <span className="text-xs">{t("mockDays")}</span>
          </div>
        );
      })}
    </div>
  );
}

function DayMock({ t }: { t: T }) {
  const rows = [
    { label: t("mockRuleCard"), done: true },
    { label: t("mockTickets"), done: true },
    { label: t("mockDayTest"), done: false },
  ];
  return (
    <ul className="w-full max-w-xs space-y-2">
      {rows.map((r) => (
        <li
          key={r.label}
          className="flex items-center gap-3 rounded-control border border-line bg-surface px-3 py-2 text-sm"
        >
          <span
            className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
              r.done
                ? "bg-success text-on-accent"
                : "border-2 border-accent bg-surface"
            }`}
          >
            {r.done ? <LandingIcon name="check" className="h-3 w-3" /> : null}
          </span>
          <span className={r.done ? "text-fg-subtle line-through" : "font-semibold text-fg"}>
            {r.label}
          </span>
        </li>
      ))}
    </ul>
  );
}

function ReadyMock({ t }: { t: T }) {
  return (
    <div className="flex w-full max-w-xs items-center gap-4">
      {/* traffic light: green is lit */}
      <div className="flex shrink-0 flex-col gap-1.5 rounded-card bg-inverse p-2">
        <span className="h-5 w-5 rounded-full bg-danger opacity-25" />
        <span className="h-5 w-5 rounded-full bg-warning opacity-25" />
        <span className="h-5 w-5 rounded-full bg-success" />
      </div>
      <ul className="min-w-0 flex-1 space-y-1.5 text-xs text-fg-muted">
        <li className="flex items-center gap-1.5">
          <LandingIcon name="check" className="h-3.5 w-3.5 shrink-0 text-success" />
          {t("mockCoverage")}
        </li>
        <li className="flex items-center gap-1.5">
          <LandingIcon name="check" className="h-3.5 w-3.5 shrink-0 text-success" />
          {t("mockMocks")}
        </li>
        <li className="mt-2 inline-flex rounded-full bg-success-soft px-2.5 py-1 font-semibold text-success-strong">
          {t("mockReady")}
        </li>
      </ul>
    </div>
  );
}
