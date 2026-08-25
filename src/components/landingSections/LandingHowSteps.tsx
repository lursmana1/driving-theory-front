import { getTranslations } from "next-intl/server";
import landingSteps from "@/data/landingSteps.json";
import { LANDING } from "@/CONSTS/landing";

function stepBadgeClass(successStep: boolean) {
  if (successStep) {
    return "border border-emerald-400/45 bg-white/[0.06] text-emerald-100 shadow-[0_0_0_1px_rgba(52,211,153,0.25),0_8px_28px_-6px_rgba(16,185,129,0.2)]";
  }
  return "border border-white/20 bg-white/5 text-white shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]";
}

const connectorClass =
  "hidden h-[2px] min-w-5 flex-1 rounded-full bg-white/15 md:block";

function stepArticleClass(index: number, lastIndex: number) {
  const border =
    index < lastIndex ? "border-b border-white/10 md:border-b-0" : "";
  const base = `flex min-w-0 flex-col items-center px-2 py-10 text-center md:px-0 md:py-0 ${border}`;

  if (index === 0) {
    return `${base} md:items-start md:text-left`;
  }
  if (index === 1) {
    return `${base} md:items-center md:text-center`;
  }
  return `${base} md:items-end md:text-right`;
}

function stepBadgeRowClass(index: number) {
  const base = "mb-6 flex w-full min-h-16 items-center justify-center md:mb-8";

  if (index === 0) {
    return `${base} md:justify-start`;
  }
  if (index === 1) {
    return base;
  }
  return `${base} md:justify-end`;
}

export async function LandingHowSteps() {
  const t = await getTranslations("Home");

  const steps = landingSteps.map((step) => ({
    n: step.n,
    title: t(step.titleKey),
    text: t(step.textKey),
    successStep: "successStep" in step && step.successStep,
  }));

  const lastIndex = steps.length - 1;

  return (
    <section className={LANDING.howSection} aria-labelledby="how-title">
      <div className="section relative">
        <h2
          id="how-title"
          className={`text-center ${LANDING.headingSectionDark}`}
        >
          {t("howTitle")}
        </h2>
        <p className="mt-4 text-center text-base text-slate-400">{t("howSubtitle")}</p>

        <div className="mx-auto mt-14 grid max-w-md grid-cols-1 gap-0 md:mt-16 md:max-w-5xl md:grid-cols-3 md:gap-8 lg:gap-10">
          {steps.map((step, i) => (
            <article key={step.n} className={stepArticleClass(i, lastIndex)}>
              <div className={stepBadgeRowClass(i)}>
                {i > 0 && <div className={`mr-4 ${connectorClass}`} aria-hidden />}
                <div
                  className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl text-2xl font-bold ${stepBadgeClass(!!step.successStep)}`}
                  aria-hidden
                >
                  {String(step.n).padStart(2, "0")}
                </div>
                {i < lastIndex && (
                  <div className={`ml-4 ${connectorClass}`} aria-hidden />
                )}
              </div>
              <h3 className={`text-balance ${LANDING.headingCardDark}`}>
                {step.title}
              </h3>
              <p className="mt-4 text-pretty text-sm leading-relaxed text-slate-400">
                {step.text}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
