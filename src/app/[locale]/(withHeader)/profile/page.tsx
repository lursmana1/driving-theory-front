import { redirect } from "next/navigation";
import { getLocale } from "next-intl/server";
import { getUser } from "@/lib/auth";
import { Link } from "@/i18n/navigation";

export default async function ProfilePage() {
  const user = await getUser();
  if (!user) {
    const locale = await getLocale();
    redirect(`/${locale}/auth`);
  }

  const displayName =
    [user.name, user.surname].filter(Boolean).join(" ") || user.email;

  return (
    <main className="section py-8">
      <h1 className="text-2xl font-bold mb-6">ჩემი პროფილი</h1>

      <div className="max-w-md space-y-4 rounded-lg border border-slate-200 bg-white p-6">
        <div>
          <span className="text-sm text-slate-500">სახელი</span>
          <p className="font-medium">{displayName}</p>
        </div>
        <div>
          <span className="text-sm text-slate-500">ელფოსტა</span>
          <p className="font-medium">{user.email}</p>
        </div>
       
        <div className="pt-4 border-t border-slate-200">
          <Link
            href="/auth/logout"
            className="inline-block rounded-md bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200"
          >
            გასვლა
          </Link>
        </div>
      </div>
    </main>
  );
}
