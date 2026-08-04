import { redirect } from "next/navigation";
import { getLocale } from "next-intl/server";

export default async function TicketsIndexPage() {
  const locale = await getLocale();
  redirect(`/${locale}/tickets/1`);
}
