import { getTranslations } from "next-intl/server";
import landingSteps from "@/data/landingSteps.json";
import { LANDING } from "@/CONSTS/landing";

export async function LandingHowSteps() {
  const t = await getTranslations("Home");

  const steps = landingSteps.map((step) => ({
    n: step.n,
    title: t(step.titleKey),
    text: t(step.textKey),
  }));

  return (
    <section
      className="border-t border-hairline py-16 md:py-24"
      aria-labelledby="how-title"
    >
      <div className="section">
        <p className={LANDING.eyebrow}>{t("howSectionLabel")}</p>
        <h2 id="how-title" className={`mt-4 max-w-2xl ${LANDING.headingSection}`}>
          {t("howTitle")}
        </h2>
        <p className={`mt-4 max-w-xl ${LANDING.body}`}>{t("howSubtitle")}</p>

        <ol className="mt-12 grid border-t border-hairline md:grid-cols-3">
          {steps.map((step, i) => (
            <li
              key={step.n}
              className={`py-8 md:px-8 md:py-10 ${
                i < steps.length - 1
                  ? "border-b border-hairline md:border-b-0 md:border-r"
                  : ""
              } ${i === 0 ? "md:pl-0" : ""}`}
            >
              <span
                className="text-xs font-semibold tabular-nums text-accent/70"
                aria-hidden
              >
                {String(step.n).padStart(2, "0")}
              </span>
              <h3 className={`mt-4 ${LANDING.headingCard}`}>{step.title}</h3>
              <p className={`mt-3 ${LANDING.body}`}>{step.text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
