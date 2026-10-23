import { getTranslations, setRequestLocale } from "next-intl/server";
import { hasLocale } from "next-intl";
import { routing } from "@/i18n/routing";
import { DEFAULT_SIGN_GROUP_ID } from "@/CONSTS/signGroups";
import { buildMetadata } from "@/lib/seo";
import SignsIndexView from "@/components/Signs/SignsIndexView";

type SignsPageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: SignsPageProps) {
  const { locale } = await params;
  if (hasLocale(routing.locales, locale)) setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "Meta" });
  return buildMetadata({
    title: t("signsTitle"),
    description: t("signsDescription"),
    path: "/signs",
    locale,
  });
}

/** Opens on warning signs; every other group has its own `/signs/category/<group>` page. */
export default async function SignsPage({ params }: SignsPageProps) {
  const { locale } = await params;
  if (hasLocale(routing.locales, locale)) setRequestLocale(locale);
  return <SignsIndexView locale={locale} groupId={DEFAULT_SIGN_GROUP_ID} />;
}
