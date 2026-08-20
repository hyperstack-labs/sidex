"use client";

import { useState } from "react";
import { Check, Copy, ExternalLink, RotateCcw } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useAccount, useDisconnect } from "wagmi";
import { toast } from "sonner";

import { useEnvMode } from "@/lib/hooks/use-env-mode";

const CURRENCIES = [
  { code: "USD", name: "US Dollar", symbol: "$" },
  { code: "SAR", name: "Saudi Riyal", symbol: "﷼" },
  { code: "AED", name: "UAE Dirham", symbol: "د.إ" },
  { code: "QAR", name: "Qatari Riyal", symbol: "ر.ق" },
  { code: "KWD", name: "Kuwaiti Dinar", symbol: "د.ك" },
  { code: "BHD", name: "Bahraini Dinar", symbol: "ب.د" },
  { code: "OMR", name: "Omani Rial", symbol: "ر.ع" },
  { code: "EUR", name: "Euro", symbol: "€" },
  { code: "GBP", name: "British Pound", symbol: "£" },
  { code: "MYR", name: "Malaysian Ringgit", symbol: "RM" },
  { code: "IDR", name: "Indonesian Rupiah", symbol: "Rp" },
];

/**
 * Clean, Flat, Full-Width Settings Interface for SidEx.
 * - Zero box-in-a-box container clutter
 * - Zero protocol/legal buzzwords
 * - 2-column wide layout across full width
 */
