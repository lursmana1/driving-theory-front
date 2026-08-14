"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useAuth } from "@/contexts/UserContext";
import { profileInitials } from "@/components/Profile/profileUtils";

export function ProfileHeader() {
  const { user, loading: authLoading } = useAuth();
  const t = useTranslations("Profile");

  const displayName = user
    ? [user.name, user.surname].filter(Boolean).join(" ") || user.email
    : "";
  const initials = user
    ? profileInitials(displayName) || user.email[0]?.toUpperCase()
    : "";
  const email = user?.email ?? "";

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm sm:rounded-3xl">
      <div className="h-20 bg-linear-to-r from-sky-500 to-violet-600 sm:h-24" />
      <div className="flex flex-col gap-4 px-4 pb-5 sm:px-6 sm:pb-6 md:flex-row md:items-end md:justify-between">
        <div className="flex items-end gap-3 sm:gap-4">
          <div className="-mt-8 flex h-16 w-16 shrink-0 items-center justify-center rounded-xl border-4 border-white bg-slate-800 text-xl font-bold text-white shadow-md sm:-mt-10 sm:h-20 sm:w-20 sm:rounded-2xl sm:text-2xl">
            {authLoading ? (
              <span className="h-6 w-6 animate-pulse rounded-full bg-slate-600" />
            ) : (
              initials
            )}
          </div>
          <div className="min-w-0 pb-1">
            {authLoading ? (
              <div className="space-y-2">
                <div className="h-6 w-32 animate-pulse rounded bg-slate-200 sm:h-7 sm:w-40" />
                <div className="h-4 w-44 animate-pulse rounded bg-slate-100" />
              </div>
            ) : (
              <>
                <h1 className="truncate text-lg font-bold text-slate-900 sm:text-2xl">
                  {displayName}
                </h1>
                <p className="truncate text-sm text-slate-500">{email}</p>
              </>
            )}
          </div>
        </div>
        {!authLoading && (
          <Link
            href="/auth/logout"
            className="inline-flex w-full items-center justify-center rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-100 sm:w-auto"
          >
            {t("logout")}
          </Link>
        )}
      </div>
    </section>
  );
}
