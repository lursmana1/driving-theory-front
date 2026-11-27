import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";
import { LANDING } from "@/CONSTS/landing";
import { DEFAULT_CATEGORY_ID } from "@/CONSTS/categories";

const footerLink =
  "inline-flex min-h-10 items-center py-1.5 leading-snug text-fg-subtle transition-colors hover:text-accent sm:min-h-0 sm:py-0";

export default async function LandingFooter() {
  const t = await getTranslations("Home");
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-line py-14 text-fg">
      <div className="section">
        <div className="grid gap-12 md:grid-cols-3">
          <div>
            <div className="flex items-center gap-2.5">
              <span className={LANDING.footerLogoMark} aria-hidden>
                P
              </span>
              <span className="text-lg font-bold text-fg">prava.ge</span>
            </div>
            <p className={`mt-4 max-w-sm ${LANDING.body}`}>{t("footerBrand")}</p>
          </div>

          <div className="grid grid-cols-2 gap-8 md:contents">
            <nav aria-label={t("footerPlatform")}>
              <h3 className={LANDING.headingFooter}>{t("footerPlatform")}</h3>
              <ul className="mt-3 text-sm sm:mt-4 sm:space-y-2.5">
                <li>
                  <Link href="/plan" className={footerLink}>
                    {t("footerPlan")}
                  </Link>
                </li>
                <li>
                  <Link href="/subjectpicker" className={footerLink}>
                    {t("footerSimulation")}
                  </Link>
                </li>
                <li>
                  <Link
                    href={`/tickets/${DEFAULT_CATEGORY_ID}`}
                    className={footerLink}
                  >
                    {t("footerTopics")}
                  </Link>
                </li>
              </ul>
            </nav>

            <nav aria-label={t("footerResources")}>
              <h3 className={LANDING.headingFooter}>{t("footerResources")}</h3>
              <ul className="mt-3 text-sm sm:mt-4 sm:space-y-2.5">
                <li>
                  <Link href="/signs" className={footerLink}>
                    {t("footerSigns")}
                  </Link>
                </li>
                <li>
                  <Link href="/yard-exam" className={footerLink}>
                    {t("footerYardExam")}
                  </Link>
                </li>
                <li>
                  <Link href="/city-exam" className={footerLink}>
                    {t("footerCityExam")}
                  </Link>
                </li>
                <li>
                  <Link href="/city-exam#routes" className={footerLink}>
                    {t("footerCityRoutes")}
                  </Link>
                </li>
                <li>
                  <Link href="/blogs" className={footerLink}>
                    {t("footerBlogs")}
                  </Link>
                </li>
                <li>
                  <Link href="#faq" className={footerLink}>
                    {t("footerFaq")}
                  </Link>
                </li>
              </ul>
            </nav>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-2 border-t border-line pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-fg-subtle">
            <span>{t("footerCopyright", { year })}</span>
            <Link href="/about" className="underline-offset-2 hover:text-fg hover:underline">
              {t("footerAbout")}
            </Link>
            <Link href="/privacy" className="underline-offset-2 hover:text-fg hover:underline">
              {t("footerPrivacy")}
            </Link>
          </p>
          <p className="text-xs tracking-wide text-fg-subtle">
            {t("heroBrandMark")}
          </p>
        </div>
      </div>
    </footer>
  );
}
