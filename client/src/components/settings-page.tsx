"use client";

import { useState, useEffect } from "react";
import { motion } from "motion/react";
import {
  Globe,
  Calculator,
  Server,
  Wallet,
  Check,
  Copy,
  ExternalLink,
  ShieldCheck,
  RotateCcw,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
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

const CURRENCIES = [
  { code: "SAR", name: "Saudi Riyal", symbol: "﷼" },
  { code: "AED", name: "UAE Dirham", symbol: "د.إ" },
  { code: "QAR", name: "Qatari Riyal", symbol: "ر.ق" },
  { code: "KWD", name: "Kuwaiti Dinar", symbol: "د.ك" },
  { code: "BHD", name: "Bahraini Dinar", symbol: "ب.د" },
  { code: "OMR", name: "Omani Rial", symbol: "ر.ع" },
  { code: "USD", name: "US Dollar", symbol: "$" },
  { code: "EUR", name: "Euro", symbol: "€" },
  { code: "GBP", name: "British Pound", symbol: "£" },
  { code: "MYR", name: "Malaysian Ringgit", symbol: "RM" },
  { code: "IDR", name: "Indonesian Rupiah", symbol: "Rp" },
];

/**
 * Institutional Settings and Configuration Panel.
 * Handles client-side persistent preferences for regional fiat currencies,
 * AAOIFI Zakat calculation benchmarks, and SidraChain RPC diagnostics.
 *
 * @returns Settings configuration view.
 */
export function SettingsPage() {
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();

  const [currency, setCurrency] = useState("USD");
  const [nisabBenchmark, setNisabBenchmark] = useState<"gold" | "silver">("gold");
  const [isSolarCalendar, setIsSolarCalendar] = useState(false);
  const [copied, setCopied] = useState(false);

  // Load preferences from localStorage on client mount
  useEffect(() => {
    try {
      const savedCurrency = localStorage.getItem("sidex_currency");
      if (savedCurrency) setCurrency(savedCurrency);

      const savedBenchmark = localStorage.getItem("sidex_nisab_benchmark");
      if (savedBenchmark === "gold" || savedBenchmark === "silver") {
        setNisabBenchmark(savedBenchmark);
      }

      const savedSolar = localStorage.getItem("sidex_solar_calendar");
      if (savedSolar) setIsSolarCalendar(savedSolar === "true");
    } catch {
      // Storage unavailable in SSR context
    }
  }, []);

  const handleCurrencyChange = (newCurrency: string) => {
    setCurrency(newCurrency);
    try {
      localStorage.setItem("sidex_currency", newCurrency);
      toast.success(`Display currency updated to ${newCurrency}`);
    } catch {}
  };

  const handleBenchmarkChange = (newBenchmark: "gold" | "silver") => {
    setNisabBenchmark(newBenchmark);
    try {
      localStorage.setItem("sidex_nisab_benchmark", newBenchmark);
      toast.success(`Nisab benchmark set to ${newBenchmark.toUpperCase()}`);
    } catch {}
  };

  const handleSolarChange = (checked: boolean) => {
    setIsSolarCalendar(checked);
    try {
      localStorage.setItem("sidex_solar_calendar", String(checked));
      toast.success(
        checked
          ? "Zakat rate adjusted to 2.577% (Solar Year)"
          : "Zakat rate set to 2.5% (Hijri Lunar Year)"
      );
    } catch {}
  };

  const copyAddress = () => {
    if (!address) return;
    navigator.clipboard.writeText(address);
    setCopied(true);
    toast.success("Wallet address copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 pb-12 max-w-3xl mx-auto">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-xl font-bold text-white tracking-tight">Protocol Preferences</h1>
        <p className="text-sm text-zinc-400">
          Configure regional fiat conversions, Sharia Zakat benchmarks, and network connection parameters.
        </p>
      </div>

      {/* Regional & Currency Preferences */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="border border-zinc-800 bg-zinc-950/70 shadow-sm rounded-xl">
          <CardHeader className="pb-4">
            <CardTitle className="text-sm font-semibold flex items-center gap-2 text-zinc-200">
              <Globe className="w-4 h-4 text-[#01AACA]" />
              Regional & Display Currency
            </CardTitle>
            <CardDescription className="text-xs text-zinc-400">
              Select your primary regional currency for real-time asset valuations and Nisab conversions.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-xs text-zinc-300">Default Fiat Benchmark</Label>
              <Select value={currency} onValueChange={handleCurrencyChange}>
                <SelectTrigger className="bg-zinc-900/60 border-zinc-800 text-sm h-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-zinc-800 text-zinc-200">
                  {CURRENCIES.map((c) => (
                    <SelectItem key={c.code} value={c.code}>
                      <span className="font-mono text-zinc-400 mr-2">{c.symbol}</span>
                      {c.name} ({c.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Zakat & Sharia Calculation Standards */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
        <Card className="border border-zinc-800 bg-zinc-950/70 shadow-sm rounded-xl">
          <CardHeader className="pb-4">
            <CardTitle className="text-sm font-semibold flex items-center gap-2 text-zinc-200">
              <Calculator className="w-4 h-4 text-emerald-400" />
              Zakat Calculation Engine Standards
            </CardTitle>
            <CardDescription className="text-xs text-zinc-400">
              Customize mathematical standards according to your preferred jurisprudential school (Madhhab).
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Nisab Benchmark Toggle */}
            <div className="space-y-2">
              <Label className="text-xs text-zinc-300">Nisab Threshold Benchmark</Label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => handleBenchmarkChange("gold")}
                  className={`p-3 rounded-lg border text-left transition-all ${
                    nisabBenchmark === "gold"
                      ? "border-[#01AACA] bg-[#01AACA]/10 text-white"
                      : "border-zinc-800 bg-zinc-900/40 text-zinc-400 hover:border-zinc-700"
                  }`}
                >
                  <p className="text-xs font-semibold text-zinc-200">Gold Standard (85g)</p>
                  <p className="text-[11px] text-zinc-400 mt-0.5">20 Mithqals • Classical Standard</p>
                </button>

                <button
                  type="button"
                  onClick={() => handleBenchmarkChange("silver")}
                  className={`p-3 rounded-lg border text-left transition-all ${
                    nisabBenchmark === "silver"
                      ? "border-[#01AACA] bg-[#01AACA]/10 text-white"
                      : "border-zinc-800 bg-zinc-900/40 text-zinc-400 hover:border-zinc-700"
                  }`}
                >
                  <p className="text-xs font-semibold text-zinc-200">Silver Standard (595g)</p>
                  <p className="text-[11px] text-zinc-400 mt-0.5">200 Dirhams • Conservative Standard</p>
                </button>
              </div>
            </div>

            {/* Solar vs Lunar Year Adjustment */}
            <div className="flex items-center justify-between pt-3 border-t border-zinc-800/80">
              <div className="space-y-0.5">
                <Label className="text-xs text-zinc-200">Solar (Gregorian) Calendar Adjustment</Label>
                <p className="text-[11px] text-zinc-400">
                  Calculates 2.577% rate for 365-day Gregorian fiscal years instead of 2.5% lunar Hawl.
                </p>
              </div>
              <Switch checked={isSolarCalendar} onCheckedChange={handleSolarChange} />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Network & Node Configuration */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Card className="border border-zinc-800 bg-zinc-950/70 shadow-sm rounded-xl">
          <CardHeader className="pb-4">
            <CardTitle className="text-sm font-semibold flex items-center gap-2 text-zinc-200">
              <Server className="w-4 h-4 text-zinc-400" />
              Network & Node Status
            </CardTitle>
            <CardDescription className="text-xs text-zinc-400">
              Active SidraChain EVM connection parameters.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-xs">
            <div className="flex justify-between py-2 border-b border-zinc-800/80">
              <span className="text-zinc-400">Chain Network</span>
              <span className="font-mono font-medium text-zinc-200">SidraChain (ID: 97453)</span>
            </div>

            <div className="flex justify-between py-2 border-b border-zinc-800/80">
              <span className="text-zinc-400">Active RPC Endpoint</span>
              <span className="font-mono text-zinc-300">https://node.sidrachain.com</span>
            </div>

            <div className="flex justify-between py-2 border-b border-zinc-800/80">
              <span className="text-zinc-400">Block Explorer</span>
              <a
                href="https://ledger.sidrachain.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#01AACA] hover:underline flex items-center gap-1"
              >
                <span>ledger.sidrachain.com</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div className="flex justify-between py-2">
              <span className="text-zinc-400">Protocol Governance</span>
              <span className="flex items-center gap-1 text-emerald-400 font-medium">
                <ShieldCheck className="w-3.5 h-3.5" />
                AAOIFI Standard Verified
              </span>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Wallet Session */}
      {isConnected && address && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <Card className="border border-zinc-800 bg-zinc-950/70 shadow-sm rounded-xl">
            <CardHeader className="pb-4">
              <CardTitle className="text-sm font-semibold flex items-center gap-2 text-zinc-200">
                <Wallet className="w-4 h-4 text-zinc-400" />
                Connected Wallet Session
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-zinc-900/60 border border-zinc-800">
                <span className="font-mono text-xs text-zinc-200 truncate max-w-xs">{address}</span>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={copyAddress}
                    className="h-8 px-2 text-xs text-zinc-400 hover:text-white"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </Button>
                  <a
                    href={`https://ledger.sidrachain.com/address/${address}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 text-zinc-400 hover:text-white"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              <div className="pt-1 flex justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => disconnect()}
                  className="border-red-500/30 text-red-400 hover:bg-red-500/10 text-xs h-8"
                >
                  <RotateCcw className="w-3 h-3 mr-1.5" />
                  Disconnect Session
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
