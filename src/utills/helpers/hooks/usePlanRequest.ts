"use client";

import { useCallback, useEffect, useState } from "react";

type Result<T> = { key: string; data: T | null; error: unknown };

/**
 * One GET for the study plan screens, re-run whenever `key` changes. While
 * the result for the current key hasn't arrived, `loading` is true (no
 * synchronous setState in the effect). `key: null` skips the request.
 */
export function usePlanRequest<T>(
  key: string | null,
  fetcher: () => Promise<T>,
) {
  const [attempt, setAttempt] = useState(0);
  const [result, setResult] = useState<Result<T> | null>(null);
  const fullKey = key == null ? null : `${key}#${attempt}`;

  useEffect(() => {
    if (fullKey == null) return;
    let cancelled = false;
    fetcher().then(
      (data) => !cancelled && setResult({ key: fullKey, data, error: null }),
      (error: unknown) =>
        !cancelled && setResult({ key: fullKey, data: null, error }),
    );
    return () => {
      cancelled = true;
    };
    // `fetcher` is rebuilt every render; `fullKey` carries its inputs.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fullKey]);

  const current = result && result.key === fullKey ? result : null;
  const retry = useCallback(() => setAttempt((n) => n + 1), []);
  return {
    data: current?.data ?? null,
    error: current?.error ?? null,
    loading: fullKey != null && !current,
    retry,
  };
}
