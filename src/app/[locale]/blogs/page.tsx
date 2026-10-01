import { getBlogs } from "@/api/blogs";
import BlogCard from "@/components/Blogs/BlogCard";
import { BLOGS_PAGE_SIZE } from "@/CONSTS/pagination";
import Pagination from "@/components/Pagination/Pagination";
import { getLocale, getTranslations } from "next-intl/server";
import { pageMeta } from "@/lib/pageMeta";

type PageProps = {
  params: Promise<{ locale: string }>;
  searchParams?: Promise<{ page?: string; size?: string }>;
};

export async function generateMetadata({ params, searchParams }: PageProps) {
  const { locale } = await params;
  const sp = searchParams ? await searchParams : {};
  const rawPage = Number(sp.page ?? "1");
  const page =
    Number.isFinite(rawPage) && rawPage > 1 ? Math.floor(rawPage) : 1;
  return pageMeta("blogs", {
    locale,
    path: page > 1 ? `/blogs?page=${page}` : "/blogs",
  });
}

export default async function BlogsPage({ searchParams }: PageProps) {
  const sp = searchParams ? await searchParams : {};
  const page = Number(sp.page ?? "1");
  const locale = await getLocale();
  const t = await getTranslations("Blogs");

  let data: Awaited<ReturnType<typeof getBlogs>>["data"] = [];
  let resPage = page;
  let total = 0;
  let backendUnavailable = false;

  try {
    const res = await getBlogs(page, BLOGS_PAGE_SIZE);
    data = res.data;
    resPage = res.page;
    total = res.total;
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
          {t("title")}
        </h2>
        {backendUnavailable && (
          <p className="text-center text-slate-500 py-6">
            {t("unavailable")}
          </p>
        )}
        {data.length === 0 ? (
          <p className="text-slate-500 py-12">{t("empty")}</p>
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
            params={{ size: sp.size }}
          />
        </div>
      </section>
    </div>
  );
}
