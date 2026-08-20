"use client";

import { LoginPage } from "@/components/login-page";
import { useRouter } from "next/navigation";

export default function LoginPageWrapper() {
  const router = useRouter();

  const handleLogin = () => {
    // You might want to set a cookie or some auth state here
    router.push("/dashboard");
  };

  return <LoginPage onLogin={handleLogin} />;
}
