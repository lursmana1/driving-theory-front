import AuthPageShell from "@/components/AuthForm/AuthPageShell";
import ForgotPasswordForm from "@/components/AuthForm/ForgotPasswordForm";
import { PASSWORD_RESET_ENABLED } from "@/CONSTS/features";
import { redirectTo } from "@/i18n/redirectTo";
import { pageMeta } from "@/lib/pageMeta";

type PageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: PageProps) {
  const { locale } = await params;
  return pageMeta("forgotPassword", { locale });
}

export default async function ForgotPasswordPage() {
  // Hidden until the reset e-mail can actually be sent (see CONSTS/features).
  if (!PASSWORD_RESET_ENABLED) await redirectTo("/auth");

  return (
    <AuthPageShell>
      <ForgotPasswordForm />
    </AuthPageShell>
  );
}
