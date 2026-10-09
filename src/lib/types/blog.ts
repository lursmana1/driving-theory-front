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
};

export type BlogsResponse = {
  data: Blog[];
  page: number;
  total: number;
  totalPages: number;
};
