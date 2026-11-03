import type { ReactNode } from "react";
import { Link } from "@/i18n/navigation";

/** Page frame shared by /auth, /auth/forgot-password and /auth/reset-password. */
export default function AuthPageShell({ children }: { children: ReactNode }) {
  return (
    <main className="min-h-screen py-8 font-georgian">
      <div className="section mb-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-lg font-bold text-fg"
        >
          <span
            className="flex h-9 w-9 items-center justify-center rounded-control bg-linear-to-br from-accent to-accent-strong text-sm font-bold text-fg-inverse"
            aria-hidden
          >
            P
          </span>
          prava.ge
        </Link>
      </div>
      <div className="section">{children}</div>
    </main>
  );
}

/** Centered card used by the forgot/reset password pages. */
export function AuthCard({
  title,
  intro,
  children,
}: {
  title: string;
  intro?: string;
  children: ReactNode;
}) {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md flex-col justify-center py-12">
      <div className="rounded-card border border-line bg-surface p-8 shadow-overlay sm:p-10">
        <h1 className="font-georgian text-2xl font-bold text-fg">{title}</h1>
        {intro ? (
          <p className="mt-2 text-sm leading-6 text-fg-muted">{intro}</p>
        ) : null}
        <div className="mt-6">{children}</div>
      </div>
    </div>
  );
}
