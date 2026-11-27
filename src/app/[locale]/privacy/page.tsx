import { getTranslations, setRequestLocale } from "next-intl/server";
import { hasLocale } from "next-intl";
import { routing } from "@/i18n/routing";
import { buildMetadata } from "@/lib/seo";
import { CONTACT_EMAIL, PRIVACY_UPDATED } from "@/CONSTS/contact";
import { contactEmailLink } from "@/components/ContactEmailLink";

type Props = { params: Promise<{ locale: string }> };

const SECTIONS = ["account", "progress", "browser", "analytics", "not", "services", "delete"] as const;

/** "2026-11-27" → "27.11.2026" */
const formatDate = (iso: string) => iso.split("-").reverse().join(".");

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  if (hasLocale(routing.locales, locale)) setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "Privacy" });
  return buildMetadata({
    title: t("metaTitle"),
    description: t("metaDescription"),
    path: "/privacy",
    locale,
  });
}

/** Short, plain privacy policy. Server component, no client JS. */
export default async function PrivacyPage({ params }: Props) {
  const { locale } = await params;
  if (hasLocale(routing.locales, locale)) setRequestLocale(locale);
  const t = await getTranslations("Privacy");

  return (
    <main className="section max-w-3xl py-8 font-georgian sm:py-12">
      <h1 className="text-2xl font-bold text-fg sm:text-3xl">{t("title")}</h1>
      <p className="mt-3 text-body leading-7 text-fg-muted">{t("intro")}</p>
      <p className="mt-2 text-sm text-fg-subtle">{t("updated", { date: formatDate(PRIVACY_UPDATED) })}</p>

      <div className="mt-8 flex flex-col gap-6">
        {SECTIONS.map((key) => (
          <section key={key} aria-labelledby={`privacy-${key}`}>
            <h2 id={`privacy-${key}`} className="text-lg font-bold text-fg">
              {t(`${key}Title`)}
            </h2>
            <p className="mt-2 text-sm leading-7 text-fg-muted sm:text-body">
              {key === "delete"
                ? t.rich("deleteText", { email: CONTACT_EMAIL, mail: contactEmailLink })
                : t(`${key}Text`)}
            </p>
          </section>
        ))}
      </div>
    </main>
  );
}
