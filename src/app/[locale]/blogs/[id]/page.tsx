import BaseApi from "@/api/BaseApi";
import Tiptap from "@/components/Tiptap/Tiptap";
import type { Blog } from "@/lib/types/blog";
import { formatDate } from "@/utills/helpers/formatDate";
import { getReadTime } from "@/utills/helpers/getReadTime";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { getLocale } from "next-intl/server";
import { notFound } from "next/navigation";

type Props = { params: Promise<{ id: string }> };

const CalendarIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="shrink-0 opacity-80"
  >
    <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
    <line x1="16" x2="16" y1="2" y2="6" />
    <line x1="8" x2="8" y1="2" y2="6" />
    <line x1="3" x2="21" y1="10" y2="10" />
  </svg>
);

const ClockIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="shrink-0 opacity-80"
  >
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

export default async function BlogPage({ params }: Props) {
  const { id } = await params;
  const locale = await getLocale();
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
              ← Back to Blogs
            </Link>
            <span className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-600 shadow-sm">
              Blog
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
              <CalendarIcon />
              {formatDate(blog.createdAt, locale, "MMMM D, YYYY")}
            </time>
            <span className="flex items-center gap-2">
              <ClockIcon />
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
