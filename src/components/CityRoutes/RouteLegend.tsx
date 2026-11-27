import type { ViewerLabels } from "./types";

type Props = {
  labels: Pick<ViewerLabels, "legendRoute" | "legendDirection" | "legendStart">;
  /** Row under the map on phones; a column in the desktop side panel. */
  layout: "row" | "column";
};

/** Map legend: the agency maps draw the route in yellow, direction arrows and the start circle in green. */
export default function RouteLegend({ labels, layout }: Props) {
  const row = layout === "row";
  const item = `flex items-center ${row ? "gap-1.5" : "gap-2"}`;
  const marker = row ? "" : "flex w-6 justify-center";
  return (
    <ul
      className={
        row
          ? "flex flex-wrap items-center gap-x-4 gap-y-1"
          : "flex flex-col gap-1.5 text-sm text-fg-muted"
      }
    >
      <li className={item}>
        <span aria-hidden className="h-1.5 w-6 rounded-full bg-warning" />
        {labels.legendRoute}
      </li>
      <li className={item}>
        <span aria-hidden className={`${marker} font-bold text-success`}>
          →
        </span>
        {labels.legendDirection}
      </li>
      <li className={item}>
        <span aria-hidden className={marker}>
          <span className="block size-3 rounded-full border-2 border-success" />
        </span>
        {labels.legendStart}
      </li>
    </ul>
  );
}
