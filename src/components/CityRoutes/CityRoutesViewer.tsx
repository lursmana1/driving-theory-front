"use client";

import dynamic from "next/dynamic";
import { useCallback, useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { useCityRouteSelection } from "@/utills/helpers/hooks/useCityRouteSelection";
import RoutePanel from "./RoutePanel";
import RouteSidePanel from "./RouteSidePanel";
import type { ViewerCity, ViewerGroup, ViewerLabels, ViewerRoute, ZoomMode } from "./types";

/** Only downloaded the first time someone opens a map full screen. */
const RouteZoomDialog = dynamic(() => import("./RouteZoomDialog"), { ssr: false });

type Props = {
  cities: ViewerCity[];
  city: string;
  groups: ViewerGroup[];
  routes: ViewerRoute[];
  labels: ViewerLabels;
};

/**
 * City exam routes. Desktop: big map on the left, a narrow sticky panel on the right
 * (city, category, route grid). Phones: a compact sticky bar above the map.
 * Every route stays in the HTML (hidden panels) so all maps are indexed.
 */
export default function CityRoutesViewer({ cities, city, groups, routes, labels }: Props) {
  const router = useRouter();
  const { group, pickGroup, visible, index, route, go, onTabKey, registerTab } = useCityRouteSelection(
    routes,
    groups,
  );
  const [zoom, setZoom] = useState<ZoomMode | null>(null);

  const prev = useCallback(() => go(index - 1), [go, index]);
  const next = useCallback(() => go(index + 1), [go, index]);
  const closeZoom = useCallback(() => setZoom(null), []);

  const pickCity = useCallback(
    (slug: string) => {
      const target = cities.find((c) => c.slug === slug);
      if (target) router.push(target.href, { scroll: false });
    },
    [cities, router],
  );

  const position = visible.length > 1 ? { index, total: visible.length } : null;

  return (
    <div className="flex flex-col gap-4 lg:flex-row-reverse lg:items-start lg:gap-6">
      <RouteSidePanel
        city={city}
        cities={cities}
        groups={groups}
        group={group}
        visible={visible}
        route={route}
        labels={labels}
        onPickCity={pickCity}
        onPickGroup={pickGroup}
        onPickRoute={go}
        onTabKey={onTabKey}
        registerTab={registerTab}
      />

      <div className="min-w-0 flex-1">
        {routes.map((r) => (
          <RoutePanel
            key={r.no}
            route={r}
            shown={r.no === route.no}
            priority={r.no === routes[0].no}
            position={r.no === route.no ? position : null}
            labels={labels}
            onPrev={prev}
            onNext={next}
            onEnlarge={() => setZoom("fit")}
          />
        ))}
      </div>

      {zoom ? (
        <RouteZoomDialog
          route={route}
          mode={zoom}
          canSwitch={visible.length > 1}
          labels={labels}
          onMode={setZoom}
          onClose={closeZoom}
          onPrev={prev}
          onNext={next}
        />
      ) : null}
    </div>
  );
}
