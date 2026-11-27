import { getTranslations, setRequestLocale } from "next-intl/server";
import { hasLocale } from "next-intl";
import { routing } from "@/i18n/routing";
import { Link } from "@/i18n/navigation";
import { JsonLd } from "@/components/JsonLd";
import { aboutPageJsonLd, buildMetadata } from "@/lib/seo";
import { CONTACT_EMAIL } from "@/CONSTS/contact";
import { contactEmailLink } from "@/components/ContactEmailLink";

type Props = { params: Promise<{ locale: string }> };

const PATH = "/about";

/** What the site offers, each linked to its page. */
const OFFERS = [
  { key: "offer1", href: "/tickets/1" },
  { key: "offer2", href: "/subjectpicker" },
  { key: "offer3", href: "/plan" },
  { key: "offer4", href: "/practice" },
  { key: "offer5", href: "/signs" },
  { key: "offer6", href: "/city-exam" },
] as const;

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  if (hasLocale(routing.locales, locale)) setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "About" });
  return buildMetadata({ title: t("metaTitle"), description: t("metaDescription"), path: PATH, locale });
}

/** "About us": who makes prava.ge, what it offers, where the information comes from. Server component. */
export default async function AboutPage({ params }: Props) {
  const { locale } = await params;
  if (hasLocale(routing.locales, locale)) setRequestLocale(locale);
  const t = await getTranslations("About");

  return (
    <main className="section max-w-3xl py-8 font-georgian sm:py-12">
      <JsonLd
        data={aboutPageJsonLd({ locale, path: PATH, title: t("title"), description: t("metaDescription") })}
      />
      <h1 className="text-2xl font-bold text-fg sm:text-3xl">{t("title")}</h1>
      <p className="mt-3 text-body leading-7 text-fg-muted">{t("intro")}</p>
      {t.has("story") ? <p className="mt-3 text-body leading-7 text-fg-muted">{t("story")}</p> : null}

      <section aria-labelledby="about-offer" className="mt-8">
        <h2 id="about-offer" className="text-lg font-bold text-fg">
          {t("offerTitle")}
        </h2>
        <ul className="mt-3 flex flex-col gap-2">
          {OFFERS.map(({ key, href }) => (
            <li key={key}>
              <Link
                href={href}
                className="block rounded-card border border-line bg-surface px-4 py-3 text-sm leading-6 text-fg hover:border-accent sm:text-body"
              >
                {t(key)}
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="about-sources" className="mt-8">
        <h2 id="about-sources" className="text-lg font-bold text-fg">
          {t("sourcesTitle")}
        </h2>
        <p className="mt-2 text-sm leading-7 text-fg-muted sm:text-body">{t("sourcesText")}</p>
      </section>

      <section aria-labelledby="about-contact" className="mt-8">
        <h2 id="about-contact" className="text-lg font-bold text-fg">
          {t("contactTitle")}
        </h2>
        <p className="mt-2 text-sm leading-7 text-fg-muted sm:text-body">
          {t.rich("contactText", { email: CONTACT_EMAIL, mail: contactEmailLink })}
        </p>
      </section>
    </main>
  );
}
