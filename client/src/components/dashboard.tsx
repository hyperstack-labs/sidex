"use client";

import { motion } from "motion/react";
import { useState } from "react";
import {
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Shield,
  Send,
  ArrowLeftRight,
  Plus,
  Eye,
  EyeOff,
  ChevronDown,
  ExternalLink,
} from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const timeframes = ["1D", "1W", "1M", "3M", "1Y", "ALL"] as const;
type Timeframe = (typeof timeframes)[number];

const chartDataByTimeframe: Record<Timeframe, { time: string; value: number }[]> = {
  "1D": [
    { time: "00:00", value: 147200 },
    { time: "04:00", value: 148100 },
    { time: "08:00", value: 146900 },
    { time: "12:00", value: 149400 },
    { time: "16:00", value: 148800 },
    { time: "20:00", value: 149800 },
    { time: "24:00", value: 150000 },
  ],
  "1W": [
    { time: "Mon", value: 142000 },
    { time: "Tue", value: 144500 },
    { time: "Wed", value: 143800 },
    { time: "Thu", value: 147200 },
    { time: "Fri", value: 146500 },
    { time: "Sat", value: 149000 },
    { time: "Sun", value: 150000 },
  ],
  "1M": [
    { time: "Week 1", value: 126250 },
    { time: "Week 2", value: 132000 },
    { time: "Week 3", value: 139500 },
    { time: "Week 4", value: 150000 },
  ],
  "3M": [
    { time: "Jun", value: 110000 },
    { time: "Jul", value: 128000 },
    { time: "Aug", value: 150000 },
  ],
  "1Y": [
    { time: "Q1", value: 85000 },
    { time: "Q2", value: 105000 },
    { time: "Q3", value: 128000 },
    { time: "Q4", value: 150000 },
  ],
  ALL: [
    { time: "2024", value: 45000 },
    { time: "2025", value: 92000 },
    { time: "2026", value: 150000 },
  ],
};

const tickerItems = [
  { symbol: "SDA", name: "Sidra Chain", price: "$12.19", change: "+12.5%", isPositive: true },
  { symbol: "ISLM", name: "Haqq Network", price: "$0.48", change: "+4.2%", isPositive: true },
  { symbol: "XAU", name: "Sharia Gold (g)", price: "$84.20", change: "+1.8%", isPositive: true },
  { symbol: "BTC", name: "Bitcoin", price: "$98,450.00", change: "+2.4%", isPositive: true },
  { symbol: "ETH", name: "Ethereum", price: "$3,420.00", change: "+3.1%", isPositive: true },
  { symbol: "USDT", name: "Tether USD", price: "$1.00", change: "0.0%", isPositive: true },
];

const tokens = [
  {
    name: "Sidra Chain",
    symbol: "SDA",
    balance: "10,250.50",
    price: "$12.19",
    value: "$125,000.00",
    change: "+12.5%",
    isPositive: true,
    halalStatus: "AAOIFI Certified",
    image: "/sidra-chain-removebg-preview.png",
  },
  {
    name: "Ethereum",
    symbol: "ETH",
    balance: "4.60",
    price: "$3,420.00",
    value: "$15,750.00",
    change: "+8.2%",
    isPositive: true,
    halalStatus: "Spot Asset",
    image: "/ethereum-removebg-preview.png",
  },
  {
    name: "Bitcoin",
    symbol: "BTC",
    balance: "0.094",
    price: "$98,450.00",
    value: "$9,250.00",
    change: "-1.8%",
    isPositive: false,
    halalStatus: "Spot Asset",
    image: "/bitcoin.png",
  },
];

