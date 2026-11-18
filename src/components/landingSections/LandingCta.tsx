import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";
import { LANDING } from "@/CONSTS/landing";
import { LandingIcon } from "./LandingIcons";

export default async function LandingCta() {
  const t = await getTranslations("Home");

  return (
    <section className="py-12 md:py-16" aria-labelledby="cta-title">
      <div className="section">
        <div className="relative isolate overflow-hidden rounded-panel bg-inverse px-6 py-12 sm:px-12 md:py-16">
          {/* soft brand glow */}
          <div
            aria-hidden
            className="absolute -right-24 -top-24 -z-10 h-72 w-72 rounded-full bg-accent opacity-40 blur-3xl"
          />
          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-xl">
              <h2
                id="cta-title"
                className="text-balance text-3xl font-bold tracking-tight text-fg-inverse md:text-4xl"
              >
                {t("ctaTitle")}
              </h2>
              <p className="mt-4 text-body leading-7 text-fg-inverse opacity-80">
                {t("ctaText")}
              </p>
            </div>
            <div className="flex shrink-0 flex-col gap-3 sm:flex-row sm:items-center">
              <Link href="/plan" className={`min-h-13 py-3 text-center ${LANDING.ctaPrimary}`}>
                {t("ctaBtn")}
                <LandingIcon name="arrow" className="h-5 w-5" />
              </Link>
              <Link
                href="/auth?mode=register"
                className="inline-flex min-h-13 items-center justify-center rounded-control border border-fg-inverse/30 px-7 py-3 text-center text-base font-semibold text-fg-inverse transition hover:bg-fg-inverse/10"
              >
                {t("ctaRegister")}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
