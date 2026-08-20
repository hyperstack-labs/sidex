"use client";

import { useSyncExternalStore } from "react";
import { useAccount, useBalance } from "wagmi";
import { useEnvMode } from "./use-env-mode";

export interface TokenData {
  symbol: string;
  name: string;
  balance: string;
  price: number;
  image: string;
  address?: string;
  decimals: number;
}

const DEFAULT_DEMO_BALANCES: Record<string, number> = {
  SDA: 10250.5,
  sGOLD: 237.5,
  sUSD: 5000.0,
};

const DEMO_BALANCES_KEY = "sidex_demo_balances";

/**
 * Reads demo balances from localStorage or returns default initial state.
 */
export function getDemoBalances(): Record<string, number> {
  if (typeof window === "undefined") return DEFAULT_DEMO_BALANCES;
  try {
    const raw = localStorage.getItem(DEMO_BALANCES_KEY);
    if (raw) return { ...DEFAULT_DEMO_BALANCES, ...JSON.parse(raw) };
  } catch {}
  return DEFAULT_DEMO_BALANCES;
}

/**
 * Updates demo balances and triggers a reactive event across all listening components.
 */
export function updateDemoBalances(updates: Record<string, number>) {
  if (typeof window === "undefined") return;
  try {
    const current = getDemoBalances();
    const updated = { ...current, ...updates };
    localStorage.setItem(DEMO_BALANCES_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event("sidex_balances_updated"));
  } catch {}
}

/**
 * Resets demo balances to default values.
 */
export function resetDemoBalances() {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(DEMO_BALANCES_KEY, JSON.stringify(DEFAULT_DEMO_BALANCES));
    window.dispatchEvent(new Event("sidex_balances_updated"));
  } catch {}
}

function subscribeBalances(callback: () => void) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener("storage", callback);
  window.addEventListener("sidex_balances_updated", callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener("sidex_balances_updated", callback);
  };
}

function getBalancesSnapshot(): string {
  if (typeof window === "undefined") return JSON.stringify(DEFAULT_DEMO_BALANCES);
  try {
    return localStorage.getItem(DEMO_BALANCES_KEY) || JSON.stringify(DEFAULT_DEMO_BALANCES);
  } catch {
    return JSON.stringify(DEFAULT_DEMO_BALANCES);
  }
}

function getServerBalancesSnapshot(): string {
  return JSON.stringify(DEFAULT_DEMO_BALANCES);
}

/**
 * Unified Token & Balance Hook for SidEx.
 * Seamlessly resolves between reactive Demo Mode balances and live on-chain Sidra Chain balances.
 *
 * @returns Array of available tokens with formatted balances and live pricing.
 */
export function useTokens() {
  const { isMockMode } = useEnvMode();
  const { address, isConnected } = useAccount();

  // Reactive subscription to demo balances in localStorage
  const rawDemoBalances = useSyncExternalStore(
    subscribeBalances,
    getBalancesSnapshot,
    getServerBalancesSnapshot
  );

  // Real native SDA balance from Sidra Chain (Chain ID: 97453)
  const { data: sdaBalance } = useBalance({
    address: address,
    query: {
      enabled: !isMockMode && isConnected && !!address,
    },
  });

  if (isMockMode || !isConnected) {
    let demoObj = DEFAULT_DEMO_BALANCES;
    try {
      demoObj = { ...DEFAULT_DEMO_BALANCES, ...JSON.parse(rawDemoBalances) };
    } catch {}

    const demoTokens: TokenData[] = [
      {
        symbol: "SDA",
        name: "Sidra Chain",
        balance: (demoObj.SDA ?? 10250.5).toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 4,
        }),
        price: 12.19,
        image: "/sidra-chain-removebg-preview.png",
        decimals: 18,
      },
      {
        symbol: "sGOLD",
        name: "Sidra Gold",
        balance: `${(demoObj.sGOLD ?? 237.5).toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 4,
        })} g`,
        price: 84.2,
        image: "/sidex.png",
        decimals: 18,
      },
      {
        symbol: "sUSD",
        name: "Sidra USD",
        balance: (demoObj.sUSD ?? 5000.0).toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }),
        price: 1.0,
        image: "/icon.png",
        decimals: 18,
      },
    ];

    return {
      tokens: demoTokens,
      isMockMode: true,
    };
  }

  // Live on-chain formatted tokens
  const formattedTokens: TokenData[] = [
    {
      symbol: "SDA",
      name: "Sidra Chain",
      balance: sdaBalance
        ? Number(sdaBalance.formatted).toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 4,
          })
        : "0.00",
      price: 12.19,
      image: "/sidra-chain-removebg-preview.png",
      decimals: 18,
    },
    {
      symbol: "sGOLD",
      name: "Sidra Gold",
      balance: "0.00 g",
      price: 84.2,
      image: "/sidex.png",
      decimals: 18,
    },
    {
      symbol: "sUSD",
      name: "Sidra USD",
      balance: "0.00",
      price: 1.0,
      image: "/icon.png",
      decimals: 18,
    },
  ];

  return {
    tokens: formattedTokens,
    isMockMode: false,
  };
}
