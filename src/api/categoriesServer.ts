import { cache } from "react";
import { getServerBaseApi } from "@/api/ServerBaseApi";
import {
  normalizeCategoryDetail,
  normalizeCategoryList,
} from "@/api/categories";
import type { Category, CategoryWithSubjects } from "@/lib/types/category";

/** Server Components only. Forwards cookies and the request locale. */
export const getCategoriesServer = cache(async (): Promise<Category[]> => {
  const api = await getServerBaseApi();
  const res = await api.get<Category[]>("/categories");
  return normalizeCategoryList(res.data);
});

export const getCategoryByIdServer = cache(
  async (id: number, locale?: string): Promise<CategoryWithSubjects> => {
    const api = await getServerBaseApi();
    const res = await api.get<CategoryWithSubjects>(`/categories/${id}`);
    return normalizeCategoryDetail(res.data, locale);
  },
);
