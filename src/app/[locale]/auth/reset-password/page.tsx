import type { Metadata } from "next";
import AuthPageShell from "@/components/AuthForm/AuthPageShell";
import ResetPasswordForm from "@/components/AuthForm/ResetPasswordForm";
import { pageMeta } from "@/lib/pageMeta";

type PageProps = {
  params: Promise<{ locale: string }>;
  searchParams?: Promise<{ token?: string | string[] }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const meta = await pageMeta("resetPassword", { locale });
  // The URL carries a reset token: never send it to another site as Referer.
  return { ...meta, referrer: "no-referrer" };
}

export default async function ResetPasswordPage({ searchParams }: PageProps) {
  const sp = searchParams ? await searchParams : {};
  const token = typeof sp.token === "string" ? sp.token : null;

  return (
    <AuthPageShell>
      <ResetPasswordForm token={token} />
    </AuthPageShell>
  );
}
