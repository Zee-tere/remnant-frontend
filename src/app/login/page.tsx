import { Suspense } from "react";
import AuthPageClient from "@/components/auth/AuthPageClient";

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white" />}>
      <AuthPageClient mode="login" />
    </Suspense>
  );
}
