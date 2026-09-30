"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/** Per-device best score kept in localStorage. `lowerIsBetter` for move/time based games. */
export function useBest(key: string, lowerIsBetter = false) {
  const storageKey = `rl_best_${key}`;
  const [best, setBest] = useState<number | null>(null);
  const bestRef = useRef<number | null>(null);

  useEffect(() => {
    try {
      const v = localStorage.getItem(storageKey);
      if (v !== null) {
        bestRef.current = Number(v);
        setBest(Number(v));
      }
    } catch {}
  }, [storageKey]);

  /** Records a finished game's score; returns true if it's a new best. */
  const submit = useCallback(
    (score: number) => {
      const prev = bestRef.current;
      const isNew = prev === null || (lowerIsBetter ? score < prev : score > prev);
      if (isNew) {
        bestRef.current = score;
        setBest(score);
        try {
          localStorage.setItem(storageKey, String(score));
        } catch {}
      }
      return isNew;
    },
    [storageKey, lowerIsBetter],
  );

  return { best, submit };
}
