import { getUser } from "@/lib/auth";
import CreateBlogGate from "./CreateBlogGate";
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

  return <CreateBlogGate serverIsAdmin={user?.type === "admin"} />;
}
