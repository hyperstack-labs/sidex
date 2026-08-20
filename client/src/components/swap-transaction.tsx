"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ArrowLeftRight,
  CheckCircle,
  Loader2,
  ChevronDown,
  ExternalLink,
} from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface SwapTransactionProps {
  onBack: () => void;
}

interface TokenData {
  symbol: string;
  name: string;
  balance: string;
  price: number;
  image: string;
}

const availableTokens: TokenData[] = [
  {
    symbol: "SDA",
    name: "Sidra Chain",
    balance: "10,250.50",
    price: 12.19,
    image: "/sidra-chain-removebg-preview.png",
  },
  {
    symbol: "sGOLD",
    name: "Sidra Gold",
    balance: "237.50 g",
    price: 84.20,
    image: "/sidex.png",
  },
  {
    symbol: "sUSD",
    name: "Sidra USD",
    balance: "5,000.00",
    price: 1.00,
    image: "/icon.png",
  },
];

/**
 * Centered Left-and-Right Horizontal Swap Interface for SidEx.
 * - Left: YOU PAY (Large Scale)
 * - Center: Pure White Switch Icon (Zero Container Box)
 * - Right: YOU RECEIVE (Large Scale)
 * - Zero redundant horizontal lines
 * - Zero box-in-a-box nesting
 */
