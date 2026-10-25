export type BlogCreator = {
  name: string;
};

export type Blog = {
  id: number;
  name: string;
  content: string;
  description: string;
  imageUrl: string;
  /** ISO string over JSON. */
  createdAt: string | Date;
  /** Not sent by the API today. */
  updatedAt?: string | Date;
  creator?: BlogCreator;
  /** Not shown in the UI. Missing when the API predates view counting; then no view is recorded. */
  viewsCount?: number;
};

export type BlogsResponse = {
  data: Blog[];
  page: number;
  total: number;
  totalPages: number;
};
