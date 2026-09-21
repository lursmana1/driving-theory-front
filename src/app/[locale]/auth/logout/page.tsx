import LogoutClient from "./LogoutClient";
import { pageMeta } from "@/lib/pageMeta";

type PageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: PageProps) {
  const { locale } = await params;
  return pageMeta("logout", { locale });
}

export default function LogoutPage() {
  return <LogoutClient />;
}