export function SwapTransaction({ onBack }: SwapTransactionProps) {
  const [fromToken, setFromToken] = useState<TokenData>(availableTokens[0]);
  const [toToken, setToToken] = useState<TokenData>(availableTokens[1]);
  const [fromAmount, setFromAmount] = useState<string>("");
  const [toAmount, setToAmount] = useState<string>("");
  const [isTokenSelectorOpen, setIsTokenSelectorOpen] = useState<"from" | "to" | null>(null);
  const [isConfirming, setIsConfirming] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  const handleFromAmountChange = (value: string) => {
    if (/^\d*\.?\d*$/.test(value)) {
      setFromAmount(value);
      if (value && parseFloat(value) > 0) {
        const calculated = (parseFloat(value) * fromToken.price) / toToken.price;
        setToAmount(calculated.toFixed(6));
      } else {
        setToAmount("");
      }
    }
  };

  const handlePercentClick = (percent: number) => {
    const numBalance = parseFloat(fromToken.balance.replace(/,/g, ""));
    const calculated = (numBalance * percent).toFixed(4);
    handleFromAmountChange(calculated);
  };

  const handleFlipTokens = () => {
    const prevFrom = fromToken;
    const prevTo = toToken;
    setFromToken(prevTo);
    setToToken(prevFrom);
    if (toAmount) {
      setFromAmount(toAmount);
      const calculated = (parseFloat(toAmount) * prevTo.price) / prevFrom.price;
      setToAmount(calculated.toFixed(6));
    }
  };

  const handleExecuteSwap = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setIsComplete(true);
      toast.success("Swap Executed", {
        description: `Swapped ${fromAmount} ${fromToken.symbol} for ${toAmount} ${toToken.symbol}`,
      });
    }, 1600);
  };

  const exchangeRate = (fromToken.price / toToken.price).toFixed(6);
  const fromUsd = fromAmount ? (parseFloat(fromAmount) * fromToken.price).toFixed(2) : "0.00";
  const toUsd = toAmount ? (parseFloat(toAmount) * toToken.price).toFixed(2) : "0.00";

  // Complete Screen
  if (isComplete) {
    return (
      <div className="w-full max-w-lg mx-auto my-auto py-16 space-y-6 text-center">
        <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto text-emerald-400">
          <CheckCircle className="w-7 h-7" />
        </div>

        <div className="space-y-1">
          <h2 className="text-2xl font-bold text-white tracking-tight">Swap Confirmed</h2>
          <p className="text-xs font-mono text-zinc-400">
            Settled on Sidra Chain
          </p>
        </div>

        <div className="divide-y divide-white/5 text-xs font-mono text-left py-2">
          <div className="flex justify-between py-2.5">
            <span className="text-zinc-500">Paid</span>
            <span className="text-white font-medium">{fromAmount} {fromToken.symbol}</span>
          </div>
          <div className="flex justify-between py-2.5">
            <span className="text-zinc-500">Received</span>
            <span className="text-emerald-400 font-medium">{toAmount} {toToken.symbol}</span>
          </div>
          <div className="flex justify-between py-2.5">
            <span className="text-zinc-500">Gas</span>
            <span className="text-zinc-300">&lt; $0.001 (Sidra Chain)</span>
          </div>
          <div className="flex justify-between py-2.5">
            <span className="text-zinc-500">Explorer</span>
            <a
              href="https://ledger.sidrachain.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#01AACA] hover:underline flex items-center gap-1"
            >
              <span>0x9f3a...41bc</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-4">
          <Button
            onClick={() => {
              setIsComplete(false);
              setIsConfirming(false);
              setFromAmount("");
              setToAmount("");
            }}
            variant="outline"
            className="h-12 border-white/10 hover:bg-white/5 text-zinc-200 rounded-xl text-xs font-medium cursor-pointer"
          >
            New Swap
          </Button>
          <Button
            onClick={onBack}
            className="h-12 bg-[#01AACA] hover:bg-[#01AACA]/90 text-zinc-950 font-bold rounded-xl text-xs cursor-pointer"
          >
            View Dashboard
          </Button>
        </div>
      </div>
    );
  }

  // Confirmation Review Screen
  if (isConfirming) {
    return (
      <div className="w-full max-w-lg mx-auto my-auto py-12 space-y-6">
        <div className="flex items-center justify-between pb-3">
          <button
            type="button"
            onClick={() => setIsConfirming(false)}
            className="text-xs font-mono text-zinc-400 hover:text-white transition-colors cursor-pointer"
          >
            ← Back
          </button>
          <span className="text-xs font-mono text-zinc-400">Confirm Order</span>
        </div>

        <div className="space-y-4 py-2">
          <div className="flex justify-between items-baseline">
            <div>
              <p className="text-[11px] font-mono text-zinc-500 uppercase">You Pay</p>
              <p className="text-3xl font-bold font-mono text-white">{fromAmount} {fromToken.symbol}</p>
            </div>
            <p className="text-xs font-mono text-zinc-400">≈ ${fromUsd} USD</p>
          </div>

          <div className="pt-4 flex justify-between items-baseline">
            <div>
              <p className="text-[11px] font-mono text-zinc-500 uppercase">You Receive</p>
              <p className="text-3xl font-bold font-mono text-emerald-400">{toAmount} {toToken.symbol}</p>
            </div>
            <p className="text-xs font-mono text-zinc-400">≈ ${toUsd} USD</p>
          </div>
        </div>

        <div className="py-2 text-xs font-mono text-zinc-400 space-y-2">
          <div className="flex justify-between">
            <span>Rate</span>
            <span className="text-zinc-200">1 {fromToken.symbol} = {exchangeRate} {toToken.symbol}</span>
          </div>
          <div className="flex justify-between">
            <span>Slippage</span>
            <span className="text-zinc-200">0.5%</span>
          </div>
          <div className="flex justify-between">
            <span>Settlement</span>
            <span className="text-emerald-400">Instant Spot</span>
          </div>
        </div>

        <Button
          onClick={handleExecuteSwap}
          disabled={isProcessing}
          className="w-full h-12 bg-[#01AACA] hover:bg-[#01AACA]/90 text-zinc-950 font-bold text-sm rounded-xl transition-all cursor-pointer"
        >
          {isProcessing ? (
            <span className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Broadcasting to Sidra Chain...</span>
            </span>
          ) : (
            <span>Confirm & Swap</span>
          )}
        </Button>
      </div>
    );
  }

  // Centered Left-and-Right Pure Swap (Balanced Proportions & Healthy Spacing)
  return (
    <div className="w-full max-w-4xl mx-auto my-auto flex-1 flex flex-col justify-center py-12 space-y-12">
      {/* ─── Balanced Left-to-Right Flow with Sapat na Space ─── */}
      <div className="w-full grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-6 md:gap-10 items-center justify-between">
        {/* LEFT COLUMN: YOU PAY */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs font-mono text-zinc-400">
            <span className="font-semibold text-white uppercase tracking-wider text-xs">You Pay</span>
            <div className="flex items-center gap-3">
              <span className="text-zinc-500">
                Avail: <span className="text-zinc-300">{fromToken.balance}</span>
              </span>
              <div className="flex items-center gap-2 text-[11px] text-zinc-400">
                {[0.25, 0.5, 0.75, 1].map((pct) => (
                  <button
                    key={pct}
                    type="button"
                    onClick={() => handlePercentClick(pct)}
                    className="hover:text-white underline underline-offset-2 decoration-zinc-700 hover:decoration-white transition-colors cursor-pointer"
                  >
                    {pct === 1 ? "MAX" : `${pct * 100}%`}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Large Number Input */}
          <div className="flex items-center justify-between gap-4">
            <input
              type="text"
              inputMode="decimal"
              placeholder="0.00"
              value={fromAmount}
              onChange={(e) => handleFromAmountChange(e.target.value)}
              className="w-full bg-transparent text-5xl sm:text-6xl md:text-7xl font-bold font-mono text-white outline-none focus:outline-none placeholder:text-zinc-700 leading-none tracking-tight"
            />

            <button
              type="button"
              onClick={() => setIsTokenSelectorOpen(isTokenSelectorOpen === "from" ? null : "from")}
              className="flex items-center gap-2.5 px-3.5 py-2 rounded-full border border-white/15 hover:border-white/30 bg-zinc-900/80 text-white font-semibold text-sm sm:text-base shrink-0 cursor-pointer transition-colors shadow-lg"
            >
              <Image
                src={fromToken.image}
                alt={fromToken.symbol}
                width={24}
                height={24}
                className="w-6 h-6 object-contain"
              />
              <span>{fromToken.symbol}</span>
              <ChevronDown className="w-3.5 h-3.5 opacity-60" />
            </button>
          </div>

          <p className="text-xs font-mono text-zinc-400">≈ ${fromUsd} USD</p>
        </div>

        {/* CENTER: PURE WHITE SWITCH ICON (ZERO CONTAINER BOX) */}
        <div className="flex flex-col items-center justify-center py-2 md:py-0">
          <button
            type="button"
            onClick={handleFlipTokens}
            className="text-white hover:text-zinc-300 transition-transform duration-300 hover:rotate-180 cursor-pointer p-2.5 bg-transparent border-0 shadow-none outline-none"
            title="Switch Tokens"
          >
            <ArrowLeftRight className="w-7 h-7 text-white" />
          </button>
          <span className="text-[11px] font-mono text-zinc-500 pt-1.5 text-center whitespace-nowrap hidden md:block">
            1 {fromToken.symbol} ≈ {exchangeRate} {toToken.symbol}
          </span>
        </div>

        {/* RIGHT COLUMN: YOU RECEIVE */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs font-mono text-zinc-400">
            <span className="font-semibold text-white uppercase tracking-wider text-xs">You Receive</span>
            <span className="text-zinc-500">
              Balance: <span className="text-zinc-300">{toToken.balance}</span>
            </span>
          </div>

          {/* Large Number Output */}
          <div className="flex items-center justify-between gap-4">
            <input
              type="text"
              readOnly
              placeholder="0.00"
              value={toAmount}
              className="w-full bg-transparent text-5xl sm:text-6xl md:text-7xl font-bold font-mono text-emerald-400 outline-none focus:outline-none placeholder:text-zinc-700 leading-none tracking-tight cursor-default"
            />

            <button
              type="button"
              onClick={() => setIsTokenSelectorOpen(isTokenSelectorOpen === "to" ? null : "to")}
              className="flex items-center gap-2.5 px-3.5 py-2 rounded-full border border-white/15 hover:border-white/30 bg-zinc-900/80 text-white font-semibold text-sm sm:text-base shrink-0 cursor-pointer transition-colors shadow-lg"
            >
              <Image
                src={toToken.image}
                alt={toToken.symbol}
                width={24}
                height={24}
                className="w-6 h-6 object-contain"
              />
              <span>{toToken.symbol}</span>
              <ChevronDown className="w-3.5 h-3.5 opacity-60" />
            </button>
          </div>

          <p className="text-xs font-mono text-zinc-400">≈ ${toUsd} USD</p>
        </div>
      </div>

      {/* Token Selector Dropdown List */}
      <AnimatePresence>
        {isTokenSelectorOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="max-w-md mx-auto divide-y divide-white/5 border border-white/10 rounded-2xl bg-zinc-950 p-2 overflow-hidden shadow-2xl"
          >
            {availableTokens.map((t) => (
              <button
                key={t.symbol}
                type="button"
                onClick={() => {
                  if (isTokenSelectorOpen === "from") {
                    if (t.symbol === toToken.symbol) handleFlipTokens();
                    else setFromToken(t);
                  } else {
                    if (t.symbol === fromToken.symbol) handleFlipTokens();
                    else setToToken(t);
                  }
                  setIsTokenSelectorOpen(null);
                }}
                className="w-full flex items-center justify-between p-3.5 hover:bg-white/5 rounded-xl transition-colors cursor-pointer text-left"
              >
                <div className="flex items-center gap-3.5">
                  <Image
                    src={t.image}
                    alt={t.symbol}
                    width={32}
                    height={32}
                    className="w-8 h-8 object-contain"
                  />
                  <div>
                    <div className="font-semibold text-white text-base">{t.name}</div>
                    <div className="text-xs text-zinc-500 font-mono">{t.symbol} • ${t.price}</div>
                  </div>
                </div>
                <span className="text-sm font-mono text-zinc-400">{t.balance}</span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Centered Bottom CTA ─── */}
      <div className="max-w-lg mx-auto w-full pt-4 space-y-3">
        <Button
          onClick={() => setIsConfirming(true)}
          disabled={!fromAmount || parseFloat(fromAmount) <= 0}
          className={`w-full h-16 rounded-2xl font-bold text-lg tracking-wide transition-all duration-200 ${
            fromAmount && parseFloat(fromAmount) > 0
              ? "bg-[#01AACA] hover:bg-[#01AACA]/90 text-zinc-950 shadow-[0_0_35px_rgba(1,170,202,0.4)] active:scale-[0.99] cursor-pointer"
              : "bg-zinc-900 text-zinc-500 border border-white/5 cursor-not-allowed shadow-none"
          }`}
        >
          <span>
            {!fromAmount || parseFloat(fromAmount) <= 0
              ? "Enter an Amount"
              : `Swap ${fromToken.symbol} for ${toToken.symbol}`}
          </span>
        </Button>

        <div className="flex items-center justify-between text-xs font-mono text-zinc-500 px-1">
          <span>Gas &lt; 0.001 SDA</span>
          <span>Instant Settlement</span>
        </div>
      </div>
    </div>
  );
}
