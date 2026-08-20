"use client";

import { useState } from "react";
import { useAccount, useWriteContract } from "wagmi";
import { useEnvMode } from "./use-env-mode";
import { CONTRACT_ADDRESSES, SIDEX_ROUTER_ABI } from "@/config/contracts";
import { parseUnits, type Address } from "viem";
import { toast } from "sonner";

export interface SwapExecutionParams {
  fromTokenSymbol: string;
  toTokenSymbol: string;
  fromAmount: string;
  toAmount: string;
  fromTokenAddress?: Address;
  toTokenAddress?: Address;
}

/**
 * Unified Swap Hook for SidEx.
 * Dispatches simulated swaps in Mock Mode, or broadcasts real atomic transactions
 * to SidExRouter.sol on Sidra Chain in Live Mode.
 *
 * @returns Swap execution function and transaction state.
 */
export function useSwap() {
  const { isMockMode } = useEnvMode();
  const { address } = useAccount();
  const [isProcessing, setIsProcessing] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);

  const { writeContractAsync } = useWriteContract();

  const executeSwap = async (
    params: SwapExecutionParams
  ): Promise<{ success: boolean; hash: string }> => {
    setIsProcessing(true);

    try {
      if (isMockMode || !address) {
        // Simulated Mock Mode Execution
        await new Promise((resolve) => setTimeout(resolve, 1400));
        const mockHash = `0x${Array.from({ length: 64 }, () =>
          Math.floor(Math.random() * 16).toString(16)
        ).join("")}`;

        setTxHash(mockHash);
        setIsProcessing(false);
        return { success: true, hash: mockHash };
      }

      // Live Mode Execution via SidExRouter.sol
      if (CONTRACT_ADDRESSES.router === "0x0000000000000000000000000000000000000000") {
        throw new Error("SidExRouter address not configured in NEXT_PUBLIC_ROUTER_ADDRESS");
      }

      const amountIn = parseUnits(params.fromAmount, 18);
      const amountOutMin = (parseUnits(params.toAmount, 18) * BigInt(995)) / BigInt(1000); // 0.5% slippage
      const path: Address[] = [
        params.fromTokenAddress || CONTRACT_ADDRESSES.sGold,
        params.toTokenAddress || CONTRACT_ADDRESSES.sUsd,
      ];
      const deadline = BigInt(Math.floor(Date.now() / 1000) + 1200); // 20 mins

      const hash = await writeContractAsync({
        address: CONTRACT_ADDRESSES.router,
        abi: SIDEX_ROUTER_ABI,
        functionName: "swapExactTokensForTokens",
        args: [amountIn, amountOutMin, path, address, deadline],
      });

      setTxHash(hash);
      setIsProcessing(false);
      return { success: true, hash };
    } catch (error) {
      setIsProcessing(false);
      const errorMessage = error instanceof Error ? error.message : "Swap transaction failed";
      toast.error("Swap Failed", { description: errorMessage });
      throw error;
    }
  };

  return {
    executeSwap,
    isProcessing,
    txHash,
    isMockMode,
  };
}
