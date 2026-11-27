import { Link } from "@/i18n/navigation";
import { EXAM_CITIES, cityRouteHref, examCityName } from "@/CONSTS/cityRoutes";
import { cityLinkClass } from "./classes";

type Props = {
  locale: string;
  /** Leave out the city the page is about. */
  exclude?: string;
  className?: string;
};

/** Plain links to the exam cities' route pages (crawlable, unlike the city Select). Server component. */
export default function ExamCityLinks({ locale, exclude, className = "" }: Props) {
  return (
    <ul className={`flex flex-wrap gap-2 ${className}`}>
      {EXAM_CITIES.filter((c) => c.slug !== exclude).map((c) => (
        <li key={c.slug}>
          <Link href={cityRouteHref(c.slug)} className={cityLinkClass}>
            {examCityName(c.slug, locale)}
          </Link>
        </li>
      ))}
    </ul>
  );
}
