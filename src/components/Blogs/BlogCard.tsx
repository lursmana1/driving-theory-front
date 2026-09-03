import type { Blog } from "@/lib/types/blog";
import { getReadTime } from "@/utills/helpers/getReadTime";
import Image from "next/image";
import { Link } from "@/i18n/navigation";

type BlogCardProps = {
  post: Blog;
  locale: string;
};

export default function BlogCard({ post, locale }: BlogCardProps) {
  return (
    <Link href={`/blogs/${post.id}`} className="group block">
      <article className="h-full flex flex-col">
        <div className="relative h-56 sm:h-64 overflow-hidden rounded-lg mb-4 bg-slate-100">
          {post.imageUrl ? (
            <Image
              src={post.imageUrl}
              alt={post.name}
              width={800}
              height={450}
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-400 text-sm">
              No image
            </div>
          )}
        </div>
        <span className="inline-block px-3 py-1 bg-slate-100 rounded-full text-sm mb-3 w-fit">
          Blog
        </span>
        <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-slate-600 transition-colors line-clamp-2">
          {post.name}
        </h3>
        <p className="text-slate-600 mb-4 grow line-clamp-3">
          {post.description}
        </p>
        <div className="flex items-center gap-4 text-sm text-slate-500">
          {post.creator?.name && <span>{post.creator.name}</span>}
          <span>{getReadTime(post.content ?? "")}</span>
        </div>
      </article>
    </Link>
  );
}
