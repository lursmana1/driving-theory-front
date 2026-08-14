"use client";

import dynamic from "next/dynamic";
import { useEffect } from "react";
import { useRouter } from "@/i18n/navigation";
import { useAuth } from "@/contexts/UserContext";
import { ProfileHeader } from "@/components/Profile/ProfileHeader";
import { ProfileAttemptStats } from "@/components/Profile/ProfileAttemptStats";
import { ProfileExamHistory } from "@/components/Profile/ProfileExamHistory";
import { ProfileOverviewSkeleton } from "@/components/Profile/ProfileOverviewSkeleton";

const ProfileOverviewSection = dynamic(
  () => import("@/components/Profile/ProfileOverviewSection"),
  { loading: () => <ProfileOverviewSkeleton /> },
);

export default function ProfileClient() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/auth");
    }
  }, [authLoading, user, router]);

  if (!authLoading && !user) {
    return null;
  }

  return (
    <main className="section space-y-6 py-6 font-georgian sm:space-y-8 sm:py-8">
      <ProfileHeader />
      <ProfileAttemptStats />
      <ProfileOverviewSection />
      <ProfileExamHistory />
    </main>
  );
}
