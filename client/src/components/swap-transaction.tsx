"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { ArrowUpDown, CheckCircle, Loader2, ChevronDown, ExternalLink } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

import { useTokens } from "@/lib/hooks/use-tokens";
import { useSwap } from "@/lib/hooks/use-swap";

interface SwapTransactionProps {
  onBack: () => void;
}

/**
 * Ultra-Clean Production Web3 Swap for SidEx.
 * Natural vertical eye flow, large bold numbers, zero redundant micro-text,
 * zero box-in-a-box nesting, and zero circular dots.
 */
export function SwapTransaction({ onBack }: SwapTransactionProps) {
  const { tokens: availableTokens } = useTokens();
  const { executeSwap, isProcessing, txHash, isMockMode } = useSwap();

  const [fromSymbol, setFromSymbol] = useState<string>("SDA");
  const [toSymbol, setToSymbol] = useState<string>("sGOLD");

  const fromToken = availableTokens.find((t) => t.symbol === fromSymbol) || availableTokens[0];
  const toToken = availableTokens.find((t) => t.symbol === toSymbol) || availableTokens[1];

  const [fromAmount, setFromAmount] = useState<string>("");
  const [toAmount, setToAmount] = useState<string>("");
  const [isConfirming, setIsConfirming] = useState(false);
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
    const numBalance = parseFloat(fromToken.balance.replace(/[^\d.]/g, ""));
    if (isNaN(numBalance)) return;
    const calculated = (numBalance * percent).toFixed(4);
    handleFromAmountChange(calculated);
  };

  const handleFlipTokens = () => {
    const prevFromSymbol = fromSymbol;
    const prevToSymbol = toSymbol;
    const prevFromToken = fromToken;
    const prevToToken = toToken;
    setFromSymbol(prevToSymbol);
    setToSymbol(prevFromSymbol);
    if (toAmount) {
      setFromAmount(toAmount);
      const calculated = (parseFloat(toAmount) * prevToToken.price) / prevFromToken.price;
      setToAmount(calculated.toFixed(6));
    }
  };

  const handleExecuteSwap = async () => {
    try {
      await executeSwap({
        fromTokenSymbol: fromToken.symbol,
        toTokenSymbol: toToken.symbol,
        fromAmount,
        toAmount,
        fromTokenAddress: fromToken.address as `0x${string}` | undefined,
        toTokenAddress: toToken.address as `0x${string}` | undefined,
      });
      setIsComplete(true);
      if (isMockMode) {
        toast.success("Swap Executed", {
          description: `Swapped ${fromAmount} ${fromToken.symbol} for ${toAmount} ${toToken.symbol}`,
        });
      }
    } catch {
      // Handled in hook
    }
  };

  const exchangeRate = (fromToken.price / toToken.price).toFixed(6);
  const fromUsd = fromAmount ? (parseFloat(fromAmount) * fromToken.price).toFixed(2) : "0.00";
  const toUsd = toAmount ? (parseFloat(toAmount) * toToken.price).toFixed(2) : "0.00";

  // Complete Screen
  if (isComplete) {
    return (
      <div className="w-full max-w-md mx-auto my-auto py-16 space-y-6 text-center">
        <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto text-emerald-400">
          <CheckCircle className="w-7 h-7" />
        </div>

        <div className="space-y-1">
          <h2 className="text-2xl font-bold text-white tracking-tight">Swap Confirmed</h2>
          <p className="text-xs font-mono text-zinc-400">Settled on Sidra Chain</p>
        </div>

        <div className="divide-y divide-white/5 text-xs font-mono text-left py-2">
          <div className="flex justify-between py-2.5">
            <span className="text-zinc-500">Paid</span>
            <span className="text-white font-medium">
              {fromAmount} {fromToken.symbol}
            </span>
          </div>
          <div className="flex justify-between py-2.5">
            <span className="text-zinc-500">Received</span>
            <span className="text-emerald-400 font-medium">
              {toAmount} {toToken.symbol}
            </span>
          </div>
          <div className="flex justify-between py-2.5">
            <span className="text-zinc-500">Gas</span>
            <span className="text-zinc-300">{"< $0.001 (Sidra Chain)"}</span>
          </div>
          <div className="flex justify-between py-2.5">
            <span className="text-zinc-500">Explorer</span>
            <a
              href={`https://ledger.sidrachain.com/tx/${txHash || "0x9f3a41bc"}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#01AACA] hover:underline flex items-center gap-1 font-mono"
            >
              <span>
                {txHash ? `${txHash.slice(0, 6)}...${txHash.slice(-4)}` : "0x9f3a...41bc"}
              </span>
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
      <div className="w-full max-w-md mx-auto my-auto py-12 space-y-6">
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
              <p className="text-3xl font-bold font-mono text-white">
                {fromAmount} {fromToken.symbol}
              </p>
            </div>
            <p className="text-xs font-mono text-zinc-400">≈ ${fromUsd} USD</p>
          </div>

          <div className="pt-4 flex justify-between items-baseline">
            <div>
              <p className="text-[11px] font-mono text-zinc-500 uppercase">You Receive</p>
              <p className="text-3xl font-bold font-mono text-emerald-400">
                {toAmount} {toToken.symbol}
              </p>
            </div>
            <p className="text-xs font-mono text-zinc-400">≈ ${toUsd} USD</p>
          </div>
        </div>

        <div className="py-2 text-xs font-mono text-zinc-400 space-y-2">
          <div className="flex justify-between">
            <span>Rate</span>
            <span className="text-zinc-200">
              1 {fromToken.symbol} = {exchangeRate} {toToken.symbol}
            </span>
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

  // Pure Centered Vertical Swap Module (Natural Flow, Zero Clutter)
  return (
    <div className="w-full max-w-md mx-auto my-auto flex-1 flex flex-col justify-center py-10 space-y-6">
      {/* 1. YOU PAY SECTION */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-mono text-zinc-400">
          <span className="font-semibold text-white uppercase tracking-wider text-xs">You Pay</span>
          <div className="flex items-center gap-2">
            <span className="text-zinc-500">Avail:</span>
            <button
              type="button"
              onClick={() => handlePercentClick(1)}
              className="text-zinc-300 hover:text-white underline underline-offset-2 transition-colors cursor-pointer"
              title="Use Maximum Balance"
            >
              {fromToken.balance}
            </button>
          </div>
        </div>

        {/* Big Number Input */}
        <div className="flex items-center justify-between gap-4">
          <input
            type="text"
            inputMode="decimal"
            placeholder="0.00"
            value={fromAmount}
            onChange={(e) => handleFromAmountChange(e.target.value)}
            className="w-full bg-transparent text-5xl sm:text-6xl font-bold font-mono text-white outline-none focus:outline-none placeholder:text-zinc-700 leading-none tracking-tight"
          />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="flex items-center gap-2.5 px-3.5 py-2 rounded-full border border-white/10 hover:border-white/25 bg-zinc-900/60 text-white font-semibold text-sm shrink-0 cursor-pointer transition-colors shadow-sm outline-none"
              >
                <Image
                  src={fromToken.image}
                  alt={fromToken.symbol}
                  width={22}
                  height={22}
                  className="w-5.5 h-5.5 object-contain"
                />
                <span>{fromToken.symbol}</span>
                <ChevronDown className="w-3.5 h-3.5 opacity-60" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-64 bg-zinc-950/95 border border-white/10 backdrop-blur-2xl rounded-2xl shadow-2xl p-1.5 z-50 divide-y divide-white/5"
            >
              {availableTokens.map((t) => (
                <DropdownMenuItem
                  key={t.symbol}
                  onClick={() => {
                    if (t.symbol === toSymbol) handleFlipTokens();
                    else setFromSymbol(t.symbol);
                  }}
                  className="flex items-center justify-between p-2.5 rounded-xl cursor-pointer hover:bg-white/5 focus:bg-white/5 outline-none"
                >
                  <div className="flex items-center gap-3">
                    <Image
                      src={t.image}
                      alt={t.symbol}
                      width={24}
                      height={24}
                      className="w-6 h-6 object-contain"
                    />
                    <div>
                      <div className="font-semibold text-white text-xs">{t.name}</div>
                      <div className="text-[10px] text-zinc-500 font-mono">
                        {t.symbol} • ${t.price}
                      </div>
                    </div>
                  </div>
                  <span className="text-xs font-mono text-zinc-400">{t.balance}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <p className="text-xs font-mono text-zinc-500">≈ ${fromUsd} USD</p>
      </div>

      {/* 2. PURE WHITE SWITCH ICON (CENTERED, ZERO CONTAINER BOX) */}
      <div className="flex items-center justify-center py-1">
        <button
          type="button"
          onClick={handleFlipTokens}
          className="text-white hover:text-zinc-300 transition-transform duration-300 hover:rotate-180 cursor-pointer p-2 bg-transparent border-0 shadow-none outline-none"
          title="Switch Tokens"
        >
          <ArrowUpDown className="w-5 h-5 text-white" />
        </button>
      </div>

      {/* 3. YOU RECEIVE SECTION */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-mono text-zinc-400">
          <span className="font-semibold text-white uppercase tracking-wider text-xs">
            You Receive
          </span>
          <span className="text-zinc-500">
            Balance: <span className="text-zinc-300">{toToken.balance}</span>
          </span>
        </div>

        {/* Big Number Output */}
        <div className="flex items-center justify-between gap-4">
          <input
            type="text"
            readOnly
            placeholder="0.00"
            value={toAmount}
            className="w-full bg-transparent text-5xl sm:text-6xl font-bold font-mono text-emerald-400 outline-none focus:outline-none placeholder:text-zinc-700 leading-none tracking-tight cursor-default"
          />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="flex items-center gap-2.5 px-3.5 py-2 rounded-full border border-white/10 hover:border-white/25 bg-zinc-900/60 text-white font-semibold text-sm shrink-0 cursor-pointer transition-colors shadow-sm outline-none"
              >
                <Image
                  src={toToken.image}
                  alt={toToken.symbol}
                  width={22}
                  height={22}
                  className="w-5.5 h-5.5 object-contain"
                />
                <span>{toToken.symbol}</span>
                <ChevronDown className="w-3.5 h-3.5 opacity-60" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-64 bg-zinc-950/95 border border-white/10 backdrop-blur-2xl rounded-2xl shadow-2xl p-1.5 z-50 divide-y divide-white/5"
            >
              {availableTokens.map((t) => (
                <DropdownMenuItem
                  key={t.symbol}
                  onClick={() => {
                    if (t.symbol === fromSymbol) handleFlipTokens();
                    else setToSymbol(t.symbol);
                  }}
                  className="flex items-center justify-between p-2.5 rounded-xl cursor-pointer hover:bg-white/5 focus:bg-white/5 outline-none"
                >
                  <div className="flex items-center gap-3">
                    <Image
                      src={t.image}
                      alt={t.symbol}
                      width={24}
                      height={24}
                      className="w-6 h-6 object-contain"
                    />
                    <div>
                      <div className="font-semibold text-white text-xs">{t.name}</div>
                      <div className="text-[10px] text-zinc-500 font-mono">
                        {t.symbol} • ${t.price}
                      </div>
                    </div>
                  </div>
                  <span className="text-xs font-mono text-zinc-400">{t.balance}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <p className="text-xs font-mono text-zinc-500">≈ ${toUsd} USD</p>
      </div>

      {/* Dynamic Rate Line (Appears ONLY when user enters an amount) */}
      {fromAmount && parseFloat(fromAmount) > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center text-xs font-mono text-zinc-400 pt-1"
        >
          <span>
            1 {fromToken.symbol} ≈ {exchangeRate} {toToken.symbol}
          </span>
        </motion.div>
      )}

      {/* 4. PRIMARY CTA BUTTON */}
      <div className="pt-2">
        <Button
          onClick={() => setIsConfirming(true)}
          disabled={!fromAmount || parseFloat(fromAmount) <= 0}
          className={`w-full h-14 rounded-2xl font-bold text-base tracking-wide transition-all duration-200 ${
            fromAmount && parseFloat(fromAmount) > 0
              ? "bg-[#01AACA] hover:bg-[#01AACA]/90 text-zinc-950 shadow-[0_0_30px_rgba(1,170,202,0.35)] active:scale-[0.99] cursor-pointer"
              : "bg-zinc-900 text-zinc-500 border border-white/5 cursor-not-allowed shadow-none"
          }`}
        >
          <span>
            {!fromAmount || parseFloat(fromAmount) <= 0
              ? "Enter an Amount"
              : `Swap ${fromToken.symbol} for ${toToken.symbol}`}
          </span>
        </Button>
      </div>
    </div>
  );
}
