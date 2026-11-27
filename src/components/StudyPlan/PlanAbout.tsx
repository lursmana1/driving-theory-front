import { getTranslations } from "next-intl/server";

const STEPS = [1, 2, 3] as const;

/**
 * "How the plan works", rendered on the server under the `/plan` client island, so the page
 * has real text in its HTML (the picker / plan home only render in the browser).
 * Reuses the landing page's plan copy (`Home` namespace, server-only).
 */
export async function PlanAbout() {
  const t = await getTranslations("Home");
  return (
    <section aria-labelledby="plan-about-title" className="rounded-card border border-line bg-surface p-5 sm:p-6">
      <h2 id="plan-about-title" className="text-lg font-bold text-fg sm:text-xl">
        {t("howTitle")}
      </h2>
      <p className="mt-2 max-w-3xl text-sm leading-6 text-fg-muted">{t("howSubtitle")}</p>
      <ol className="mt-4 grid gap-4 md:grid-cols-3">
        {STEPS.map((n) => (
          <li key={n} className="flex gap-3">
            <span
              aria-hidden
              className="flex size-8 shrink-0 items-center justify-center rounded-full bg-accent text-sm font-bold text-on-accent"
            >
              {n}
            </span>
            <div>
              <h3 className="font-semibold text-fg">{t(`step${n}Title`)}</h3>
              <p className="mt-1 text-sm leading-6 text-fg-muted">{t(`step${n}Text`)}</p>
            </div>
          </li>
        ))}
      </ol>
      <p className="mt-4 border-t border-line pt-4 text-sm leading-6 text-fg-muted">{t("faqPlanA")}</p>
    </section>
  );
}
