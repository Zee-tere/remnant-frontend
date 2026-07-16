"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, Clock3, Loader2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { transactionsApi } from "@/lib/api";

type VerificationState = "loading" | "success" | "pending" | "error";

function PaymentResult() {
  const searchParams = useSearchParams();
  const reference = searchParams.get("reference") || searchParams.get("trxref");
  const [state, setState] = useState<VerificationState>("loading");
  const [transactionId, setTransactionId] = useState<string | null>(null);
  const [guestOrder, setGuestOrder] = useState(false);

  useEffect(() => {
    if (!reference) {
      setState("error");
      return;
    }
    const guestPayment = localStorage.getItem(`remnant-guest-payment:${reference}`);
    if (guestPayment) {
      try {
        const stored = JSON.parse(guestPayment) as { transactionId?: string };
        if (stored.transactionId) {
          setTransactionId(stored.transactionId);
          setGuestOrder(true);
        }
      } catch {
        localStorage.removeItem(`remnant-guest-payment:${reference}`);
      }
    }

    transactionsApi.verifyPaystackTransaction(reference)
      .then((result) => {
        setTransactionId((current) => current || result.transactionId);
        setState(result.verified ? "success" : "pending");
      })
      .catch(() => setState("error"));
  }, [reference]);

  const content = {
    loading: { icon: Loader2, title: "Confirming payment", body: "Please keep this page open for a moment.", color: "text-[var(--brand)]", spin: true },
    success: { icon: CheckCircle2, title: "Payment confirmed", body: "Your order is ready. The seller has been notified.", color: "text-[var(--brand)]", spin: false },
    pending: { icon: Clock3, title: "Payment is still processing", body: "We have not received a successful confirmation yet. Check the order again shortly.", color: "text-amber-600", spin: false },
    error: { icon: XCircle, title: "We could not confirm this payment", body: "No order was marked paid. Please return to the item or check your order before trying again.", color: "text-red-600", spin: false },
  }[state];
  const Icon = content.icon;
  const orderHref = transactionId
    ? guestOrder ? `/guest/orders/${transactionId}` : `/transactions/${transactionId}`
    : "/marketplace";

  return (
    <main className="mx-auto flex min-h-[70vh] max-w-xl items-center px-5 py-14 text-center">
      <div className="w-full rounded-lg border border-[var(--border)] bg-white p-7 shadow-sm sm:p-10">
        <Icon size={46} className={`mx-auto ${content.color} ${content.spin ? "animate-spin" : ""}`} />
        <h1 className="mt-5 text-2xl font-bold text-[var(--foreground)]">{content.title}</h1>
        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[var(--ink-soft)]">{content.body}</p>
        {state !== "loading" && (
          <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Button asChild className="rounded-full bg-[var(--brand)] px-6 font-bold text-white hover:bg-[var(--brand-dark)]">
              <Link href={orderHref}>{transactionId ? "View order" : "Back to marketplace"}</Link>
            </Button>
            {transactionId && (
              <Button asChild variant="outline" className="rounded-full px-6 font-bold">
                <Link href="/marketplace">Keep browsing</Link>
              </Button>
            )}
          </div>
        )}
      </div>
    </main>
  );
}

export default function PaymentCallbackPage() {
  return <Suspense fallback={<div className="flex min-h-[70vh] items-center justify-center"><Loader2 className="animate-spin text-[var(--brand)]" /></div>}><PaymentResult /></Suspense>;
}
