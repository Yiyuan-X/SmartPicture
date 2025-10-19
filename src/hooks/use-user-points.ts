"use client";

import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "smartpicture_user_points";
const DEFAULT_POINTS = 200;

function readPointsFromStorage(): number {
  if (typeof window === "undefined") return DEFAULT_POINTS;
  const stored = window.localStorage.getItem(STORAGE_KEY);
  const parsed = stored ? Number.parseInt(stored, 10) : Number.NaN;
  if (Number.isFinite(parsed) && parsed >= 0) {
    return parsed;
  }
  return DEFAULT_POINTS;
}

function writePointsToStorage(value: number) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, String(value));
}

export function useUserPoints() {
  const [points, setPoints] = useState<number | null>(null);

  useEffect(() => {
    const value = readPointsFromStorage();
    setPoints(value);
  }, []);

  const updatePoints = useCallback((next: number) => {
    setPoints(next);
    writePointsToStorage(next);
  }, []);

  const addPoints = useCallback((amount: number) => {
    setPoints((current) => {
      const base = current ?? DEFAULT_POINTS;
      const next = base + amount;
      writePointsToStorage(next);
      return next;
    });
  }, []);

  const deductPoints = useCallback(
    (amount: number) => {
      let succeeded = false;
      setPoints((current) => {
        const base = current ?? DEFAULT_POINTS;
        if (base < amount) {
          succeeded = false;
          return base;
        }
        const next = base - amount;
        writePointsToStorage(next);
        succeeded = true;
        return next;
      });
      return succeeded;
    },
    []
  );

  const refresh = useCallback(() => {
    const value = readPointsFromStorage();
    updatePoints(value);
  }, [updatePoints]);

  const canAfford = useCallback(
    (cost: number) => {
      const base = points ?? DEFAULT_POINTS;
      return base >= cost;
    },
    [points]
  );

  return {
    points,
    isReady: points !== null,
    addPoints,
    deductPoints,
    refresh,
    canAfford,
  };
}
