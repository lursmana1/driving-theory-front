import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const { formatRouteNumbers, routeGroupKeys, routeUpdates, routesByCategory, cityRouteGroups } = await import(
  "./cityRoutes"
);
type Route = Parameters<typeof routeGroupKeys>[0];

const route = (no: number, categories: string[], date = "2026-07-21"): Route => ({
  no,
  categories,
  image: `/images/city-routes/x/route-${no}.webp`,
  width: 1400,
  height: 990,
  source: { date, doc: "b-be" },
});

const B = ["B", "BE"];
const C = ["C", "C1", "D1", "D", "CE", "DE", "C1E", "D1E"];

describe("formatRouteNumbers", () => {
  it("joins runs of 3+ into a range, keeps pairs and singles", () => {
    expect(formatRouteNumbers([1, 2, 3, 6, 7, 8, 9, 10])).toBe("№1–№3, №6–№10");
    expect(formatRouteNumbers([4, 5, 11])).toBe("№4, №5, №11");
    expect(formatRouteNumbers([2])).toBe("№2");
  });

  it("sorts its input and handles an empty list", () => {
    expect(formatRouteNumbers([3, 1, 2])).toBe("№1–№3");
    expect(formatRouteNumbers([])).toBe("");
  });
});

describe("category groups", () => {
  const routes = [route(1, B), route(2, B), route(5, C)];

  it("puts a route in every group whose first category it carries", () => {
    expect(routeGroupKeys(routes[0])).toEqual(["b"]);
    expect(routeGroupKeys(routes[2])).toEqual(["c", "d", "e"]);
  });

  it("lists only groups the city has, in the agency's order", () => {
    expect(cityRouteGroups([route(1, B)]).map((g) => g.key)).toEqual(["b"]);
    expect(cityRouteGroups(routes).map((g) => g.key)).toEqual(["b", "c", "d", "e"]);
  });

  it("builds the routes-by-category rows without empty groups", () => {
    expect(routesByCategory([route(1, B), route(2, B), route(3, B)])).toEqual([{ label: "B, BE", numbers: "№1–№3" }]);
  });
});

describe("routeUpdates", () => {
  it("marks routes from the newest file only when the city mixes files", () => {
    const gori = [route(1, B, "2026-10-27"), route(2, B, "2026-10-27"), route(3, B), route(4, B)];
    const { oldest, newest, updated } = routeUpdates(gori);
    expect([oldest, newest]).toEqual(["2026-07-21", "2026-10-27"]);
    expect(updated.map((r) => r.no)).toEqual([1, 2]);
  });

  it("marks nothing when all maps come from one file", () => {
    expect(routeUpdates([route(1, B), route(2, B)]).updated).toEqual([]);
  });
});
