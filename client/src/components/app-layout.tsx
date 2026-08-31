"use client";

import { ReactNode, useEffect, useState, useRef } from "react";
import { motion } from "motion/react";
import {
  LayoutDashboard,
  ArrowLeftRight,
  ChevronDown,
  Settings,
  Menu,
  FileText,
  Shield,
  LogOut,
  Bell,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { usePathname, useRouter } from "next/navigation";
import { LegalModal } from "@/components/legal-modals";
import { FloatingAIAssistant } from "@/components/ai/floating-ai-assistant";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Image from "next/image";
import { WalletConnectButton } from "./ui/wallet-connect-button";

interface AppLayoutProps {
  children: ReactNode;
}

const navigation = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
  { id: "swap", label: "Swap", icon: ArrowLeftRight, path: "/swap" },
  { id: "settings", label: "Settings", icon: Settings, path: "/settings" },
];

export function AppLayout({ children }: AppLayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [legalModal, setLegalModal] = useState<"tos" | "privacy" | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isScrolling, setIsScrolling] = useState(false);
  const [isScrollHovered, setIsScrollHovered] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [thumbHeightRatio, setThumbHeightRatio] = useState(0.2);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pathname = usePathname();
  const router = useRouter();

  const handleContainerScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    setIsScrolled(scrollTop > 8);
    setIsScrolling(true);

    const maxScroll = scrollHeight - clientHeight;
    if (maxScroll > 0) {
      setScrollProgress(scrollTop / maxScroll);
      setThumbHeightRatio(Math.max(0.12, Math.min(0.8, clientHeight / scrollHeight)));
    }

    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }
    scrollTimeoutRef.current = setTimeout(() => {
      setIsScrolling(false);
    }, 900);
  };

  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  const handleLogout = () => {
    try {
      localStorage.removeItem("sidex_vault_address");
    } catch {}
    router.push("/login");
  };

  const onOpenLegal = (type: "tos" | "privacy") => {
    setLegalModal(type);
  };

  return (
    <div className="h-screen overflow-hidden bg-background relative flex flex-col">
      {/* Header - Fixed Outside Scroll Container */}
      <header
        className={`shrink-0 z-50 w-full transition-colors ${
          isScrolled
            ? "border-b border-border/40 bg-background/60 backdrop-blur supports-backdrop-filter:bg-background/40"
            : "border-b border-transparent bg-transparent"
        }`}
      >
        <div className="w-full flex h-18 md:h-20 items-center justify-between px-6 md:px-12 relative">
          {/* Logo - Left Side */}
          <div
            className="flex items-center gap-2.5 cursor-pointer flex-1 group"
            onClick={() => router.push("/dashboard")}
          >
            <div className="flex flex-col items-start justify-center">
              <Image
                src="/sidex.png"
                alt="SidEx"
                width={120}
                height={38}
                className="w-auto h-7 md:h-8 object-contain"
                priority
              />
              <p className="hidden sm:block text-[11px] text-zinc-400 font-mono tracking-wider transition-all duration-300 group-hover:text-white">
                Sharia-Compliant Wallet
              </p>
            </div>
          </div>

          {/* Desktop Navigation - Absolutely Centered & Bold Prominent (Gotrade Style) */}
          <nav className="hidden md:flex items-center justify-center gap-6 lg:gap-8 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            {navigation.map((item) => {
              const isActive = pathname.startsWith(item.path);
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => router.push(item.path)}
                  className={`text-[15px] lg:text-base font-semibold transition-all duration-200 cursor-pointer ${
                    isActive
                      ? "text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.7)]"
                      : "text-zinc-400 hover:text-white"
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Mobile Menu */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[85vw] max-w-72 flex flex-col">
              <SheetTitle className="sr-only">Mobile Menu</SheetTitle>
              <div className="flex flex-col h-full">
                {/* Mobile Navigation */}
                <nav className="flex-1 space-y-2 mt-8">
                  {/* Wallet Connect - Mobile */}
                  <div className="px-4 pt-4">
                    <WalletConnectButton fullWidth />
                  </div>

                  <div className="my-2 border-t border-border" />

                  {navigation.map((item) => {
                    const isActive = pathname.startsWith(item.path);
                    return (
                      <Button
                        key={item.id}
                        variant={isActive ? "secondary" : "ghost"}
                        onClick={() => {
                          router.push(item.path);
                          setMobileMenuOpen(false);
                        }}
                        className={`w-full justify-center ${
                          isActive ? "bg-primary/10 text-primary" : "text-muted-foreground"
                        }`}
                      >
                        {item.label}
                      </Button>
                    );
                  })}
                  <div className="my-4 border-t border-border" />
                  <Button
                    variant="ghost"
                    onClick={() => {
                      onOpenLegal("tos");
                      setMobileMenuOpen(false);
                    }}
                    className="w-full justify-start gap-3 text-muted-foreground"
                  >
                    <FileText className="w-5 h-5" />
                    Terms of Service
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => {
                      onOpenLegal("privacy");
                      setMobileMenuOpen(false);
                    }}
                    className="w-full justify-start gap-3 text-muted-foreground"
                  >
                    <Shield className="w-5 h-5" />
                    Privacy Policy
                  </Button>
                  <div className="my-4 border-t border-border" />
                  <div className="flex items-center gap-3 px-2 py-2">
                    <div className="w-8 h-8 rounded-full border border-white/10 bg-zinc-900 flex items-center justify-center text-zinc-400">
                      <User className="w-4 h-4" />
                    </div>
                    <div className="leading-tight">
                      <p className="text-sm font-medium">Account</p>
                      <p className="text-xs text-muted-foreground">SidEx Vault Session</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full justify-start gap-3 text-destructive"
                  >
                    <LogOut className="w-5 h-5" />
                    Logout
                  </Button>
                </nav>

                {/* Footer */}
                <div className="pt-4 border-t border-border">
                  <p className="text-xs text-muted-foreground text-center">
                    🔒 Non-custodial • Sharia-compliant
                  </p>
                </div>
              </div>
            </SheetContent>
          </Sheet>

          {/* Desktop User Menu - Right Side */}
          <div className="hidden md:flex flex-1 justify-end items-center gap-3 min-w-0">
            {/* Wallet Connect Button */}
            <WalletConnectButton />
            {/* Notification Bell with Sleek Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 relative bg-transparent! hover:bg-transparent! active:bg-transparent! focus-visible:bg-transparent! text-muted-foreground hover:text-white transition-colors cursor-pointer"
                >
                  <Bell className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-80 sm:w-96 bg-zinc-950/95 border border-white/10 backdrop-blur-2xl p-0 rounded-2xl shadow-2xl overflow-hidden"
              >
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 bg-white/2">
                  <span className="text-xs font-semibold text-white">
                    System Status: Operational
                  </span>
                  <span className="text-[10px] font-mono text-zinc-500">Sidra Chain</span>
                </div>

                {/* Notifications Flat Editorial List (Zero Box-in-a-Box) */}
                <div className="divide-y divide-white/5 text-xs max-h-80 overflow-y-auto">
                  <div className="p-3.5 hover:bg-white/2 transition-colors space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-zinc-200">Compliance Verified</span>
                      <span className="text-[10px] text-zinc-500 font-mono">Just now</span>
                    </div>
                    <p className="text-zinc-400 text-[11px] leading-relaxed">
                      AAOIFI Standards Met. All spot exchange modules actively monitoring
                      transactions.
                    </p>
                  </div>

                  <div className="p-3.5 hover:bg-white/2 transition-colors space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-zinc-200">Zakat Calculator Active</span>
                      <span className="text-[10px] text-zinc-500 font-mono">5m ago</span>
                    </div>
                    <p className="text-zinc-400 text-[11px] leading-relaxed">
                      Auto-calculation and precious metal Nisab thresholds synced.
                    </p>
                  </div>

                  <div className="p-3.5 hover:bg-white/2 transition-colors space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-zinc-200">Market Intelligence Feed</span>
                      <span className="text-[10px] text-zinc-500 font-mono">12m ago</span>
                    </div>
                    <p className="text-zinc-400 text-[11px] leading-relaxed">
                      Live Sidra Chain RPC data stream connected with zero latency.
                    </p>
                  </div>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Account Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="h-9 gap-2 px-2.5 text-zinc-200 hover:text-white bg-transparent! hover:bg-transparent! active:bg-transparent! focus-visible:bg-transparent! cursor-pointer"
                >
                  <User className="w-4 h-4 text-zinc-400" />
                  <span className="hidden lg:inline text-sm font-semibold">Account</span>
                  <ChevronDown className="size-3.5 opacity-60" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-60 bg-zinc-950/95 border border-white/10 backdrop-blur-2xl rounded-2xl shadow-2xl p-1"
              >
                <DropdownMenuLabel className="px-3 py-2.5">
                  <div className="flex items-center gap-2.5">
                    <User className="w-4 h-4 text-[#01AACA]" />
                    <div className="leading-tight">
                      <div className="text-sm font-medium text-white">Account Settings</div>
                      <div className="text-[11px] text-zinc-400 font-mono">SidEx Vault Session</div>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-white/5" />
                <DropdownMenuItem
                  variant="destructive"
                  onClick={handleLogout}
                  className="rounded-xl text-xs font-medium cursor-pointer"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Scrollable Body Container - Isolated Below Navbar */}
      <div
        className="flex-1 overflow-y-auto overflow-x-hidden flex flex-col justify-between no-scrollbar relative"
        onScroll={handleContainerScroll}
      >
        {/* Main Content - Widened Canvas Viewport */}
        <main className="w-full max-w-[1600px] mx-auto px-6 md:px-12 lg:px-16 py-6 flex-1 flex flex-col">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="flex-1 flex flex-col w-full"
          >
            {children}
          </motion.div>
        </main>

        {/* Full-Width Clean Modern Footer */}
        <footer className="w-full border-t border-white/5 py-5 mt-auto bg-black/40 backdrop-blur-md">
          <div className="w-full px-6 sm:px-10 lg:px-12 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono text-zinc-500">
            {/* Left: Clean Copyright */}
            <div className="flex items-center gap-2 text-zinc-400">
              <span>© 2026 SidEx</span>
            </div>

            {/* Right: Clean Links */}
            <div className="flex items-center gap-5">
              <button
                type="button"
                onClick={() => onOpenLegal("tos")}
                className="hover:text-zinc-200 transition-colors cursor-pointer"
              >
                Terms
              </button>
              <button
                type="button"
                onClick={() => onOpenLegal("privacy")}
                className="hover:text-zinc-200 transition-colors cursor-pointer"
              >
                Privacy
              </button>
              <a
                href="https://ledger.sidrachain.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-zinc-200 transition-colors flex items-center gap-1"
              >
                <span>Explorer</span>
                <span className="text-[10px]">↗</span>
              </a>
            </div>
          </div>
        </footer>
      </div>

      {/* Luxury Floating Precision Scrollbar with Edge Hover Zone */}
      <div
        className="fixed right-0 top-20 bottom-0 w-3 z-50 flex justify-end pr-1 cursor-pointer"
        onMouseEnter={() => setIsScrollHovered(true)}
        onMouseLeave={() => setIsScrollHovered(false)}
      >
        <motion.div
          className="w-1 bg-white/40 hover:bg-white/60 rounded-full transition-colors"
          style={{
            height: `${thumbHeightRatio * 100}%`,
            transform: `translateY(${
              scrollProgress * ((1 - thumbHeightRatio) / Math.max(thumbHeightRatio, 0.05)) * 100
            }%)`,
          }}
          animate={{ opacity: isScrolling || isScrollHovered ? 1 : 0 }}
          transition={{
            opacity: {
              duration: isScrolling || isScrollHovered ? 0.1 : 0.55,
              ease: "easeOut",
            },
          }}
        />
      </div>

      <FloatingAIAssistant />
      <LegalModal type={legalModal} onClose={() => setLegalModal(null)} />
    </div>
  );
}
