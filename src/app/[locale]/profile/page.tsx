import { Suspense } from "react";
import ProfileClient from "@/components/Profile/ProfileClient";

function ProfileFallback() {
  return (
    <main className="section py-16">
      <div className="flex items-center justify-center text-slate-500">
        <span className="h-6 w-6 animate-spin rounded-full border-2 border-slate-300 border-t-slate-600" />
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
