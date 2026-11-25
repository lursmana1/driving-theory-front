import { describe, expect, it } from "vitest";
import { pageHref } from "./pagination";

describe("pageHref", () => {
  it("keeps the other params, drops empty ones and page 1", () => {
    expect(pageHref("/tickets/1", { subjects: "3", size: "" }, 1)).toBe(
      "/tickets/1?subjects=3",
    );
    expect(pageHref("/tickets/1", { page: "7" }, 4)).toBe("/tickets/1?page=4");
  });

  it("adds the anchor after the query", () => {
    expect(pageHref("/tickets/1", { subjects: "3" }, 2, "tickets")).toBe(
      "/tickets/1?subjects=3&page=2#tickets",
    );
    expect(pageHref("/tickets/1", {}, 1, "tickets")).toBe("/tickets/1#tickets");
  });
});