export function SettingsPage() {
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const { mode, setMode } = useEnvMode();

  const [currency, setCurrency] = useState<string>(() => {
    if (typeof window === "undefined") return "USD";
    try {
      return localStorage.getItem("sidex_currency") || "USD";
    } catch {
      return "USD";
    }
  });

  const [nisabBenchmark, setNisabBenchmark] = useState<"gold" | "silver">(() => {
    if (typeof window === "undefined") return "gold";
    try {
      const saved = localStorage.getItem("sidex_nisab_benchmark");
      return saved === "gold" || saved === "silver" ? saved : "gold";
    } catch {
      return "gold";
    }
  });

  const [isSolarCalendar, setIsSolarCalendar] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    try {
      return localStorage.getItem("sidex_solar_calendar") === "true";
    } catch {
      return false;
    }
  });

  const [copied, setCopied] = useState(false);

  const handleCurrencyChange = (newCurrency: string) => {
    setCurrency(newCurrency);
    try {
      localStorage.setItem("sidex_currency", newCurrency);
      toast.success(`Currency set to ${newCurrency}`);
    } catch {}
  };

  const handleBenchmarkChange = (newBenchmark: "gold" | "silver") => {
    setNisabBenchmark(newBenchmark);
    try {
      localStorage.setItem("sidex_nisab_benchmark", newBenchmark);
      toast.success(`Nisab set to ${newBenchmark === "gold" ? "Gold (85g)" : "Silver (595g)"}`);
    } catch {}
  };

  const handleSolarChange = (checked: boolean) => {
    setIsSolarCalendar(checked);
    try {
      localStorage.setItem("sidex_solar_calendar", String(checked));
      toast.success(
        checked ? "Zakat adjusted to 2.577% (Solar Year)" : "Zakat set to 2.5% (Lunar Year)"
      );
    } catch {}
  };

  const copyAddress = () => {
    if (!address) return;
    navigator.clipboard.writeText(address);
    setCopied(true);
    toast.success("Address copied");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full space-y-10 pb-20 pt-2">
      {/* Clean Header */}
      <div className="space-y-1">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white font-mono">
          Settings
        </h1>
        <p className="text-xs sm:text-sm text-zinc-400 font-mono">
          Manage currency, calculation standards, and account preferences.
        </p>
      </div>

      {/* Flat Editorial 2-Column Settings Rows (No Container Boxes) */}
      <div className="divide-y divide-white/5 border-y border-white/5">
        {/* 1. Display Currency */}
        <div className="grid grid-cols-1 md:grid-cols-[1fr_360px] gap-4 md:gap-8 py-7 items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-white">Display Currency</h3>
            <p className="text-xs text-zinc-400 font-mono mt-0.5">
              Select your currency for real-time asset balance estimates.
            </p>
          </div>
          <div>
            <Select value={currency} onValueChange={handleCurrencyChange}>
              <SelectTrigger className="w-full bg-zinc-900/60 border-white/10 text-white text-xs font-mono h-11 rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-zinc-950 border-white/10 text-zinc-200">
                {CURRENCIES.map((c) => (
                  <SelectItem key={c.code} value={c.code} className="text-xs font-mono">
                    <span className="text-zinc-500 mr-2">{c.symbol}</span>
                    {c.name} ({c.code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* 2. Zakat Nisab Standard */}
        <div className="grid grid-cols-1 md:grid-cols-[1fr_360px] gap-4 md:gap-8 py-7 items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-white">Zakat Nisab Standard</h3>
            <p className="text-xs text-zinc-400 font-mono mt-0.5">
              Choose Gold (85g) or Silver (595g) benchmark for threshold calculation.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleBenchmarkChange("gold")}
              className={`h-11 rounded-xl border text-xs font-mono font-medium transition-colors cursor-pointer ${
                nisabBenchmark === "gold"
                  ? "border-[#01AACA] bg-[#01AACA]/10 text-white"
                  : "border-white/10 bg-zinc-900/40 text-zinc-400 hover:text-white"
              }`}
            >
              Gold (85g)
            </button>
            <button
              type="button"
              onClick={() => handleBenchmarkChange("silver")}
              className={`h-11 rounded-xl border text-xs font-mono font-medium transition-colors cursor-pointer ${
                nisabBenchmark === "silver"
                  ? "border-[#01AACA] bg-[#01AACA]/10 text-white"
                  : "border-white/10 bg-zinc-900/40 text-zinc-400 hover:text-white"
              }`}
            >
              Silver (595g)
            </button>
          </div>
        </div>

        {/* 3. Solar Calendar Adjustment */}
        <div className="grid grid-cols-1 md:grid-cols-[1fr_360px] gap-4 md:gap-8 py-7 items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-white">Solar Calendar Adjustment</h3>
            <p className="text-xs text-zinc-400 font-mono mt-0.5">
              Calculates 2.577% for 365-day Gregorian fiscal years instead of 2.5% lunar Hawl.
            </p>
          </div>
          <div className="flex justify-start md:justify-end">
            <Switch checked={isSolarCalendar} onCheckedChange={handleSolarChange} />
          </div>
        </div>

        {/* 4. Network Details */}
        <div className="grid grid-cols-1 md:grid-cols-[1fr_360px] gap-4 md:gap-8 py-7 items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-white">Network & Node</h3>
            <p className="text-xs text-zinc-400 font-mono mt-0.5">
              Connected to Sidra Chain L1 (Chain ID: 97453).
            </p>
          </div>
          <div className="flex items-center justify-between text-xs font-mono bg-zinc-900/40 border border-white/10 rounded-xl px-4 py-3">
            <span className="text-zinc-400">node.sidrachain.com</span>
            <a
              href="https://ledger.sidrachain.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#01AACA] hover:underline flex items-center gap-1 font-medium"
            >
              <span>Explorer</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        {/* 5. Environment & Data Mode */}
        <div className="grid grid-cols-1 md:grid-cols-[1fr_360px] gap-4 md:gap-8 py-7 items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-white">Environment & Data Mode</h3>
            <p className="text-xs text-zinc-400 font-mono mt-0.5">
              Switch between simulated demo balances and live on-chain Sidra Chain execution.
            </p>
          </div>
          <div className="flex items-center gap-1.5 bg-zinc-900/60 p-1 rounded-xl border border-white/10 w-fit md:ml-auto">
            <button
              type="button"
              onClick={() => {
                setMode("mock");
                toast.success("Switched to Demo Mode");
              }}
              className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                mode === "mock"
                  ? "bg-[#01AACA] text-zinc-950 shadow-sm font-bold"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              Demo Mode
            </button>
            <button
              type="button"
              onClick={() => {
                setMode("live");
                toast.success("Switched to Live Mode (Sidra Chain)");
              }}
              className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                mode === "live"
                  ? "bg-emerald-500 text-zinc-950 shadow-sm font-bold"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              Live (Sidra Chain)
            </button>
          </div>
        </div>

        {/* 6. Connected Account & Session */}
        {isConnected && address && (
          <div className="grid grid-cols-1 md:grid-cols-[1fr_360px] gap-4 md:gap-8 py-7 items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-white">Connected Account</h3>
              <p className="text-xs text-zinc-400 font-mono mt-0.5">
                Active wallet address and session management.
              </p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-900/40 border border-white/10 text-xs font-mono">
                <span className="text-zinc-200 truncate max-w-[200px]">{address}</span>
                <button
                  type="button"
                  onClick={copyAddress}
                  className="text-zinc-400 hover:text-white p-1 transition-colors cursor-pointer"
                  title="Copy address"
                >
                  {copied ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>

              <button
                type="button"
                onClick={() => disconnect()}
                className="w-full flex items-center justify-center gap-1.5 py-2 text-xs font-mono text-red-400 hover:text-red-300 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Disconnect Wallet</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
