"use client";

import { SendTransaction } from "@/components/send-transaction";
import { useRouter } from "next/navigation";

export default function SendPage() {
  const router = useRouter();
  return <SendTransaction onBack={() => router.push("/dashboard")} />;
}
