import { Suspense } from "react";
import ProfileClient from "@/components/Profile/ProfileClient";
import { pageMeta } from "@/lib/pageMeta";

type PageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: PageProps) {
  const { locale } = await params;
  return pageMeta("profile", { locale });
}

function ProfileFallback() {
  return (
    <main className="section py-16">
      <div className="flex items-center justify-center text-fg-subtle">
        <span className="h-6 w-6 animate-spin rounded-full border-2 border-line-strong border-t-fg-faint" />
      </div>
    </main>
  );
}

export default function ProfilePage() {
  return (
    <Suspense fallback={<ProfileFallback />}>
      <ProfileClient />
    </Suspense>
  );
}
