import { Link } from "@/i18n/navigation";
import AuthForm from "@/components/AuthForm/AuthForm";
import { pageMeta } from "@/lib/pageMeta";

type PageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: PageProps) {
  const { locale } = await params;
  return pageMeta("auth", { locale });
}

export default async function AuthPage() {
  return (
    <main className="min-h-screen bg-slate-50/50 py-8 font-georgian">
      <div className="section mb-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-lg font-bold text-slate-900"
        >
          <span
            className="flex h-9 w-9 items-center justify-center rounded-lg bg-linear-to-br from-sky-500 to-violet-600 text-sm font-bold text-white"
            aria-hidden
          >
            P
          </span>
          prava.ge
        </Link>
      </div>
      <div className="section">
        <AuthForm />
      </div>
    </main>
  );
}
