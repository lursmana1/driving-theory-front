import AuthForm from "@/components/AuthForm/AuthForm";
import AuthPageShell from "@/components/AuthForm/AuthPageShell";
import { googleCallbackErrorKey } from "@/utills/helpers/authErrorKey";
import { pageMeta } from "@/lib/pageMeta";

type PageProps = {
  params: Promise<{ locale: string }>;
  searchParams?: Promise<{
    mode?: string;
    error?: string;
    authError?: string;
  }>;
};

export async function generateMetadata({ params }: PageProps) {
  const { locale } = await params;
  return pageMeta("auth", { locale });
}

export default async function AuthPage({ searchParams }: PageProps) {
  const sp = searchParams ? await searchParams : {};
  const initialMode = sp.mode === "register" ? "register" : "login";
  const oauthParams = new URLSearchParams();
  if (sp.error) oauthParams.set("error", sp.error);
  if (sp.authError) oauthParams.set("authError", sp.authError);
  const oauthErrorKey = googleCallbackErrorKey(oauthParams);

  return (
    <AuthPageShell>
      <AuthForm initialMode={initialMode} oauthErrorKey={oauthErrorKey} />
    </AuthPageShell>
  );
}
