import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import { pickClientMessages } from "@/i18n/clientMessages";

/** The study plan's client components also need the `StudyPlan` namespace. */
export default async function PlanLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [locale, messages] = await Promise.all([getLocale(), getMessages()]);
  return (
    <NextIntlClientProvider
      locale={locale}
      messages={pickClientMessages(messages, ["StudyPlan"])}
    >
      {children}
    </NextIntlClientProvider>
  );
}
