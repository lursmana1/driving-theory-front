import { describe, expect, it, vi } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

vi.mock("server-only", () => ({}));
const { default: BlogContent } = await import("./BlogContent");

const render = (html: string) => renderToStaticMarkup(createElement(BlogContent, { html }));

describe("BlogContent (server-rendered blog body)", () => {
  it("renders headings, paragraphs, lists and bold text into the HTML", () => {
    const out = render("<h2>სათაური</h2><p>ტექსტი <strong>მუქი</strong></p><ul><li>ერთი</li></ul>");
    expect(out).toContain("<h2>სათაური</h2>");
    expect(out).toContain("<strong>მუქი</strong>");
    expect(out).toMatch(/<ul><li><p>ერთი<\/p><\/li><\/ul>/);
  });

  it("keeps internal links followed and makes external links nofollow + new tab", () => {
    const out = render(
      '<p><a href="https://prava.ge/city-exam/rustavi">რუსთავი</a> <a href="https://example.com">x</a></p>',
    );
    expect(out).toMatch(/<a href="https:\/\/prava\.ge\/city-exam\/rustavi">რუსთავი<\/a>/);
    expect(out).toMatch(/<a[^>]*href="https:\/\/example\.com"[^>]*>/);
    expect(out).toContain('rel="noopener noreferrer nofollow"');
    expect(out).toContain('target="_blank"');
  });

  it("drops scripts, event handlers and javascript: links", () => {
    const out = render(
      '<p onclick="alert(1)">a</p><script>alert(2)</script><img src="x" onerror="alert(3)"><p><a href="javascript:alert(4)">b</a></p>',
    );
    expect(out).not.toMatch(/<script/i);
    expect(out).not.toMatch(/onclick|onerror/i);
    expect(out).not.toMatch(/javascript:/i);
    expect(out).toContain(">a</p>");
  });

  it("renders an empty post without crashing", () => {
    expect(render("")).toContain("tiptap-prose");
  });
});
