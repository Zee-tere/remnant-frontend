"use client";

import Link from "next/link";
import { Suspense, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, LogIn, ShieldCheck, UserRound } from "lucide-react";
import UploadItem from "@/components/dashboard/UploadItem";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/lib/auth";

const allowedIntents = ["SELL", "TRADE", "DONATE", "FIX", "RECYCLE"];

export default function SellItemPage() {
  return (
    <Suspense fallback={<div className="min-h-[70vh] bg-[var(--background)]" />}>
      <SellItemPageContent />
    </Suspense>
  );
}

function SellItemPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const rawIntent = searchParams.get("intent")?.toUpperCase() || "";
  const initialPurpose = allowedIntents.includes(rawIntent) ? rawIntent : "";
  const isGuest = searchParams.get("guest") === "1";

  const listingPath = useMemo(() => {
    const params = new URLSearchParams();
    if (initialPurpose) params.set("intent", initialPurpose);
    return `/sell-item${params.toString() ? `?${params.toString()}` : ""}`;
  }, [initialPurpose]);

  if (!isAuthenticated && !isGuest) {
    return (
      <main className="flex min-h-[calc(100dvh-7rem)] items-center bg-[var(--background)] px-4 py-8 md:block md:min-h-0 md:px-8 md:py-16">
        <section className="mx-auto max-w-md">
          <div className="surface-card rounded-card bg-white p-4 md:rounded-feature md:p-8">
            <div className="space-y-3">
              <Button asChild className="h-13 w-full bg-[var(--brand)] text-base font-bold text-white hover:bg-[var(--brand-dark)] md:h-14">
                <Link href={`/signup?redirect=${encodeURIComponent(listingPath)}`}>
                  <UserRound size={18} aria-hidden="true" />
                  Join Now
                </Link>
              </Button>

              <Button
                type="button"
                variant="secondary"
                className="h-13 w-full border-0 bg-[var(--sand)] text-base font-bold text-[var(--foreground)] hover:bg-[var(--brand-soft)] md:h-14"
                onClick={() => router.push(`${listingPath}${listingPath.includes("?") ? "&" : "?"}guest=1`)}
              >
                <ArrowRight size={18} aria-hidden="true" />
                Continue as guest
              </Button>
              <p className="px-3 text-center text-xs font-medium leading-5 text-[var(--muted-foreground)]">
                Guest listings stay live for 7 days, then are removed automatically.
              </p>

              <Button asChild variant="ghost" className="h-12 w-full text-sm font-bold text-[var(--ink-soft)] hover:bg-[var(--sand)] hover:text-[var(--brand)]">
                <Link href={`/login?redirect=${encodeURIComponent(listingPath)}`}>
                  <LogIn size={16} aria-hidden="true" />
                  Already have an account? Log in
                </Link>
              </Button>
            </div>

            <div className="mt-4 rounded-card bg-[var(--brand-soft)] p-3.5 md:mt-6 md:rounded-surface md:p-5">
              <p className="flex gap-2 text-sm font-medium leading-5 text-[var(--ink-soft)] md:font-semibold md:leading-6">
                <ShieldCheck className="mt-0.5 shrink-0 text-[var(--secondary-blue)]" size={18} aria-hidden="true" />
                A profile keeps Remnant messages together. Guest listings stay account-free and show the contact method you choose.
              </p>
            </div>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="bg-[var(--background)] px-3 py-5 md:px-8 md:py-16">
      <UploadItem initialPurpose={initialPurpose} isGuest={isGuest && !isAuthenticated} />
    </main>
  );
}
