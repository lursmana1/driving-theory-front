"use client";

import { useCallback, useDeferredValue, useEffect, useMemo, useState } from "react";
import { Select } from "antd";
import { useLocale, useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { signGroupHref } from "@/CONSTS/signGroups";
import { Icon } from "@/components/Icon/Icon";
import type { Sign, SignGroup } from "@/lib/types/signs";
import SignGrid from "./SignGrid";
import SignMarkingsList from "./SignMarkingsList";
import SignTile, { signTileSpan } from "./SignTile";
import { loadSignLookup, signsFromLookup, type SignSearchHit } from "./signLookup";

type SignsExplorerProps = {
  groups: SignGroup[];
  /** the group this URL is about, with explanations (`/signs` = warning signs, `/signs/category/<group>`) */
  activeGroup: number;
  items: Sign[];
};

/**
 * Georgian endings change with the case ("გაჩერება" / "გაჩერების"), so longer words lose their final vowel
 * before matching. Every typed word has to appear in the name.
 */
function searchWords(query: string) {
  return query
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => (w.length > 4 ? w.replace(/[აეიოუ]$/, "") : w));
}

export default function SignsExplorer({ groups, activeGroup: group, items }: SignsExplorerProps) {
  const t = useTranslations("SignsPage");
  const locale = useLocale();
  const router = useRouter();
  /** every sign's name, for searching other groups — loaded on the first search, not with the page */
  const [index, setIndex] = useState<SignSearchHit[] | null>(null);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<string | null>(null);
  const q = useDeferredValue(query.trim().toLowerCase());
  const words = useMemo(() => searchWords(q), [q]);

  const labelOf = useCallback(
    (s: SignSearchHit) => (s.kind === "marking" ? t("markingLabel", { number: s.number }) : s.name),
    [t],
  );
  const matches = useCallback(
    (s: SignSearchHit) => !q || words.every((w) => labelOf(s).toLowerCase().includes(w)),
    [q, words, labelOf],
  );

  useEffect(() => {
    if (!q || index) return;
    let alive = true;
    void loadSignLookup(locale).then((l) => {
      if (alive) setIndex(signsFromLookup(l));
    });
    return () => {
      alive = false;
    };
  }, [q, index, locale]);

  // `#3-24` opens that sign and scrolls to it (links from ticket explanations, shared links)
  useEffect(() => {
    const openFromHash = () => {
      const slug = decodeURIComponent(window.location.hash.slice(1));
      if (!items.some((s) => s.slug === slug)) return;
      setSelected(slug);
      requestAnimationFrame(() => document.getElementById(slug)?.scrollIntoView({ block: "start" }));
    };
    openFromHash();
    window.addEventListener("hashchange", openFromHash);
    return () => window.removeEventListener("hashchange", openFromHash);
  }, [items]);

  const markings = items.length > 0 && items[0].kind === "marking";
  const visible = items.filter(matches);

  const elsewhere = q
    ? groups
        .filter((g) => g.id !== group)
        .map((g) => ({ group: g, items: (index ?? []).filter((s) => s.group === g.id && matches(s)) }))
        .filter((sec) => sec.items.length > 0)
    : [];
  const found = visible.length + elsewhere.reduce((n, sec) => n + sec.items.length, 0);

  return (
    <div>
      {/* group links: the picker on desktop; on phones the dropdown below takes over, but the links stay in the HTML */}
      <nav aria-label={t("browseGroups")} className="section hidden pt-6 lg:block">
        <ul className="flex flex-wrap gap-2">
          {groups.map((g) => (
            <li key={g.id}>
              <Link
                href={signGroupHref(g.id)}
                scroll={false}
                onClick={() => setQuery("")}
                aria-current={g.id === group ? "page" : undefined}
                className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition ${
                  g.id === group
                    ? "border-inverse bg-inverse text-fg-inverse shadow-raised"
                    : "border-line bg-surface text-fg-muted shadow-card hover:border-line-strong hover:text-fg"
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element -- static SVG icon */}
                <img src={g.icon} alt="" width={18} height={18} className="h-4.5 w-4.5 object-contain" />
                {t(`groups.${g.id}`)}
                <span className={`font-mono text-2xs ${g.id === group ? "text-fg-inverse/70" : "text-fg-faint"}`}>
                  {g.count}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="sticky top-12 z-40 border-b border-line bg-canvas/95 backdrop-blur-md sm:top-14 lg:mt-4">
        <div className="section flex flex-col gap-2 py-3 md:flex-row md:items-center">
          <Select
            size="large"
            aria-label={t("groupLabel")}
            className="h-12! w-full md:w-80 md:shrink-0 lg:hidden!"
            popupMatchSelectWidth
            listHeight={420}
            value={group}
            onChange={(id: number) => {
              setQuery("");
              router.push(signGroupHref(id), { scroll: false });
            }}
            options={groups.map((g) => ({
              value: g.id,
              label: (
                <span className="flex items-center gap-2">
                  {/* eslint-disable-next-line @next/next/no-img-element -- static SVG icon */}
                  <img src={g.icon} alt="" width={20} height={20} className="h-5 w-5 shrink-0 object-contain" />
                  <span className="min-w-0 truncate">{t(`groups.${g.id}`)}</span>
                  <span className="ml-auto pl-2 font-mono text-2xs text-fg-faint">{g.count}</span>
                </span>
              ),
            }))}
          />
          <label className="relative min-w-0 flex-1">
            <span className="sr-only">{t("searchLabel")}</span>
            <Icon
              name="search"
              size={18}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2"
            />
            <input
              id="signs-search"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("searchPlaceholder")}
              className="h-12 w-full rounded-control border border-line bg-surface pl-10 pr-3 text-sm text-fg shadow-card outline-none transition placeholder:text-fg-faint focus:border-accent"
            />
          </label>
        </div>
      </div>

      <div className="section flex flex-col gap-10 py-8 sm:py-10">
        {q ? (
          <p className="-mb-4 text-sm text-fg-subtle">
            {found > 0 ? t("results", { count: found }) : t("noResults", { query: query.trim() })}
          </p>
        ) : null}

        {markings ? (
          <SignMarkingsList markings={visible} />
        ) : (
          <SignGrid signs={visible} labelOf={labelOf} selected={selected} onSelect={setSelected} />
        )}

        {elsewhere.length > 0 ? (
          <div className="flex flex-col gap-8">
            <h2 className="text-sm font-semibold uppercase tracking-eyebrow text-fg-subtle">
              {t("otherGroupsResults")}
            </h2>
            {elsewhere.map(({ group: g, items: hits }) => (
              <section key={g.id}>
                <header className="mb-4 flex items-center gap-3 border-b border-line pb-3">
                  {/* eslint-disable-next-line @next/next/no-img-element -- static SVG icon */}
                  <img src={g.icon} alt="" width={32} height={32} className="h-8 w-8 shrink-0 object-contain" />
                  <h3 className="text-base font-bold text-fg">{t(`groups.${g.id}`)}</h3>
                  <span className="ml-auto font-mono text-sm text-fg-faint">{hits.length}</span>
                </header>
                <ul className="grid grid-cols-1 gap-2 sm:grid-cols-3 sm:gap-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8">
                  {hits.map((s) => (
                    <li key={s.slug} className={signTileSpan(s)}>
                      <SignTile sign={s} label={labelOf(s)} href={`${signGroupHref(g.id)}#${s.slug}`} />
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
