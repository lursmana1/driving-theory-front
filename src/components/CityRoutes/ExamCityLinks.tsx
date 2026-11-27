import { Link } from "@/i18n/navigation";
import { EXAM_CITIES, cityRouteHref, examCityName } from "@/CONSTS/cityRoutes";
import { cityLinkClass } from "./classes";

type Props = {
  locale: string;
  className?: string;
};

/** Plain links to the 10 exam cities' route pages (`/city-exam`; crawlable, unlike the city Select). Server component. */
export default function ExamCityLinks({ locale, className = "" }: Props) {
  return (
    <ul className={`flex flex-wrap gap-2 ${className}`}>
      {EXAM_CITIES.map((c) => (
        <li key={c.slug}>
          <Link href={cityRouteHref(c.slug)} className={cityLinkClass}>
            {examCityName(c.slug, locale)}
          </Link>
        </li>
      ))}
    </ul>
  );
}
