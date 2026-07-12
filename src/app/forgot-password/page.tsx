"use client";

import Link from "next/link";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { startHostedAuth } from "@/lib/hosted-auth";

export default function ForgotPasswordPage() {
  const openSecureLogin = async () => {
    try {
      await startHostedAuth({ returnTo: "/user/dashboard", screen: "login" });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Password reset could not start");
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[var(--background)] px-5 py-12">
      <section className="surface-card w-full max-w-md rounded-[1.5rem] bg-white p-6 text-center md:p-8">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-[var(--brand-soft)] text-[var(--brand)]">
          <ShieldCheck size={26} aria-hidden="true" />
        </div>
        <h1 className="text-3xl font-bold text-[var(--foreground)]">Reset password</h1>
        <p className="mx-auto mt-3 max-w-sm text-sm font-semibold leading-6 text-[var(--ink-soft)]">
          Password reset now happens on Remnant&apos;s secure sign-in page. Choose “Forgot password?” there.
        </p>
        <Button
          type="button"
          onClick={openSecureLogin}
          className="mt-6 w-full rounded-full bg-[var(--brand)] font-bold text-white hover:bg-[var(--brand-dark)]"
        >
          Open secure sign-in
          <ArrowRight size={17} aria-hidden="true" />
        </Button>
        <Link href="/login" className="mt-5 inline-flex text-sm font-bold text-[var(--brand)] hover:underline">
          Back to login
        </Link>
      </section>
    </main>
  );
}
