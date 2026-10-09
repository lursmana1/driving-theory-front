import { getBlog } from "@/api/blogs";
import Tiptap from "@/components/Tiptap/Tiptap";
import type { Blog } from "@/lib/types/blog";
import { formatDate } from "@/utills/helpers/formatDate";
import { getReadTime } from "@/utills/helpers/getReadTime";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { pageMeta } from "@/lib/pageMeta";
import {
  blogPostingJsonLd,
  breadcrumbJsonLd,
  buildMetadata,
} from "@/lib/seo";
import { siteMetadata } from "@/lib/site-metadata";
import { plainTextExcerpt } from "@/utills/helpers/plainTextExcerpt";
import { Icon } from "@/components/Icon/Icon";
import { JsonLd } from "@/components/JsonLd";

type Props = { params: Promise<{ locale: string; id: string }> };

function blogDescription(blog: Blog): string {
  const own = blog.description?.trim();
  if (own) return plainTextExcerpt(own);
  return plainTextExcerpt(blog.content ?? "") || blog.name;
}

function toIso(value?: string | Date): string | undefined {
  if (!value) return undefined;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
}

export async function generateMetadata({ params }: Props) {
  const { locale, id } = await params;
  try {
    const blog = await getBlog(id);
    const publishedTime = toIso(blog.createdAt);
    const modifiedTime = toIso(blog.updatedAt) ?? publishedTime;
    return buildMetadata({
      title: blog.name,
      description: blogDescription(blog),
      keywords: [blog.name, ...siteMetadata.keywords],
      path: `/blogs/${id}`,
      locale,
      image: blog.imageUrl
        ? { url: blog.imageUrl, alt: blog.name }
        : undefined,
      openGraph: {
        type: "article",
        ...(publishedTime ? { publishedTime } : {}),
        ...(modifiedTime ? { modifiedTime } : {}),
        ...(blog.creator?.name ? { authors: [blog.creator.name] } : {}),
        section: "Blog",
      },
    });
  } catch {
    return pageMeta("blogs", { locale, index: false });
  }
}

export default async function BlogPage({ params }: Props) {
  const { id } = await params;
  const locale = await getLocale();
  const t = await getTranslations("Blogs");
  const tHeader = await getTranslations("Header");
  let blog: Blog;

  try {
    blog = await getBlog(id);
  } catch {
    notFound();
  }

  const dateTime = toIso(blog.createdAt) ?? "";

  return (
    <div className="min-h-screen bg-slate-50/50">
      <JsonLd
        data={blogPostingJsonLd(locale, {
          ...blog,
          description: blogDescription(blog),
        })}
      />
      <JsonLd
        data={breadcrumbJsonLd(locale, [
          { name: tHeader("navHome"), href: "/" },
          { name: t("title"), href: "/blogs" },
          { name: blog.name, href: `/blogs/${blog.id}` },
        ])}
      />
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
              {t("readTime", { minutes: getReadTime(blog.content ?? "") })}
            </span>
          </div>

          {/* Hero image - rounded corners, below meta */}
          {blog.imageUrl && (
            <div className="relative mb-10 aspect-21/9 w-full overflow-hidden rounded-xl shadow-md">
              <Image
                src={blog.imageUrl}
                alt={blog.name}
                width={1200}
                height={514}
                className="absolute inset-0 h-full w-full object-cover"
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
