import BaseApi from "@/api/BaseApi";
import BlogCard from "@/components/Blogs/BlogCard";
import { BLOGS_PAGE_SIZE } from "@/CONSTS/pagination";
import Pagination from "@/components/Pagination/Pagination";
import type { BlogsResponse } from "@/lib/types/blog";
import { getLocale } from "next-intl/server";

type PageProps = {
  searchParams?: Promise<{ page?: string; size?: string }>;
};

export default async function BlogsPage({ searchParams }: PageProps) {
  const sp = searchParams ? await searchParams : {};
  const page = Number(sp.page ?? "1");
  const locale = await getLocale();

  let data: BlogsResponse["data"] = [];
  let resPage = page;
  let total = 0;
  let backendUnavailable = false;

  try {
    const res = await BaseApi.get<BlogsResponse>("/blogs", {
      params: { page, size: BLOGS_PAGE_SIZE },
    });
    data = res.data.data;
    resPage = res.data.page;
    total = res.data.total;
  } catch {
    backendUnavailable = true;
  }

  const pagination = {
    page: resPage ?? page,
    total: total ?? data.length,
  };

  return (
    <div className=" bg-white">
      <section className="section py-6 sm:py-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-8">
          Blogs
        </h2>
        {backendUnavailable && (
          <p className="text-center text-slate-500 py-6">
            Service unavailable. Please try again later.
          </p>
        )}
        {data.length === 0 ? (
          <p className="text-slate-500 py-12">No posts yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {data.map((post) => (
              <BlogCard key={post.id} post={post} locale={locale} />
            ))}
          </div>
        )}

        <div className="flex justify-end mt-10">
          <Pagination
            page={pagination.page}
            total={pagination.total}
            pathname="/blogs"
            pageSize={BLOGS_PAGE_SIZE}
          />
        </div>
      </section>
    </div>
  );
}
