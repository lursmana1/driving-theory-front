import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";
import { LANDING } from "@/CONSTS/landing";

const footerLink = "hover:text-slate-900";

export default async function LandingFooter() {
  const t = await getTranslations("Home");
  const year = new Date().getFullYear();

  return (
    <footer className="bg-white py-16 text-slate-800">
      <div className="section">
        <div className="grid gap-12 md:grid-cols-3">
          <div>
            <div className="flex items-center gap-2">
              <span className={LANDING.footerLogoMark} aria-hidden>
                P
              </span>
              <span className="text-xl font-bold text-slate-900">prava.ge</span>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-slate-600">
              {t("footerBrand")}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8 md:contents">
            <nav aria-label={t("footerPlatform")}>
              <h3 className={LANDING.headingFooter}>{t("footerPlatform")}</h3>
              <ul className="mt-4 space-y-2 text-sm text-slate-600">
                <li>
                  <Link href="/exam" className={footerLink}>
                    {t("footerSimulation")}
                  </Link>
                </li>
                <li>
                  <Link href="/subjectpicker" className={footerLink}>
                    {t("footerTopics")}
                  </Link>
                </li>
                {/* <li>
                  <Link href="/leaderboard" className={footerLink}>
                    {t("footerLeaderboard")}
                  </Link>
                </li> */}
                {/* <li>
                  <Link href="#" className={footerLink}>
                    {t("footerPrizes")}
                  </Link>
                </li> */}
              </ul>
            </nav>

            <nav aria-label={t("footerResources")}>
              <h3 className={LANDING.headingFooter}>{t("footerResources")}</h3>
              <ul className="mt-4 space-y-2 text-sm text-slate-600">
                <li>
                  <Link href="#faq" className={footerLink}>
                    {t("footerFaq")}
                  </Link>
                </li>
                <li>
                  <Link href="#" className={footerLink}>
                    {t("footerHelp")}
                  </Link>
                </li>
                <li>
                  <Link href="#" className={footerLink}>
                    {t("footerTermsLink")}
                  </Link>
                </li>
                <li>
                  <Link href="#" className={footerLink}>
                    {t("footerContact")}
                  </Link>
                </li>
              </ul>
            </nav>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-slate-200 pt-8 md:flex-row">
          <p className="text-center text-sm text-slate-500 md:text-left">
            {t("footerCopyright", { year })}
          </p>
          <div className="flex gap-6 text-sm text-slate-500">
            <Link href="#" className="hover:text-slate-700">
              {t("footerPrivacyLink")}
            </Link>
            <Link href="#" className="hover:text-slate-900">
              {t("footerCookies")}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
