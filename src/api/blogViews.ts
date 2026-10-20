import BaseApi from "./BaseApi";

/** Client only: counts one view. Kept out of `blogs.ts`, which is server-only. */
export async function recordBlogView(id: number | string): Promise<number> {
  const res = await BaseApi.post<{ viewsCount: number }>(`/blogs/${id}/view`);
  return res.data.viewsCount;
}
