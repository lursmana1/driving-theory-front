import { getBlogs } from "@/api/blogs";
import BlogCard from "@/components/Blogs/BlogCard";
import { BLOGS_PAGE_SIZE } from "@/CONSTS/pagination";
import Pagination from "@/components/Pagination/Pagination";
import { getLocale, getTranslations } from "next-intl/server";
import { pageMeta } from "@/lib/pageMeta";
import { JsonLd } from "@/components/JsonLd";
import { blogListJsonLd, breadcrumbJsonLd } from "@/lib/seo";

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
    page,
  });
}

export default async function BlogsPage({ searchParams }: PageProps) {
  const sp = searchParams ? await searchParams : {};
  const page = Number(sp.page ?? "1");
  const locale = await getLocale();
  const t = await getTranslations("Blogs");
  const tMeta = await getTranslations("Meta");
  const tHeader = await getTranslations("Header");

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

  const listPath = pagination.page > 1 ? `/blogs?page=${pagination.page}` : "/blogs";

  return (
    <div className="bg-slate-50">
      <JsonLd
        data={blogListJsonLd({
          locale,
          title: tMeta("blogsTitle"),
          description: tMeta("blogsDescription"),
          path: listPath,
          posts: data,
        })}
      />
      <JsonLd
        data={breadcrumbJsonLd(locale, [
          { name: tHeader("navHome"), href: "/" },
          { name: t("title"), href: "/blogs" },
        ])}
      />
      <section className="section py-8 sm:py-12">
        <header className="mb-8 flex max-w-2xl flex-col gap-3 sm:mb-10">
          <span className="w-fit rounded-full bg-accent/10 px-3 py-1 text-xs font-semibold text-accent">
            {t("eyebrow")}
          </span>
          <h1 className="font-georgian text-2xl font-bold leading-tight text-slate-900 sm:text-4xl">
            {t("heading")}
          </h1>
          <p className="text-[15px] leading-7 text-slate-600 sm:text-base">
            {t("subtitle")}
          </p>
        </header>

        {backendUnavailable ? (
          <p className="rounded-2xl border border-slate-200 bg-white px-6 py-12 text-center text-slate-500">
            {t("unavailable")}
          </p>
        ) : data.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center text-slate-500">
            {t("empty")}
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-8">
            {data.map((post) => (
              <BlogCard key={post.id} post={post} locale={locale} />
            ))}
          </div>
        )}

        <div className="mt-10 flex justify-center sm:justify-end">
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
