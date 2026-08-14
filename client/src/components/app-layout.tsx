"use client";

import { ReactNode, useEffect, useState } from "react";
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { usePathname, useRouter } from "next/navigation";
import { LegalModal } from "@/components/legal-modals";
import { AmbientBackground } from "@/components/ui/ambient-background";
import { FloatingAIAssistant } from "@/components/ai/floating-ai-assistant";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleLogout = () => {
    // Implement logout logic here
    console.log("Logging out...");
    router.push("/login"); // Redirect to login
  };

  const onOpenLegal = (type: "tos" | "privacy") => {
    setLegalModal(type);
  };

  return (
    <div className="min-h-screen bg-background relative">
      <AmbientBackground />
      {/* Header */}
      <header
        className={`sticky top-0 z-50 w-full transition-colors ${isScrolled
          ? "border-b border-border/40 bg-background/60 backdrop-blur supports-backdrop-filter:bg-background/40"
          : "border-b border-transparent bg-transparent"
          }`}
      >
        <div className="w-full flex h-16 items-center justify-between px-6 md:px-12 relative">
          {/* Logo - Left Side */}
          <div className="flex items-center gap-2 cursor-pointer h-9 flex-1 group" onClick={() => router.push("/dashboard")}>
            <div className="flex flex-col items-start sm:items-center justify-center h-full">
              <Image
                src="/sidex.png"
                alt="SidEx"
                width={100}
                height={32}
                className="w-auto h-auto"
                priority
              />
              <p className="hidden sm:block text-[10px] text-muted-foreground leading-tight transition-all duration-300 group-hover:text-white group-hover:[text-shadow:0_0_15px_rgba(255,255,255,0.6)]">Sharia-Compliant Wallet</p>
            </div>
          </div>

          {/* Desktop Navigation - Absolutely Centered */}
          <nav className="hidden md:flex items-center justify-center gap-2 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            {navigation.map((item) => {
              const isActive = pathname.startsWith(item.path);
              return (
                <Button
                  key={item.id}
                  variant="ghost"
                  onClick={() => router.push(item.path)}
                  className={`px-4 py-2 transition-all duration-300 bg-transparent! hover:bg-transparent! active:bg-transparent! focus-visible:bg-transparent! ${isActive
                    ? "text-white [text-shadow:0_0_20px_rgba(255,255,255,0.8)]"
                    : "text-muted-foreground hover:text-white hover:[text-shadow:0_0_15px_rgba(255,255,255,0.6)]"
                    }`}
                >
                  {item.label}
                </Button>
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
                        className={`w-full justify-center ${isActive ? "bg-primary/10 text-primary" : "text-muted-foreground"
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
                    <Avatar className="size-9">
                      <AvatarFallback className="bg-primary text-primary-foreground text-xs font-bold">
                        SE
                      </AvatarFallback>
                    </Avatar>
                    <div className="leading-tight">
                      <p className="text-sm font-medium">Account</p>
                      <p className="text-xs text-muted-foreground">Manage wallet access</p>
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
            {/* Notification Bell */}
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 relative bg-transparent! hover:bg-transparent! active:bg-transparent! focus-visible:bg-transparent! text-muted-foreground hover:text-white transition-colors"
              onClick={() => setNotificationOpen(true)}
            >
              <Bell className="h-5 w-5" />
              {/* Notification Badge */}
              <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-[#01AACA] ring-2 ring-background animate-pulse" />
            </Button>

            {/* Account Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-9 gap-2 px-2 text-muted-foreground bg-transparent! hover:bg-transparent! active:bg-transparent! focus-visible:bg-transparent!">
                  <Avatar className="size-8">
                    <AvatarFallback className="bg-primary text-primary-foreground text-xs font-bold">
                      SE
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden lg:inline">Account</span>
                  <ChevronDown className="size-4 opacity-60" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64">
                <DropdownMenuLabel className="px-2 py-2">
                  <div className="flex items-center gap-3">
                    <Avatar className="size-9">
                      <AvatarFallback className="bg-primary text-primary-foreground text-xs font-bold">
                        SE
                      </AvatarFallback>
                    </Avatar>
                    <div className="leading-tight">
                      <div className="text-sm font-medium">Account</div>
                      <div className="text-xs text-muted-foreground">SidEx Wallet</div>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem variant="destructive" onClick={handleLogout}>
                  <LogOut className="w-4 h-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container max-w-4xl mx-auto px-4 py-6">
        <motion.div
          key={pathname}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {children}
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-6 mt-12">
        <div className="container max-w-4xl mx-auto px-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground text-center sm:text-left">
              © 2026 SidEx. All rights reserved.
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => onOpenLegal("tos")}
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                Terms of Service
              </button>
              <button
                onClick={() => onOpenLegal("privacy")}
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                Privacy Policy
              </button>
            </div>
          </div>
        </div>
      </footer>

      <FloatingAIAssistant />
      <LegalModal type={legalModal} onClose={() => setLegalModal(null)} />

      {/* System Status Notification Dialog */}
      <Dialog open={notificationOpen} onOpenChange={setNotificationOpen}>
        <DialogContent className="sm:max-w-150 bg-zinc-950 border-zinc-800">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-[#01AACA]" />
              <DialogTitle className="text-xl">System Status: Operational</DialogTitle>
            </div>
            <DialogDescription className="sr-only">
              Real-time monitoring and status information for the SidEx platform.
            </DialogDescription>
          </DialogHeader>
                    
          <div className="space-y-4 py-4">
            {/* Main Status Message */}
            <p className="text-sm text-muted-foreground">
              SidraChain connection established. All compliance modules are active and monitoring real-time transactions.
            </p>

            {/* Status Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Compliance Verified */}
              <div className="flex items-start gap-3 p-3 rounded-lg bg-zinc-900/50 border border-zinc-800">
                <div className="mt-0.5">
                  <div className="h-8 w-8 rounded-full bg-emerald-500/10 flex items-center justify-center">
                    <Shield className="h-4 w-4 text-emerald-500" />
                  </div>
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-white mb-0.5">Compliance Verified</h4>
                  <p className="text-xs text-muted-foreground">AAOIFI Standards Met</p>
                </div>
              </div>

              {/* Zakat Calculator */}
              <div className="flex items-start gap-3 p-3 rounded-lg bg-zinc-900/50 border border-zinc-800">
                <div className="mt-0.5">
                  <div className="h-8 w-8 rounded-full bg-[#01AACA]/10 flex items-center justify-center">
                    <svg className="h-4 w-4 text-[#01AACA]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-white mb-0.5">Zakat Calculator</h4>
                  <p className="text-xs text-muted-foreground">Auto-calculation Active</p>
                </div>
              </div>

              {/* Market Intelligence */}
              <div className="flex items-start gap-3 p-3 rounded-lg bg-zinc-900/50 border border-zinc-800">
                <div className="mt-0.5">
                  <div className="h-8 w-8 rounded-full bg-emerald-500/10 flex items-center justify-center">
                    <svg className="h-4 w-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-white mb-0.5">Market Intelligence</h4>
                  <p className="text-xs text-muted-foreground">Live Data Feed</p>
                </div>
              </div>
            </div>
            
            {/* Acknowledge Button */}
            <div className="flex justify-end pt-2">
              <Button
                onClick={() => setNotificationOpen(false)}
                className="bg-white/10 hover:bg-white/20 text-white border border-white/20"
              >
                Acknowledge
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}