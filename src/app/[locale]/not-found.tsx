import { getTranslations } from "next-intl/server";
import NotFoundView from "@/components/NotFoundPage/NotFoundView";

export async function generateMetadata() {
  const t = await getTranslations("NotFound");
  return { title: t("title") };
}

export default async function NotFound() {
  const t = await getTranslations("NotFound");

  return <NotFoundView title={t("title")} backLabel={t("back")} />;
}
