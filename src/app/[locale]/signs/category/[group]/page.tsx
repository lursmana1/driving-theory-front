import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { hasLocale } from "next-intl";
import { routing } from "@/i18n/routing";
import {
  DEFAULT_SIGN_GROUP_ID,
  SIGN_GROUP_SLUGS,
  signGroupHref,
  signGroupIdBySlug,
} from "@/CONSTS/signGroups";
import { buildMetadata } from "@/lib/seo";
import { getSignGroups } from "@/lib/signs";
import { redirectTo } from "@/i18n/redirectTo";
import SignsIndexView from "@/components/Signs/SignsIndexView";

type SignGroupPageProps = {
  params: Promise<{ locale: string; group: string }>;
};

export function generateStaticParams() {
  return Object.entries(SIGN_GROUP_SLUGS)
    .filter(([id]) => Number(id) !== DEFAULT_SIGN_GROUP_ID)
    .map(([, group]) => ({ group }));
}

export async function generateMetadata({ params }: SignGroupPageProps) {
  const { locale, group: slug } = await params;
  if (hasLocale(routing.locales, locale)) setRequestLocale(locale);
  const groupId = signGroupIdBySlug(slug);
  const group = getSignGroups().find((g) => g.id === groupId);
  if (!group) return {};
  const t = await getTranslations({ locale, namespace: "SignsPage" });
  const tMeta = await getTranslations({ locale, namespace: "Meta" });
  const name = t(`groups.${group.id}`);
  return buildMetadata({
    title: tMeta("signsGroupTitle", { group: name }),
    description: tMeta("signsGroupDescription", {
      group: name,
      count: group.count,
      about: t(`groupsAbout.${group.id}`),
    }),
    path: signGroupHref(group.id),
    locale,
  });
}

export default async function SignGroupPage({ params }: SignGroupPageProps) {
  const { locale, group: slug } = await params;
  if (hasLocale(routing.locales, locale)) setRequestLocale(locale);
  // warning signs live on /signs itself
  if (slug === SIGN_GROUP_SLUGS[DEFAULT_SIGN_GROUP_ID]) await redirectTo("/signs");
  const groupId = signGroupIdBySlug(slug);
  if (groupId == null) notFound();
  return <SignsIndexView locale={locale} groupId={groupId} />;
}
