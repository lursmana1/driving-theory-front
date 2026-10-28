"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocale } from "next-intl";
import { getTrainerSession } from "@/api/trainer";
import { isAuthError } from "@/api/userStats";
import type { PracticeAnswerResponse } from "@/api/practiceAnswers";
import { usePracticeAnswers } from "@/utills/helpers/hooks/usePracticeAnswers";
import type { TrainerSessionItem, TrainerSummary } from "@/lib/types/trainer";

import { TRAINER_BATCH_SIZE } from "@/CONSTS/trainer";
import { AUTO_ADVANCE_DELAY_MS } from "@/CONSTS/QuizExamConstats";

type SessionStatus = "loading" | "ready" | "error";

export type TrainerResult = {
  /** Progress before the answer, as the session delivered it. */
  before: TrainerSessionItem["progress"];
  response: PracticeAnswerResponse;
};

export type TrainerSessionTotals = {
  answered: number;
  correct: number;
  cleared: number;
  /** Questions left without an answer when the session was ended early. */
  skipped: number;
};

/** One dot in the progress strip. */
export type TrainerAnswerState = "correct" | "wrong" | "saving" | "open";

function withoutKey<T>(record: Record<string, T>, key: string) {
  if (!(key in record)) return record;
  const rest = { ...record };
  delete rest[key];
  return rest;
}

/** Counts after one answer: the API moves the question, the badges follow. */
function applyResult(
  summary: TrainerSummary,
  before: TrainerSessionItem["progress"],
  after: PracticeAnswerResponse["progress"],
): TrainerSummary {
  if (!after) return summary;
  return {
    ...summary,
    dueNow: Math.max(0, summary.dueNow + Number(after.due) - Number(before.due)),
    activeMistakes: Math.max(
      0,
      summary.activeMistakes +
        Number(after.status === "mistake") -
        Number(before.status === "mistake"),
    ),
    clearedRecently:
      summary.clearedRecently + Number(after.status === "cleared"),
  };
}

/**
 * One trainer batch: loads the due mistakes, walks them one at a time and
 * keeps each answer's server response (the review schedule lives on the API).
 * Mistakes that are not due yet are left out: answering them early does not
 * move them along.
 */
