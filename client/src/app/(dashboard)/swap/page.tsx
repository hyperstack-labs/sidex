"use client";

import { SwapTransaction } from "@/components/swap-transaction";
import { useRouter } from "next/navigation";

export default function SwapPage() {
  const router = useRouter();
  return <SwapTransaction onBack={() => router.push("/dashboard")} />;
}
