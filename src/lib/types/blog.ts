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
  /** Missing when the API predates view counting; the UI then hides the count. */
  viewsCount?: number;
};

export type BlogsResponse = {
  data: Blog[];
  page: number;
  total: number;
  totalPages: number;
};
