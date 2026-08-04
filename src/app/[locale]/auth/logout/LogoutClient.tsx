"use client";

import { useEffect } from "react";
import { logout } from "@/api/auth";
import { useRouter } from "@/i18n/navigation";

export default function LogoutClient() {
  const router = useRouter();

  useEffect(() => {
    logout()
      .catch(() => {})
      .finally(() => {
        router.replace("/");
      });
  }, [router]);

  return (
    <div className="flex min-h-[40vh] items-center justify-center">
      <p className="text-slate-600">გასვლა...</p>
    </div>
  );
}
