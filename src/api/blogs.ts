import { cache } from "react";
import { getServerBaseApi } from "@/api/ServerBaseApi";
import type { Blog, BlogsResponse } from "@/lib/types/blog";

export async function getBlogs(
  page: number,
  size: number,
): Promise<BlogsResponse> {
  const api = await getServerBaseApi();
  const res = await api.get<BlogsResponse>("/blogs", {
    params: { page, size },
  });
  return res.data;
}

/** Shared by metadata and the page so one request is reused. */
export const getBlog = cache(async (id: string): Promise<Blog> => {
  const api = await getServerBaseApi();
  const res = await api.get<Blog>(`/blogs/${id}`);
  return res.data;
});
