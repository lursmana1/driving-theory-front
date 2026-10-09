"use client";

import { useEffect } from "react";
import CreateBlogForm from "@/components/CreateBlogForm/CreateBlogForm";
import { useAuth } from "@/contexts/UserContext";
import { useRouter } from "@/i18n/navigation";

export default function CreateBlogGate() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const isAdmin = user?.type === "admin";

  useEffect(() => {
    if (loading || isAdmin) return;
    router.replace("/");
  }, [loading, isAdmin, router]);

  if (loading || !isAdmin) return null;

  return (
    <main className="section flex min-h-[60vh] flex-col items-center justify-center py-12">
      <div className="mx-auto w-full max-w-3xl">
        <h1 className="mb-8 text-3xl font-semibold">Create Blog</h1>
        <CreateBlogForm />
      </div>
    </main>
  );
}
