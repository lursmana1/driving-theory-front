import { redirectTo } from "@/i18n/redirectTo";
import { DEFAULT_CATEGORY_ID } from "@/CONSTS/categories";
import { pageMeta } from "@/lib/pageMeta";

type PageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: PageProps) {
  const { locale } = await params;
  return pageMeta("tickets", {
    locale,
    path: `/tickets/${DEFAULT_CATEGORY_ID}`,
  });
}

export default async function TicketsIndexPage() {
  await redirectTo(`/tickets/${DEFAULT_CATEGORY_ID}`);
}
