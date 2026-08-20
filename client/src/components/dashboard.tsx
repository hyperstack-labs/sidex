import { motion } from "motion/react";
import { useState } from "react";
import {
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Shield,
  Activity,
  Send,
  ArrowLeftRight,
  Plus,
  ChevronRight,
  Eye,
  EyeOff,
} from "lucide-react";
import Image from "next/image";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const portfolioData = [
  { time: "00:00", value: 145000 },
  { time: "04:00", value: 147500 },
  { time: "08:00", value: 146000 },
  { time: "12:00", value: 149000 },
  { time: "16:00", value: 148500 },
  { time: "20:00", value: 150000 },
  { time: "24:00", value: 150000 },
];

const tokens = [
  {
    name: "SidraChain",
    symbol: "SDA",
    balance: "10,250.50",
    value: "$125,000.00",
    change: "+12.5%",
    isPositive: true,
    halalStatus: "certified",
    image: "/sidra-chain-removebg-preview.png",
  },
  {
    name: "Ethereum",
    symbol: "ETH",
    balance: "5.25",
    value: "$15,750.00",
    change: "+8.2%",
    isPositive: true,
    halalStatus: "certified",
    image: "/ethereum-removebg-preview.png",
  },
  {
    name: "Bitcoin",
    symbol: "BTC",
    balance: "0.15",
    value: "$9,250.00",
    change: "-2.1%",
    isPositive: false,
    halalStatus: "certified",
    image: "/bitcoin.png",
  },
];

const recentTransactions = [
  {
    type: "received",
    token: "SDA",
    amount: "+500.00",
    usd: "$6,100.00",
    from: "0x742d...3a8f",
    time: "2 hours ago",
  },
  {
    type: "sent",
    token: "ETH",
    amount: "-0.5",
    usd: "$1,500.00",
    to: "0x3f2a...9c1d",
    time: "5 hours ago",
  },
  {
    type: "swap",
    token: "SDA → ETH",
    amount: "1000 SDA",
    usd: "$12,200.00",
    time: "1 day ago",
  },
];

interface DashboardProps {
  onNavigate: (page: string) => void;
}

