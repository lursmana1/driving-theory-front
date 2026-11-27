"use client";

import { Select } from "antd";
import type { KeyboardEvent } from "react";
import RouteLegend from "./RouteLegend";
import { badgeClass, chipClass, panelLabelClass, selectBoxClass } from "./classes";
import type { ViewerCity, ViewerGroup, ViewerLabels, ViewerRoute } from "./types";

type Props = {
  city: string;
  cities: ViewerCity[];
  groups: ViewerGroup[];
  group: string;
  visible: ViewerRoute[];
  route: ViewerRoute;
  labels: Pick<
    ViewerLabels,
    "pickCity" | "pickCategory" | "pickRoute" | "legendRoute" | "legendDirection" | "legendStart"
  >;
  onPickCity: (slug: string) => void;
  onPickGroup: (key: string) => void;
  onPickRoute: (index: number) => void;
  onTabKey: (e: KeyboardEvent) => void;
  registerTab: (no: number, el: HTMLButtonElement | null) => void;
};

/** Controls: a plain block above the map on phones (scrolls away), a sticky side panel on desktop. */
export default function RouteSidePanel({
  city,
  cities,
  groups,
  group,
  visible,
  route,
  labels,
  onPickCity,
  onPickGroup,
  onPickRoute,
  onTabKey,
  registerTab,
}: Props) {
  return (
    <aside className="flex flex-col gap-2.5 lg:sticky lg:top-20 lg:z-30 lg:w-80 lg:shrink-0 lg:gap-5 lg:rounded-card lg:border lg:border-line lg:bg-surface lg:p-5 lg:shadow-card">
      <div className="flex gap-2 lg:flex-col lg:gap-5">
        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
          <span className={panelLabelClass}>{labels.pickCity}</span>
          <div className={selectBoxClass}>
            <Select
              size="large"
              aria-label={labels.pickCity}
              className="h-10! w-full"
              popupMatchSelectWidth={false}
              listHeight={420}
              value={city}
              onChange={onPickCity}
              options={cities.map((c) => ({ value: c.slug, label: c.name }))}
            />
          </div>
        </div>

        {groups.length > 1 ? (
          <div className="flex min-w-0 flex-1 flex-col gap-1.5">
            <span className={panelLabelClass}>{labels.pickCategory}</span>
            <div className={`${selectBoxClass} lg:hidden`}>
              <Select
                size="large"
                aria-label={labels.pickCategory}
                className="h-10! w-full"
                popupMatchSelectWidth={false}
                value={group}
                onChange={onPickGroup}
                options={groups.map((g) => ({ value: g.key, label: g.label }))}
              />
            </div>
            <div role="group" aria-label={labels.pickCategory} className="hidden flex-wrap gap-1.5 lg:flex">
              {groups.map((g) => (
                <button
                  key={g.key}
                  type="button"
                  aria-pressed={g.key === group}
                  onClick={() => onPickGroup(g.key)}
                  className={`px-3 py-1.5 ${chipClass(g.key === group)}`}
                >
                  {g.label}
                </button>
              ))}
            </div>
          </div>
        ) : null}
      </div>

      <div className="flex flex-col gap-1.5">
        <span className={panelLabelClass}>{labels.pickRoute}</span>
        <div
          role="tablist"
          aria-label={labels.pickRoute}
          aria-orientation="horizontal"
          onKeyDown={onTabKey}
          className="-mx-1 flex gap-1.5 overflow-x-auto px-1 py-1 lg:mx-0 lg:grid lg:grid-cols-4 lg:gap-2 lg:overflow-visible lg:p-0"
        >
          {visible.map((r, i) => {
            const selected = r.no === route.no;
            return (
              <button
                key={r.no}
                ref={(el) => registerTab(r.no, el)}
                type="button"
                role="tab"
                id={`route-tab-${r.no}`}
                aria-selected={selected}
                aria-controls={`route-${r.no}`}
                tabIndex={selected ? 0 : -1}
                onClick={() => onPickRoute(i)}
                className={`relative min-w-12 shrink-0 px-3 py-1.5 lg:min-w-0 lg:py-2.5 ${chipClass(selected)}`}
              >
                №{r.no}
                {r.badge ? (
                  <span aria-hidden className="absolute -right-1 -top-1 size-2.5 rounded-full bg-warning" />
                ) : null}
              </button>
            );
          })}
        </div>
      </div>

      {/* Desktop only: what is on screen now + legend. */}
      <div className="hidden flex-col gap-3 border-t border-line pt-4 lg:flex">
        <div>
          <p className="font-georgian text-lg font-bold text-fg">{route.title}</p>
          <p className="text-sm text-fg-muted">{route.categories}</p>
          {route.badge ? <p className={`mt-2 inline-block ${badgeClass}`}>{route.badge}</p> : null}
        </div>
        <RouteLegend labels={labels} layout="column" />
        <p className="text-xs text-fg-subtle">{route.source}</p>
      </div>
    </aside>
  );
}
