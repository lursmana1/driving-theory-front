import Image from "next/image";
import { Link } from "@/i18n/navigation";
import type { Blog } from "@/lib/types/blog";
import { formatDate } from "@/utills/helpers/formatDate";
import { getLocale } from "next-intl/server";

const BlogIntroduction = async ({
  id,
  name,
  description,
  imageUrl,
  createdAt,
}: Blog) => {
  const locale = await getLocale();
  return (
    <article className="flex flex-col sm:flex-row gap-6 py-6 border-b border-slate-200 last:border-b-0 first:pt-0">
      <div className="shrink-0 w-full sm:w-[35%] sm:max-w-[280px] aspect-4/3 relative rounded-lg overflow-hidden bg-slate-100">
        <Image
          src={imageUrl}
          alt={name}
          width={560}
          height={420}
          className="absolute inset-0 h-full w-full object-cover"
          sizes="(max-width: 768px) 100vw, 280px"
          priority
        />
      </div>

      <div className="flex-1 min-w-0 flex flex-col">
        <h2 className="text-xl font-bold text-slate-900 mb-1">{name}</h2>
        <div className="flex items-center gap-2 text-sm text-slate-500 mb-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
          <time
            dateTime={
              typeof createdAt === "string"
                ? createdAt
                : createdAt.toISOString()
            }
          >
            {formatDate(createdAt, locale, "D MMM YYYY")}
          </time>
        </div>
        <p className="text-slate-600 text-[15px] leading-relaxed line-clamp-3 mb-4 flex-1">
          {description}
        </p>
        <Link
          href={`/blogs/${id}`}
          className="self-start text-rose-500 hover:text-rose-600 font-medium text-sm transition-colors"
        >
          მეტის წაკითხვა
        </Link>
      </div>
    </article>
  );
};

export default BlogIntroduction;