export function useTrainerSession(
  categoryId: number,
  subjects: number[],
  enabled: boolean,
) {
  const locale = useLocale();
  const { recordAnswer } = usePracticeAnswers();
  const subjectsKey = subjects.join(",");
  const [status, setStatus] = useState<SessionStatus>("loading");
  const [items, setItems] = useState<TrainerSessionItem[]>([]);
  const [summary, setSummary] = useState<TrainerSummary | null>(null);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [results, setResults] = useState<Record<string, TrainerResult>>({});
  /** Answers whose save failed; the page offers a retry. */
  const [failed, setFailed] = useState<Record<string, true>>({});
  const latest = useRef(0);

  /** Requests a batch; only the newest request may write state. */
  const fetchBatch = useCallback(() => {
    const request = ++latest.current;
    getTrainerSession(categoryId, locale, {
      subjects: subjectsKey ? subjectsKey.split(",").map(Number) : [],
      limit: TRAINER_BATCH_SIZE,
    })
      .then((session) => {
        if (request !== latest.current) return;
        setItems(session.data.filter((item) => item.progress.due));
        setSummary(session.summary);
        setIndex(0);
        setAnswers({});
        setResults({});
        setFailed({});
        setStatus("ready");
      })
      .catch((err: unknown) => {
        // A 401 is handled globally (BaseApi signs out and opens /auth).
        if (request !== latest.current || isAuthError(err)) return;
        setStatus("error");
      });
  }, [categoryId, locale, subjectsKey]);

  useEffect(() => {
    if (!enabled) return;
    fetchBatch();
    return () => {
      // Drop the reply of a request made with stale params.
      latest.current += 1;
    };
  }, [enabled, fetchBatch]);

  const reload = useCallback(() => {
    setStatus("loading");
    fetchBatch();
  }, [fetchBatch]);

  const current = items[index] ?? null;

  const select = useCallback((questionId: string, key: string) => {
    setAnswers((prev) =>
      prev[questionId] ? prev : { ...prev, [questionId]: key },
    );
  }, []);

  const record = useCallback(
    (item: TrainerSessionItem, response: PracticeAnswerResponse) => {
      const id = String(item.question.id);
      setResults((prev) => ({
        ...prev,
        [id]: { before: item.progress, response },
      }));
      setFailed((prev) => withoutKey(prev, id));
      setSummary((prev) =>
        prev ? applyResult(prev, item.progress, response.progress) : prev,
      );
    },
    [],
  );

  const markFailed = useCallback((item: TrainerSessionItem) => {
    setFailed((prev) => ({ ...prev, [String(item.question.id)]: true }));
  }, []);

  /** Re-sends an answer whose save failed. */
  const retry = useCallback(
    (item: TrainerSessionItem) => {
      const id = String(item.question.id);
      const choice = answers[id];
      if (!choice) return;
      setFailed((prev) => withoutKey(prev, id));
      void recordAnswer(Number(item.question.id), choice, (response) =>
        record(item, response),
      ).then((ok) => {
        if (!ok) markFailed(item);
      });
    },
    [answers, recordAnswer, record, markFailed],
  );

  const last = items.length - 1;
  /** Arrows browse the batch; they never end it, and never reopen it once ended. */
  const next = useCallback(
    () => setIndex((i) => (i >= last ? i : i + 1)),
    [last],
  );
  const prev = useCallback(
    () => setIndex((i) => (i > last ? i : Math.max(0, i - 1))),
    [last],
  );
  /** Progress dots: always a valid index. */
  const goTo = setIndex;

  const isAnswered = useCallback(
    (i: number) => !!items[i] && !!answers[String(items[i].question.id)],
    [items, answers],
  );
  const unanswered = items.filter((_, i) => !isAnswered(i)).length;

  /**
   * After an answer: the next unanswered question (wrapping to the start),
   * or the end screen once everything is answered.
   */
  const advance = useCallback(() => {
    setIndex((from) => {
      for (let step = 1; step <= items.length; step++) {
        const i = (from + step) % items.length;
        if (!isAnswered(i)) return i;
      }
      return items.length;
    });
  }, [items.length, isAnswered]);

  /** Ends the batch now, even with questions left. */
  const finish = useCallback(() => setIndex(items.length), [items.length]);

  // Every answer saved (or failed) -> end screen, whatever the auto-next setting.
  const settled =
    items.length > 0 &&
    items.every((item) => {
      const id = String(item.question.id);
      return id in results || id in failed;
    });
  useEffect(() => {
    if (!settled) return;
    const timer = setTimeout(finish, AUTO_ADVANCE_DELAY_MS);
    return () => clearTimeout(timer);
  }, [settled, finish]);

  const answerState = useCallback(
    (i: number): TrainerAnswerState => {
      const id = items[i] ? String(items[i].question.id) : "";
      const result = results[id];
      if (result) return result.response.correct ? "correct" : "wrong";
      return answers[id] ? "saving" : "open";
    },
    [items, results, answers],
  );

  const totals = useMemo<TrainerSessionTotals>(() => {
    const list = Object.values(results);
    return {
      answered: list.length,
      correct: list.filter((r) => r.response.correct === true).length,
      cleared: list.filter((r) => r.response.progress?.status === "cleared")
        .length,
      skipped: unanswered,
    };
  }, [results, unanswered]);

  return {
    status,
    items,
    summary,
    index,
    current,
    finished: status === "ready" && items.length > 0 && index >= items.length,
    inProgress: status === "ready" && index < items.length,
    answers,
    results,
    failed,
    totals,
    select,
    record,
    markFailed,
    retry,
    next,
    prev,
    goTo,
    advance,
    finish,
    unanswered,
    answerState,
    reload,
  };
}
