import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { UserProvider } from "@/contexts/UserContext";
import { AppShell } from "@/components/layout/AppShell";

export const dynamicParams = true;

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

interface LocaleLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export default async function LocaleLayout({
  children,
  params,
}: LocaleLayoutProps) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);
  const messages = await getMessages();

  return (
    <UserProvider>
      <NextIntlClientProvider locale={locale} messages={messages}>
        <AppShell locale={locale}>{children}</AppShell>
      </NextIntlClientProvider>
    </UserProvider>
  );
}
