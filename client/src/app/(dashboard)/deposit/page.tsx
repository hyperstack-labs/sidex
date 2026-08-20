"use client";

import { DepositPage } from "@/components/deposit-page";
import { useRouter } from "next/navigation";

export default function DepositPageWrapper() {
  const router = useRouter();
  return <DepositPage onBack={() => router.push("/dashboard")} />;
}