const recentTransactions = [
  {
    type: "Received",
    token: "SDA",
    amount: "+500.00 SDA",
    usd: "+$6,095.00",
    from: "0x742d...3a8f",
    time: "2 hours ago",
    isPositive: true,
  },
  {
    type: "Swap",
    token: "SDA → ETH",
    amount: "1,000 SDA",
    usd: "$12,190.00",
    from: "SidEx AMM Router",
    time: "Yesterday",
    isPositive: null,
  },
  {
    type: "Sent",
    token: "ETH",
    amount: "-0.50 ETH",
    usd: "-$1,710.00",
    from: "0x3f2a...9c1d",
    time: "3 days ago",
    isPositive: false,
  },
];

interface DashboardProps {
  onNavigate: (page: string) => void;
}

/**
 * Modern High-Performance Institutional Dashboard for SidEx.
 * Inspired by Gotrade Ultra with full-bleed unboxed charts, live ticker ribbon,
 * bold financial typography, and zero box-in-a-box clutter.
 *
 * @param props - Component props containing navigation callback.
 * @returns Dashboard interactive view.
 */
export function Dashboard({ onNavigate }: DashboardProps) {
  const [showValue, setShowValue] = useState(true);
  const [activeTimeframe, setActiveTimeframe] = useState<Timeframe>("1M");
  const [hoveredPoint, setHoveredPoint] = useState<{ time: string; value: number } | null>(null);

  const currentData = chartDataByTimeframe[activeTimeframe];

  // Dynamic Live Financial Scrubbing (Gotrade / Robinhood pattern)
  const baseValue = currentData[0]?.value || 145000;
  const displayValue = hoveredPoint ? hoveredPoint.value : 150000;
  const diff = displayValue - baseValue;
  const percentChange = ((diff / baseValue) * 100).toFixed(2);
  const isGain = diff >= 0;
  const timeframeLabel = hoveredPoint ? hoveredPoint.time : "All time";

  return (
    <div className="space-y-8 pb-12">
      {/* 1. Gotrade-Style Live Ticker Ribbon */}
      <div className="flex items-center gap-4 py-2 overflow-x-auto no-scrollbar border-b border-white/5 -mt-2">
        <button
          type="button"
          className="flex items-center gap-1.5 px-3 py-1 rounded-full border border-white/10 bg-zinc-900/60 text-xs font-medium text-zinc-300 hover:text-white shrink-0 cursor-pointer"
        >
          <span>My holdings</span>
          <ChevronDown className="w-3.5 h-3.5 opacity-70" />
        </button>

        <div className="flex items-center gap-5 sm:gap-7 text-xs font-mono shrink-0">
          {tickerItems.map((item) => (
            <div key={item.symbol} className="flex items-center gap-2">
              <span className="text-zinc-400 font-semibold">{item.symbol}</span>
              <span className="text-zinc-200">{item.price}</span>
              <span
                className={`flex items-center text-[11px] ${
                  item.isPositive ? "text-emerald-400" : "text-red-400"
                }`}
              >
                {item.change}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 2. Hero Portfolio Value Section (Gotrade Dynamic Scrubbing Header) */}
      <section className="space-y-3 pt-2">
        <div className="flex items-center gap-3">
          <span className="text-xs sm:text-sm text-zinc-400 font-medium">
            Total in SidEx
          </span>
          <div className="flex items-center gap-1 text-[11px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
            <Shield className="w-3 h-3" />
            <span>Halal Certified</span>
          </div>
        </div>

        {/* Large Bold Dynamic Balance */}
        <div className="flex items-baseline gap-4">
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight text-white font-mono">
            {showValue
              ? `$${displayValue.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}`
              : "••••••••"}
          </h1>
          <button
            type="button"
            onClick={() => setShowValue(!showValue)}
            className="text-zinc-500 hover:text-white transition-colors p-1.5 cursor-pointer"
            title={showValue ? "Hide balance" : "Show balance"}
          >
            {showValue ? <Eye className="w-6 h-6" /> : <EyeOff className="w-6 h-6" />}
          </button>
        </div>

        {/* Dynamic PnL Metric that updates live with mouse hover */}
        <div
          className={`flex items-center gap-2 text-sm sm:text-base font-semibold ${
            isGain ? "text-emerald-400" : "text-red-400"
          }`}
        >
          {isGain ? (
            <TrendingUp className="w-4 h-4" />
          ) : (
            <ArrowDownRight className="w-4 h-4" />
          )}
          <span>
            {isGain ? "+" : ""}$
            {Math.abs(diff).toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}{" "}
            ({isGain ? "+" : ""}
            {percentChange}%)
          </span>
          <span className="text-xs font-normal text-zinc-500 font-mono">
            • {timeframeLabel}
          </span>
        </div>
      </section>

      {/* 3. Full-Bleed Unboxed Interactive Chart (Gotrade Ultra Style) */}
      <section className="space-y-4">
        {/* The Chart - Live Mouse Scrubbing, NO Box Container */}
        <div className="h-64 sm:h-72 w-full relative">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={currentData}
              margin={{ top: 10, right: 0, left: 0, bottom: 0 }}
              onMouseMove={(e) => {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const activePayload = (e as any)?.activePayload;
                if (activePayload && activePayload.length > 0) {
                  setHoveredPoint(activePayload[0].payload);
                }
              }}
              onMouseLeave={() => setHoveredPoint(null)}
            >
              <defs>
                <linearGradient id="gotradeGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity={0.35} />
                  <stop offset="60%" stopColor="#01AACA" stopOpacity={0.1} />
                  <stop offset="100%" stopColor="#000000" stopOpacity={0} />
                </linearGradient>
              </defs>

              <XAxis
                dataKey="time"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#71717a", fontSize: 11, fontFamily: "monospace" }}
              />
              <YAxis
                orientation="right"
                axisLine={false}
                tickLine={false}
                domain={["dataMin - 2000", "dataMax + 2000"]}
                tick={{ fill: "#71717a", fontSize: 11, fontFamily: "monospace" }}
                tickFormatter={(val) => `$${(val / 1000).toFixed(1)}k`}
              />
              <Tooltip
                cursor={{
                  stroke: "rgba(255, 255, 255, 0.4)",
                  strokeWidth: 1,
                  strokeDasharray: "3 3",
                }}
                content={() => null}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke="#10b981"
                strokeWidth={2.5}
                fill="url(#gotradeGradient)"
                dot={false}
                activeDot={{ r: 5, fill: "#10b981", stroke: "#000000", strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Timeframe Selector Pills */}
        <div className="flex items-center gap-1.5 pt-1">
          {timeframes.map((tf) => (
            <button
              key={tf}
              type="button"
              onClick={() => setActiveTimeframe(tf)}
              className={`px-3.5 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                activeTimeframe === tf
                  ? "bg-white text-zinc-950 shadow-sm"
                  : "text-zinc-500 hover:text-zinc-200"
              }`}
            >
              {tf}
            </button>
          ))}
        </div>
      </section>

      {/* 4. Action Strip (Clean Minimalist Action Buttons) */}
      <section className="grid grid-cols-3 gap-3 pt-2">
        <Button
          onClick={() => onNavigate("send")}
          className="h-12 bg-zinc-900/80 hover:bg-zinc-800 border border-white/10 hover:border-white/20 text-white rounded-xl font-semibold gap-2 transition-all cursor-pointer"
        >
          <Send className="w-4 h-4 text-[#01AACA]" />
          <span>Send</span>
        </Button>
        <Button
          onClick={() => onNavigate("swap")}
          className="h-12 bg-zinc-900/80 hover:bg-zinc-800 border border-white/10 hover:border-white/20 text-white rounded-xl font-semibold gap-2 transition-all cursor-pointer"
        >
          <ArrowLeftRight className="w-4 h-4 text-emerald-400" />
          <span>Swap</span>
        </Button>
        <Button
          onClick={() => onNavigate("deposit")}
          className="h-12 bg-zinc-900/80 hover:bg-zinc-800 border border-white/10 hover:border-white/20 text-white rounded-xl font-semibold gap-2 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4 text-zinc-300" />
          <span>Deposit</span>
        </Button>
      </section>

      {/* 5. Positions / Holdings Table (Flat Editorial List - Zero Box-in-a-Box) */}
      <section className="space-y-4 pt-4">
        <div className="flex items-center justify-between border-b border-white/5 pb-3">
          <h2 className="text-lg font-bold text-white tracking-tight">Your Positions</h2>
          <span className="text-xs font-mono text-zinc-500">Sidra Chain L1</span>
        </div>

        <div className="divide-y divide-white/5">
          {tokens.map((token) => (
            <motion.div
              key={token.symbol}
              whileHover={{ x: 3 }}
              transition={{ duration: 0.15 }}
              className="flex items-center justify-between py-4 px-2 hover:bg-white/[0.02] rounded-xl transition-colors cursor-pointer"
              onClick={() => onNavigate("swap")}
            >
              {/* Left: Token Icon + Name */}
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-full border border-white/10 bg-zinc-900 flex items-center justify-center p-1.5 overflow-hidden">
                  <Image
                    src={token.image}
                    alt={token.name}
                    width={32}
                    height={32}
                    className="w-full h-full object-contain"
                  />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-white text-sm sm:text-base">
                      {token.name}
                    </span>
                    <span className="text-[10px] font-mono text-zinc-400 border border-white/10 px-1.5 py-0.2 rounded">
                      {token.halalStatus}
                    </span>
                  </div>
                  <span className="text-xs font-mono text-zinc-400">
                    {token.balance} {token.symbol} • {token.price}
                  </span>
                </div>
              </div>

              {/* Right: Value + 24h PnL */}
              <div className="text-right">
                <p className="font-semibold text-white text-sm sm:text-base font-mono">
                  {token.value}
                </p>
                <p
                  className={`text-xs font-mono flex items-center justify-end gap-0.5 ${
                    token.isPositive ? "text-emerald-400" : "text-red-400"
                  }`}
                >
                  {token.isPositive ? (
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  ) : (
                    <ArrowDownRight className="w-3.5 h-3.5" />
                  )}
                  <span>{token.change}</span>
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 6. Recent Activity (Flat Editorial List) */}
      <section className="space-y-4 pt-4">
        <div className="flex items-center justify-between border-b border-white/5 pb-3">
          <h2 className="text-lg font-bold text-white tracking-tight">Recent Activity</h2>
          <a
            href="https://ledger.sidrachain.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-xs font-mono text-zinc-400 hover:text-white transition-colors"
          >
            <span>Explorer</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        <div className="divide-y divide-white/5">
          {recentTransactions.map((tx, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between py-3.5 px-2 hover:bg-white/[0.02] rounded-xl transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full border border-white/10 bg-zinc-900/80 flex items-center justify-center text-zinc-400">
                  {tx.isPositive === true ? (
                    <ArrowDownRight className="w-4 h-4 text-emerald-400" />
                  ) : tx.isPositive === false ? (
                    <ArrowUpRight className="w-4 h-4 text-red-400" />
                  ) : (
                    <ArrowLeftRight className="w-4 h-4 text-[#01AACA]" />
                  )}
                </div>
                <div>
                  <p className="font-semibold text-white text-xs sm:text-sm">
                    {tx.type} {tx.token}
                  </p>
                  <p className="text-[11px] font-mono text-zinc-500">
                    {tx.from} • {tx.time}
                  </p>
                </div>
              </div>

              <div className="text-right font-mono">
                <p
                  className={`text-xs sm:text-sm font-semibold ${
                    tx.isPositive === true
                      ? "text-emerald-400"
                      : tx.isPositive === false
                      ? "text-zinc-200"
                      : "text-white"
                  }`}
                >
                  {tx.amount}
                </p>
                <p className="text-[11px] text-zinc-500">{tx.usd}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}