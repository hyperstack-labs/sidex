"use client";

import { useState, useEffect } from "react";

const STORAGE_KEY = "sidex_data_mode";

/**
 * Hook to manage and toggle between Simulated Mock Mode and Live On-Chain Mode.
 * Defaults to the value set in NEXT_PUBLIC_USE_MOCK_DATA.
 *
 * @returns Mode state and toggle handler.
 */
export function useEnvMode() {
  const envDefault = process.env.NEXT_PUBLIC_USE_MOCK_DATA !== "false";
  const [isMockMode, setIsMockMode] = useState<boolean>(envDefault);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved !== null) {
        setIsMockMode(saved === "mock");
      } else {
        setIsMockMode(envDefault);
      }
    } catch {
      setIsMockMode(envDefault);
    }
    setIsInitialized(true);
  }, [envDefault]);

  const setMode = (mode: "mock" | "live") => {
    const isMock = mode === "mock";
    setIsMockMode(isMock);
    try {
      localStorage.setItem(STORAGE_KEY, mode);
    } catch {}
  };

  const toggleMode = () => {
    setMode(isMockMode ? "live" : "mock");
  };

  return {
    isMockMode,
    isInitialized,
    mode: isMockMode ? ("mock" as const) : ("live" as const),
    setMode,
    toggleMode,
  };
}
