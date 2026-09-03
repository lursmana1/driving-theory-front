import BaseApi from "@/api/BaseApi";
import Tiptap from "@/components/Tiptap/Tiptap";
import type { Blog } from "@/lib/types/blog";
import { formatDate } from "@/utills/helpers/formatDate";
import { getReadTime } from "@/utills/helpers/getReadTime";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { pageMeta } from "@/lib/pageMeta";
import { buildMetadata } from "@/lib/seo";
import { Icon } from "@/components/Icon/Icon";

type Props = { params: Promise<{ locale: string; id: string }> };

export async function generateMetadata({ params }: Props) {
  const { locale, id } = await params;
  try {
    const res = await BaseApi.get<Blog>(`/blogs/${id}`);
    return buildMetadata({
      title: res.data.name,
      description: res.data.description || res.data.name,
      path: `/blogs/${id}`,
      locale,
    });
  } catch {
    return pageMeta("blogs", { locale });
  }
}

export default async function BlogPage({ params }: Props) {
  const { id } = await params;
  const locale = await getLocale();
  const t = await getTranslations("Blogs");
  let blog: Blog;

  try {
    const res = await BaseApi.get(`/blogs/${id}`);
    blog = res.data;
  } catch {
    notFound();
  }

  const dateTime =
    typeof blog.createdAt === "string"
      ? blog.createdAt
      : blog.createdAt instanceof Date
        ? blog.createdAt.toISOString()
        : "";

  return (
    <div className="min-h-screen bg-slate-50/50">
      <article className="section py-8 sm:py-12">
        <div className="mx-auto max-w-5xl">
          {/* Back link + category */}
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <Link
              href="/blogs"
              className="text-sm text-slate-500 transition-colors hover:text-slate-700"
            >
              ← {t("back")}
            </Link>
            <span className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-600 shadow-sm">
              {t("title")}
            </span>
          </div>

          {/* Title - centered */}
          <h1 className="mb-6 text-center text-3xl font-bold leading-tight text-slate-900 sm:text-4xl">
            {blog.name}
          </h1>

          {/* Meta - centered with icons */}
          <div className="mb-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-slate-500">
            {blog.creator?.name && (
              <span className="font-medium text-slate-600">
                {blog.creator.name}
              </span>
            )}
            <time dateTime={dateTime} className="flex items-center gap-2">
              <Icon name="calendar" className="h-4 w-4 shrink-0 opacity-80" />
              {formatDate(blog.createdAt, locale, "MMMM D, YYYY")}
            </time>
            <span className="flex items-center gap-2">
              <Icon name="clock" className="h-4 w-4 shrink-0 opacity-80" />
              {getReadTime(blog.content ?? "")}
            </span>
          </div>

          {/* Hero image - rounded corners, below meta */}
          {blog.imageUrl && (
            <div className="relative mb-10 aspect-21/9 w-full overflow-hidden rounded-xl shadow-md">
              <Image
                src={blog.imageUrl}
                alt={blog.name}
                fill
                className="object-cover"
                priority
                sizes="(max-width: 768px) 100vw, 672px"
              />
            </div>
          )}

          {/* Body content - white card with soft shadow */}
          <div className="rounded-2xl border border-slate-100 bg-white px-6 py-8 shadow-sm sm:px-10 sm:py-12">
            <div className="blog-content max-w-none">
              <Tiptap value={blog.content ?? ""} readonly bare />
            </div>
          </div>
        </div>
      </article>
    </div>
  );
}
