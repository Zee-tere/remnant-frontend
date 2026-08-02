import { Suspense } from "react";
import AuthPageClient from "@/components/auth/AuthPageClient";

export default function SignUpPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white" />}>
      <AuthPageClient mode="signup" />
    </Suspense>
  );
}
