/**
 * Pages under the header's "More" menu (not in the main `navLinks`), so the
 * main row fits on smaller laptops. `labelKey` resolves against `Header`.
 */
export const moreInfoLinks = [
  { href: "/city-exam", labelKey: "moreInfoCityExam" },
  { href: "/city-exam/rustavi", labelKey: "moreInfoCityRoutes" },
  { href: "/yard-exam", labelKey: "moreInfoYardExam" },
  { href: "/blogs", labelKey: "navBlog" },
] as const;
