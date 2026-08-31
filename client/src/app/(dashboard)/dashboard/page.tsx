"use client";

import { Dashboard } from "@/components/dashboard";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const router = useRouter();
  return <Dashboard onNavigate={(page) => router.push(`/${page}`)} />;
}
