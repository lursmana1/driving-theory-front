"use client";

import { useState } from "react";
import { Link } from "@/i18n/navigation";
import { LANDING } from "@/CONSTS/landing";
import { DEFAULT_CATEGORY_ID } from "@/CONSTS/categories";
import { LandingIcon } from "./LandingIcons";
import { labelFormatter, type LandingLabels } from "./landingLabels";

export type LandingRuleRow = {
  id: number;
  name: string;
  total: number;
  pass: number;
  mistakes: number;
};

/**
 * Interactive part of the rules section: category picker, big numbers and the full table.
 * Every row is in the SSR HTML (crawlable); clicking only moves the highlight.
 */
export default function LandingExamRules({
  rows,
  labels,
}: {
  rows: LandingRuleRow[];
  labels: LandingLabels;
}) {
  const t = labelFormatter(labels);
  const [activeId, setActiveId] = useState(DEFAULT_CATEGORY_ID);
  const active = rows.find((r) => r.id === activeId) ?? rows[0];

  const stats = [
    { value: active.total, label: t("rulesQuestions"), tone: "text-fg" },
    { value: active.pass, label: t("rulesPass"), tone: "text-accent" },
    { value: active.mistakes, label: t("rulesMistakes"), tone: "text-success-strong" },
  ];

  return (
    <div className="mt-10 grid gap-8 lg:grid-cols-2 lg:gap-12">
      {/* picked category */}
      <div className="flex min-w-0 flex-col rounded-panel border border-line bg-surface-muted p-6 sm:p-8">
        <div
          className="flex flex-wrap gap-2"
          role="group"
          aria-label={t("rulesCategory")}
        >
          {rows.map((row) => {
            const on = row.id === active.id;
            return (
              <button
                key={row.id}
                type="button"
                aria-pressed={on}
                onClick={() => setActiveId(row.id)}
                className={`h-11 rounded-full border px-4 text-sm font-semibold transition sm:h-9 sm:px-3.5 ${
                  on
                    ? "border-accent bg-accent text-on-accent"
                    : "border-line bg-surface text-fg-muted hover:border-accent hover:text-accent"
                }`}
              >
                {row.name}
              </button>
            );
          })}
        </div>

        <dl className="mt-8 grid gap-2 sm:grid-cols-3 sm:gap-4">
          {stats.map((s) => (
            <div
              key={s.label}
              className="flex min-w-0 flex-row-reverse items-baseline justify-end gap-3 rounded-card border border-line-subtle bg-surface px-4 py-3 shadow-card sm:flex-col-reverse sm:items-start sm:gap-0 sm:p-5"
            >
              <dt className="text-sm font-medium leading-5 text-fg-subtle sm:mt-2 sm:leading-4">
                {s.label}
              </dt>
              <dd
                className={`text-3xl font-extrabold tabular-nums tracking-display sm:text-5xl ${s.tone}`}
              >
                {s.value}
              </dd>
            </div>
          ))}
        </dl>

        {/* mistakes bar: one cell per question, the allowed mistakes in green */}
        <div className="mt-6 flex gap-0.5" aria-hidden>
          {Array.from({ length: active.total }).map((_, i) => (
            <span
              key={i}
              className={`h-2 flex-1 rounded-full ${
                i >= active.pass ? "bg-success" : "bg-accent-muted"
              }`}
            />
          ))}
        </div>

        {active.id === DEFAULT_CATEGORY_ID ? (
          <p className="mt-5 rounded-control border border-warning-muted bg-warning-soft px-4 py-3 text-sm leading-6 text-warning-strong">
            {t("rulesBNote")}
          </p>
        ) : null}

        <Link
          href={`/subjectpicker?category=${active.id}`}
          className={`mt-6 min-h-12 w-full py-3 text-center sm:w-fit ${LANDING.ctaPrimary}`}
        >
          {t("rulesCta", { name: active.name })}
          <LandingIcon name="arrow" className="h-5 w-5" />
        </Link>
      </div>

      {/* full table */}
      <div className={`self-start overflow-hidden ${LANDING.card}`}>
        <table className="w-full text-left text-xs sm:text-sm">
          <caption className="sr-only">{t("rulesTableCaption")}</caption>
          <thead className="bg-surface-muted text-xs font-semibold text-fg-subtle">
            <tr>
              <th scope="col" className="py-3 pl-3 pr-2 align-bottom sm:px-4">
                {t("rulesCategory")}
              </th>
              <th scope="col" className="px-2 py-3 text-right align-bottom sm:px-3">
                {t("rulesQuestions")}
              </th>
              <th scope="col" className="hidden px-2 py-3 sm:table-cell text-right align-bottom sm:px-3">
                {t("rulesPass")}
              </th>
              <th scope="col" className="py-3 pl-2 pr-3 text-right align-bottom sm:px-4">
                {t("rulesMistakes")}
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const on = row.id === active.id;
              return (
                <tr
                  key={row.id}
                  onClick={() => setActiveId(row.id)}
                  className={`cursor-pointer border-t border-line-subtle tabular-nums transition ${
                    on ? "bg-accent-soft" : "hover:bg-surface-muted"
                  }`}
                >
                  <th
                    scope="row"
                    className={`py-2.5 pl-3 pr-2 font-semibold sm:px-4 ${on ? "text-accent" : "text-fg"}`}
                  >
                    {row.name}
                  </th>
                  <td className="px-2 py-2.5 text-right text-fg-muted sm:px-3">{row.total}</td>
                  <td className="hidden px-2 py-2.5 text-right text-fg-muted sm:table-cell sm:px-3">{row.pass}</td>
                  <td className="py-2.5 pl-2 pr-3 text-right font-semibold text-success-strong sm:px-4">
                    {row.mistakes}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
