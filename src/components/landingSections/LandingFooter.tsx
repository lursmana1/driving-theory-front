import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";
import { LANDING } from "@/CONSTS/landing";
import { DEFAULT_CATEGORY_ID } from "@/CONSTS/categories";

const footerLink = "text-ink/65 transition-colors hover:text-accent";

export default async function LandingFooter() {
  const t = await getTranslations("Home");
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-hairline py-14 text-ink">
      <div className="section">
        <div className="grid gap-12 md:grid-cols-3">
          <div>
            <div className="flex items-center gap-2.5">
              <span className={LANDING.footerLogoMark} aria-hidden>
                P
              </span>
              <span className="text-lg font-bold text-ink">prava.ge</span>
            </div>
            <p className={`mt-4 max-w-sm ${LANDING.body}`}>{t("footerBrand")}</p>
          </div>

          <div className="grid grid-cols-2 gap-8 md:contents">
            <nav aria-label={t("footerPlatform")}>
              <h3 className={LANDING.headingFooter}>{t("footerPlatform")}</h3>
              <ul className="mt-4 space-y-2.5 text-sm">
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
                <li>
                  <Link href="/city-exam" className={footerLink}>
                    {t("footerCityExam")}
                  </Link>
                </li>
              </ul>
            </nav>

            <nav aria-label={t("footerResources")}>
              <h3 className={LANDING.headingFooter}>{t("footerResources")}</h3>
              <ul className="mt-4 space-y-2.5 text-sm">
                <li>
                  <Link href="#faq" className={footerLink}>
                    {t("footerFaq")}
                  </Link>
                </li>
              </ul>
            </nav>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-2 border-t border-hairline pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-ink/45">
            {t("footerCopyright", { year })}
          </p>
          <p className="text-xs tracking-wide text-ink/40">
            {t("heroBrandMark")}
          </p>
        </div>
      </div>
    </footer>
  );
}
