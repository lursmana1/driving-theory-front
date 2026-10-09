import type { Blog } from "@/lib/types/blog";
import { getReadTime } from "@/utills/helpers/getReadTime";
import { formatDate } from "@/utills/helpers/formatDate";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";
import { Icon } from "@/components/Icon/Icon";

type BlogCardProps = {
  post: Blog;
  locale: string;
};

export default async function BlogCard({ post, locale }: BlogCardProps) {
  const t = await getTranslations("Blogs");

  return (
    <Link
      href={`/blogs/${post.id}`}
      className="group block h-full rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
    >
      <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition duration-300 group-hover:-translate-y-1 group-hover:shadow-lg">
        <div className="relative aspect-video overflow-hidden bg-slate-100">
          {post.imageUrl ? (
            <Image
              src={post.imageUrl}
              alt={post.name}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          ) : null}
        </div>

        <div className="flex grow flex-col p-5 sm:p-6">
          <div className="mb-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
            <time
              dateTime={new Date(post.createdAt).toISOString()}
              className="flex items-center gap-1.5"
            >
              <Icon name="calendar" className="h-3.5 w-3.5 opacity-70" />
              {formatDate(post.createdAt, locale, "D MMM YYYY")}
            </time>
            <span aria-hidden className="h-1 w-1 rounded-full bg-slate-300" />
            <span className="flex items-center gap-1.5">
              <Icon name="clock" className="h-3.5 w-3.5 opacity-70" />
              {t("readTime", { minutes: getReadTime(post.content ?? "") })}
            </span>
          </div>

          <h2 className="mb-2 line-clamp-2 font-georgian text-lg font-bold leading-snug text-slate-900 transition-colors group-hover:text-accent sm:text-xl">
            {post.name}
          </h2>
          <p className="mb-5 line-clamp-3 grow text-[15px] leading-6 text-slate-600">
            {post.description}
          </p>

          <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-accent">
            {t("readMore")}
            <span
              aria-hidden
              className="transition-transform duration-300 group-hover:translate-x-1"
            >
              →
            </span>
          </span>
        </div>
      </article>
    </Link>
  );
}
