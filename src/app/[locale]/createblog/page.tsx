import CreateBlogForm from "@/components/CreateBlogForm/CreateBlogForm";
import { getUser } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function CreateBlogPage() {
  const user = await getUser();
  console.log(user, "zd");
  if (user?.type !== "admin") {
    redirect("/");
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
