import { DEFAULT_CATEGORY_ID } from "@/CONSTS/categories";

export const navLinks = [
  { href: "/", label: "მთავარი" },
  { href: "/subjectpicker", label: "გამოცდა" },
  { href: `/tickets/${DEFAULT_CATEGORY_ID}`, label: "ბილეთები" },
  { href: "/blogs", label: "ბლოგი" },
] as const;
