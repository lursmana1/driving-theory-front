import { DEFAULT_CATEGORY_ID } from "@/CONSTS/categories";

/** `labelKey` resolves against the `Header` namespace in `messages/*.json`. */
export const navLinks = [
  { href: "/", labelKey: "navHome" },
  { href: "/subjectpicker", labelKey: "navExam" },
  { href: `/tickets/${DEFAULT_CATEGORY_ID}`, labelKey: "navTickets" },
  // { href: "/blogs", labelKey: "navBlog" },
] as const;
