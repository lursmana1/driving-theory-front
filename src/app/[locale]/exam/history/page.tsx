import { redirect } from "next/navigation";
import { getLocale } from "next-intl/server";

export default async function ExamHistoryPage() {
  const locale = await getLocale();
  redirect(`/${locale}/profile`);
}