export function Dashboard({ onNavigate }: DashboardProps) {
  const [showValue, setShowValue] = useState(true);

  return (
    <div className="space-y-6 pb-8">

      {/* Portfolio Overview - Hero Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="relative"
      >
        {/* Background Gradient Orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-white/3 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-white/3 rounded-full blur-3xl" />
        </div>

        <div className="relative py-12 md:py-16 px-4 md:px-6">
          {/* Main Content - Left Aligned */}
          <div className="flex flex-col justify-center max-w-4xl">
            <div className="w-full">{/* Wrapper for content */}
              {/* Label with Nav Active Glow + Halal Badge - First to appear */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="flex items-center gap-3 mb-6 flex-wrap"
              >
                <p className="text-xs md:text-sm text-white uppercase tracking-wider [text-shadow:0_0_20px_rgba(255,255,255,0.8)]">
                  Total Portfolio Value
                </p>

                {/* Halal Certified Badge - Compact & Hoverable */}
                <motion.div
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className="group flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-emerald-500/20 bg-emerald-500/5 backdrop-blur-sm cursor-pointer transition-all hover:border-emerald-500/40 hover:bg-emerald-500/10"
                >
                  <Shield className="w-3.5 h-3.5 text-emerald-400 group-hover:text-emerald-300 transition-colors" />
                  <span className="text-[10px] md:text-xs font-medium text-emerald-400 group-hover:text-emerald-300 transition-colors uppercase tracking-wide">
                    Halal Certified
                  </span>
                </motion.div>
              </motion.div>

              {/* Main Value with Eye Toggle - Second to appear with scale */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{
                  duration: 0.6,
                  delay: 0.3,
                  ease: [0.16, 1, 0.3, 1]
                }}
                className="mb-6 flex items-center gap-3 md:gap-4"
              >
                <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold bg-linear-to-b from-white to-white/80 bg-clip-text text-transparent">
                  {showValue ? "$150,000.00" : "••••••••"}
                </h1>
                <motion.button
                  onClick={() => setShowValue(!showValue)}
                  className="text-muted-foreground hover:text-white transition-colors p-2 rounded-lg hover:bg-white/5"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  aria-label={showValue ? "Hide value" : "Show value"}
                >
                  {showValue ? (
                    <Eye className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8" />
                  ) : (
                    <EyeOff className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8" />
                  )}
                </motion.button>
              </motion.div>

              {/* Stats Row - Third to appear */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
                className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 mb-8"
              >
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-400 font-semibold text-lg md:text-xl">+18.7%</span>
                </div>
                <p className="text-sm md:text-base text-muted-foreground/80">
                  <span className="text-emerald-400 font-medium">+$23,750.00</span> this month
                </p>
              </motion.div>
            </div>
          </div>

          {/* Chart Section */}
          <div className="relative rounded-2xl border border-zinc-800/50 bg-linear-to-br from-zinc-900/50 to-zinc-950/50 backdrop-blur-sm p-6 overflow-hidden">
            {/* Subtle grid pattern overlay */}
            <div className="absolute inset-0 opacity-[0.02]" style={{
              backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
              backgroundSize: '20px 20px'
            }} />

            <div className="h-48 relative z-10">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={portfolioData}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#01AACA" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#01AACA" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(1, 170, 202, 0.08)" />

                  <XAxis
                    dataKey="time"
                    stroke="#8A9BA8"
                    fontSize={12}
                    tickLine={false}
                  />
                  <YAxis
                    stroke="#8A9BA8"
                    fontSize={12}
                    tickLine={false}
                    tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0B2733",
                      border: "1px solid rgba(1, 170, 202, 0.3)",
                      borderRadius: "8px",
                    }}
                    formatter={(value: number) => [`$${value.toLocaleString()}`, "Value"]}
                  />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="#01AACA"
                    strokeWidth={2}
                    fill="url(#colorValue)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="grid grid-cols-3 gap-4"
      >
        <Button
          onClick={() => onNavigate("send")}
          className="h-auto flex-col gap-2 p-4 bg-primary/10 hover:bg-primary/20 border border-primary/20 text-foreground"
          variant="outline"
        >
          <Send className="w-5 h-5 text-primary" />
          <span className="text-sm">Send</span>
        </Button>
        <Button
          onClick={() => onNavigate("swap")}
          className="h-auto flex-col gap-2 p-4 bg-accent/10 hover:bg-accent/20 border border-accent/20 text-foreground"
          variant="outline"
        >
          <ArrowLeftRight className="w-5 h-5 text-accent" />
          <span className="text-sm">Swap</span>
        </Button>
        <Button
          onClick={() => onNavigate("deposit")}
          className="h-auto flex-col gap-2 p-4 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-foreground"
          variant="outline"
        >
          <Plus className="w-5 h-5 text-emerald-400" />
          <span className="text-sm">Deposit</span>
        </Button>
      </motion.div>

      {/* Assets Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Your Assets</h3>
          <Button variant="ghost" size="sm" className="text-primary">
            View All
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>

        <div className="grid gap-4">
          {tokens.map((token, index) => (
            <motion.div
              key={token.symbol}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
            >
              <Card className="border border-zinc-800 bg-zinc-900/50 hover:bg-zinc-800 hover:border-zinc-700 transition-all cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-zinc-800/50 flex items-center justify-center border border-zinc-700 overflow-hidden">
                        <Image
                          src={token.image}
                          alt={token.name}
                          width={40}
                          height={40}
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{token.name}</p>
                          {token.halalStatus === "certified" && (
                            <Badge variant="outline" className="text-xs border-accent/30 text-accent">
                              <Shield className="w-3 h-3 mr-1" />
                              Halal
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {token.balance} {token.symbol}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{token.value}</p>
                      <div
                        className={`text-sm flex items-center justify-end ${token.isPositive ? "text-emerald-400" : "text-red-400"
                          }`}
                      >
                        {token.isPositive ? (
                          <ArrowUpRight className="w-3 h-3 mr-1" />
                        ) : (
                          <ArrowDownRight className="w-3 h-3 mr-1" />
                        )}
                        {token.change}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="space-y-4">
        <h3 className="font-semibold">Recent Transactions</h3>
        <Card className="border border-zinc-800 bg-zinc-900">
          <CardContent className="p-4 space-y-3">
            {recentTransactions.map((tx, index) => (
              <div
                key={index}
                className="flex items-center justify-between py-3 border-b border-border/50 last:border-0"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${tx.type === "received"
                      ? "bg-emerald-500/20 text-emerald-400"
                      : tx.type === "sent"
                        ? "bg-red-500/20 text-red-400"
                        : "bg-accent/20 text-accent"
                      }`}
                  >
                    {tx.type === "received" ? (
                      <ArrowDownRight className="w-5 h-5" />
                    ) : tx.type === "sent" ? (
                      <ArrowUpRight className="w-5 h-5" />
                    ) : (
                      <ArrowLeftRight className="w-5 h-5" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium capitalize">{tx.type}</p>
                    <p className="text-sm text-muted-foreground">{tx.time}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium">{tx.amount}</p>
                  <p className="text-sm text-muted-foreground">{tx.usd}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* AI Insights Banner */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="relative overflow-hidden"
      >
        <Card className="border border-zinc-800 bg-zinc-900">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
                <Activity className="w-5 h-5 text-accent" />
              </div>
              <div className="flex-1">
                <p className="font-medium">Market Signal Analysis</p>
                <p className="text-sm text-muted-foreground">
                  SidraChain (SDA) showing positive momentum (+12.5%). Zakat threshold reached.
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-accent hover:text-accent/80"
                onClick={() => onNavigate("ai")}
              >
                View
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}