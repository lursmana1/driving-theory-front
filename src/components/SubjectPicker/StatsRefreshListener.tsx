"use client";

import { useEffect } from "react";
import { useRouter } from "@/i18n/navigation";
import { subscribeStatsRefresh } from "@/lib/statsRefresh";

/** Re-fetches server data after exam completion without a full client-side reload. */
export default function StatsRefreshListener() {
  const router = useRouter();

  useEffect(() => {
    return subscribeStatsRefresh(() => {
      router.refresh();
    });
  }, [router]);

  return null;
}
