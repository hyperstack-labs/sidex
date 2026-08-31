"use client";

import { useSyncExternalStore, useCallback } from "react";

const STORAGE_KEY = "sidex_data_mode";

function getSnapshot(): "mock" | "live" {
  if (typeof window === "undefined") {
    return process.env.NEXT_PUBLIC_USE_MOCK_DATA !== "false" ? "mock" : "live";
  }
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === "mock" || saved === "live") return saved;
  } catch {}
  return process.env.NEXT_PUBLIC_USE_MOCK_DATA !== "false" ? "mock" : "live";
}

function getServerSnapshot(): "mock" | "live" {
  return process.env.NEXT_PUBLIC_USE_MOCK_DATA !== "false" ? "mock" : "live";
}

function subscribe(callback: () => void) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener("storage", callback);
  window.addEventListener("sidex_mode_change", callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener("sidex_mode_change", callback);
  };
}

/**
 * Hook to manage and toggle between Demo Mode and Live On-Chain Mode.
 * Uses useSyncExternalStore for clean SSR hydration and reactive cross-tab updates.
 *
 * @returns Mode state and toggle handler.
 */
export function useEnvMode() {
  const mode = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const isMockMode = mode === "mock";

  const setMode = useCallback((newMode: "mock" | "live") => {
    try {
      localStorage.setItem(STORAGE_KEY, newMode);
      window.dispatchEvent(new Event("sidex_mode_change"));
    } catch {}
  }, []);

  const toggleMode = useCallback(() => {
    setMode(isMockMode ? "live" : "mock");
  }, [isMockMode, setMode]);

  return {
    isMockMode,
    isInitialized: true,
    mode,
    setMode,
    toggleMode,
  };
}
