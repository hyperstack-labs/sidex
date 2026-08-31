"use client";

import { useState } from "react";
import { motion } from "motion/react";
import {
  Send,
  ArrowLeft,
  CheckCircle,
  Loader2,
  AlertCircle,
  ExternalLink,
  ArrowRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAccount, useBalance, useSendTransaction, useWaitForTransactionReceipt } from "wagmi";
import { isAddress, parseEther, formatEther } from "viem";
import { toast } from "sonner";

interface SendTransactionProps {
  onBack: () => void;
}

/**
 * Institutional Asset Transfer component for SidraChain ($SDA).
 * Connects directly to live Web3 wallet providers via Viem and Wagmi,
 * enforcing strict checksum validation, gas estimation, and on-chain receipt tracking.
 *
 * @param props - Component props containing navigation callback.
 * @returns Asset transfer interactive interface.
 */
export function SendTransaction({ onBack }: SendTransactionProps) {
  const { address, isConnected } = useAccount();
  const { data: balanceData } = useBalance({ address });

  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [isConfirming, setIsConfirming] = useState(false);

  const {
    data: hash,
    error: sendError,
    isPending: isSendPending,
    sendTransaction,
  } = useSendTransaction();

  const { isLoading: isTxWaiting, isSuccess: isTxSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const rawBalance = balanceData ? formatEther(balanceData.value) : "0";
  const numBalance = parseFloat(rawBalance) || 0;

  const isValidRecipient = isAddress(recipient.trim());
  const numAmount = parseFloat(amount) || 0;
  const isAmountValid = numAmount > 0 && numAmount <= numBalance;

  const handlePercentage = (pct: number) => {
    if (numBalance <= 0) return;
    const calculated = (numBalance * pct).toFixed(4);
    setAmount(calculated);
  };

  const handleInitiateTransfer = () => {
    if (!isValidRecipient) {
      toast.error("Invalid recipient EVM address");
      return;
    }
    if (!isAmountValid) {
      toast.error("Invalid transfer amount or insufficient balance");
      return;
    }
    setIsConfirming(true);
  };

  const handleExecuteSend = () => {
    if (!isValidRecipient || !isAmountValid) return;

    try {
      sendTransaction({
        to: recipient.trim() as `0x${string}`,
        value: parseEther(amount.trim()),
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Transaction initiation failed";
      toast.error(msg);
    }
  };

  if (isTxSuccess && hash) {
    return (
      <div className="space-y-6 pb-12 max-w-lg mx-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center py-8 text-center"
        >
          <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-4">
            <CheckCircle className="w-8 h-8 text-emerald-400" />
          </div>

          <h2 className="text-xl font-bold text-white mb-1">Transfer Confirmed</h2>
          <p className="text-xs text-zinc-400 max-w-xs mb-6">
            Your transaction has been mined and verified on SidraChain.
          </p>

          <Card className="w-full border border-zinc-800 bg-zinc-950/70 p-4 space-y-3 mb-6 text-left">
            <div className="flex justify-between text-xs py-1 border-b border-zinc-800">
              <span className="text-zinc-400">Amount</span>
              <span className="font-mono font-semibold text-white">{amount} SDA</span>
            </div>

            <div className="flex justify-between text-xs py-1 border-b border-zinc-800">
              <span className="text-zinc-400">Recipient</span>
              <span className="font-mono text-zinc-300">
                {recipient.slice(0, 8)}...{recipient.slice(-6)}
              </span>
            </div>

            <div className="flex justify-between text-xs py-1">
              <span className="text-zinc-400">Transaction Hash</span>
              <a
                href={`https://ledger.sidrachain.com/tx/${hash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-[#01AACA] hover:underline flex items-center gap-1"
              >
                <span>{hash.slice(0, 10)}...</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </Card>

          <Button
            onClick={onBack}
            className="w-full bg-[#01AACA] hover:bg-[#01AACA]/90 text-white font-semibold"
          >
            Return to Portfolio
          </Button>
        </motion.div>
      </div>
    );
  }

  if (isConfirming) {
    return (
      <div className="space-y-6 pb-12 max-w-lg mx-auto">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsConfirming(false)}
          className="text-xs text-zinc-400 hover:text-white"
        >
          <ArrowLeft className="w-3.5 h-3.5 mr-1" />
          Edit Transfer
        </Button>

        <Card className="border border-zinc-800 bg-zinc-950/70 shadow-sm rounded-xl">
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-semibold text-white">
              Review & Sign Transfer
            </CardTitle>
            <CardDescription className="text-xs text-zinc-400">
              Verify recipient address and amount before signing with your connected wallet.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-5">
            <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-3 text-xs">
              <div className="flex justify-between py-1 border-b border-zinc-800/80">
                <span className="text-zinc-400">Sending Asset</span>
                <span className="font-semibold text-white">Sidra ($SDA)</span>
              </div>

              <div className="flex justify-between py-1 border-b border-zinc-800/80">
                <span className="text-zinc-400">Destination</span>
                <span className="font-mono text-zinc-300 truncate max-w-xs">{recipient}</span>
              </div>

              <div className="flex justify-between py-1">
                <span className="text-zinc-400">Net Amount</span>
                <span className="font-mono font-bold text-white text-sm">{amount} SDA</span>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 shrink-0" />
              <span>Zero-interest spot transfer. Standard gas fees only.</span>
            </div>

            {sendError && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-xs text-red-400 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span className="truncate">{sendError.message}</span>
              </div>
            )}

            <Button
              onClick={handleExecuteSend}
              disabled={isSendPending || isTxWaiting}
              className="w-full bg-[#01AACA] hover:bg-[#01AACA]/90 text-white font-semibold h-11"
            >
              {isSendPending || isTxWaiting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {isTxWaiting ? "Confirming on SidraChain..." : "Awaiting Wallet Signature..."}
                </>
              ) : (
                <>
                  <span>Sign & Broadcast Transaction</span>
                  <Send className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12 max-w-lg mx-auto">
      <Button
        variant="ghost"
        size="sm"
        onClick={onBack}
        className="text-xs text-zinc-400 hover:text-white"
      >
        <ArrowLeft className="w-3.5 h-3.5 mr-1" />
        Back to Dashboard
      </Button>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="border border-zinc-800 bg-zinc-950/70 shadow-sm rounded-xl">
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-semibold flex items-center gap-2 text-white">
              <Send className="w-4 h-4 text-[#01AACA]" />
              Transfer Asset
            </CardTitle>
            <CardDescription className="text-xs text-zinc-400">
              Send native $SDA directly to any SidraChain address.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-5">
            {/* Recipient Address */}
            <div className="space-y-1.5">
              <Label className="text-xs text-zinc-300">Recipient Address</Label>
              <Input
                placeholder="0x..."
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                className={`bg-zinc-900/60 border-zinc-800 font-mono text-sm h-10 ${
                  recipient && !isValidRecipient ? "border-red-500/50 focus:border-red-500" : ""
                }`}
              />
              {recipient && !isValidRecipient && (
                <p className="text-[11px] text-red-400">
                  Please enter a valid 0x Ethereum/SidraChain address.
                </p>
              )}
            </div>

            {/* Amount */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <Label className="text-zinc-300">Amount ($SDA)</Label>
                <span className="text-zinc-400 font-mono">
                  Available: <strong className="text-white">{numBalance.toFixed(4)}</strong> SDA
                </span>
              </div>

              <Input
                type="number"
                step="any"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="bg-zinc-900/60 border-zinc-800 text-sm font-mono h-10"
              />

              {/* Quick Percentage Chips */}
              <div className="flex gap-2 pt-1">
                {[0.25, 0.5, 0.75, 1.0].map((pct) => (
                  <button
                    key={pct}
                    type="button"
                    onClick={() => handlePercentage(pct)}
                    className="flex-1 py-1 rounded bg-zinc-900 border border-zinc-800 text-[11px] text-zinc-400 hover:text-white hover:border-zinc-700 transition-colors font-mono"
                  >
                    {pct === 1.0 ? "MAX" : `${pct * 100}%`}
                  </button>
                ))}
              </div>
            </div>

            {/* Review Button */}
            <div className="pt-2">
              <Button
                onClick={handleInitiateTransfer}
                disabled={!isConnected || !isValidRecipient || !isAmountValid}
                className="w-full bg-[#01AACA] hover:bg-[#01AACA]/90 text-white font-semibold h-10"
              >
                {!isConnected ? "Connect Wallet to Send" : "Review Transfer"}
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
