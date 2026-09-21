import { Link } from "@/i18n/navigation";
import AuthForm from "@/components/AuthForm/AuthForm";
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
    <main className="min-h-screen bg-slate-50/50 py-8 font-georgian">
      <div className="section mb-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-lg font-bold text-slate-900"
        >
          <span
            className="flex h-9 w-9 items-center justify-center rounded-lg bg-linear-to-br from-accent to-accent-strong text-sm font-bold text-white"
            aria-hidden
          >
            P
          </span>
          prava.ge
        </Link>
      </div>
      <div className="section">
        <AuthForm initialMode={initialMode} oauthErrorKey={oauthErrorKey} />
      </div>
    </main>
  );
}
