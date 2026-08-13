import CreateBlogForm from "@/components/CreateBlogForm/CreateBlogForm";
import { getUser } from "@/lib/auth";
import { redirectTo } from "@/i18n/redirectTo";
import { pageMeta } from "@/lib/pageMeta";

type PageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: PageProps) {
  const { locale } = await params;
  return pageMeta("createBlog", { locale });
}

export default async function CreateBlogPage() {
  const user = await getUser();
  if (user?.type !== "admin") {
    await redirectTo("/");
  }

  return (
    <main className="section flex min-h-[60vh] flex-col items-center justify-center py-12">
      <div className="mx-auto w-full max-w-3xl">
        <h1 className="mb-8 text-3xl font-semibold">Create Blog</h1>
        <CreateBlogForm />
      </div>
    </main>
  );
}
