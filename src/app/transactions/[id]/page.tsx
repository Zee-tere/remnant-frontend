"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { ElementType } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  CreditCard,
  ExternalLink,
  Loader2,
  PackageCheck,
  ShieldCheck,
  Truck,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { LoadingState } from "@/components/feedback/LoadingState";
import { transactionsApi } from "@/lib/api";
import { useAuthStore } from "@/lib/auth";
import { cn, formatCurrency, getSafeCheckoutUrl } from "@/lib/utils";
import { NameAvatar } from "@/components/ui/name-avatar";

type TransactionStatus =
  | "INITIATED"
  | "FUNDED"
  | "SHIPPED"
  | "RECEIVED"
  | "COMPLETE"
  | "DISPUTED"
  | "REFUNDED"
  | "CANCELLED";

interface TransactionUser {
  id: string;
  name: string;
  avatarUrl: string | null;
}

interface TransactionDetail {
  id: string;
  status: TransactionStatus;
  amount: string;
  platformFee: string;
  escrowTransactionId: string | null;
  escrowCheckoutUrl: string | null;
  escrowProviderStatus: string | null;
  paymentCheckoutUrl?: string | null;
  paymentProviderStatus?: string | null;
  trackingInfo: string | null;
  createdAt: string;
  fundedAt: string | null;
  shippedAt: string | null;
  receivedAt: string | null;
  completedAt: string | null;
  disputedAt: string | null;
  listing: {
    id: string;
    title: string;
    slug: string;
    images: string[];
  };
  buyer: TransactionUser;
  seller: TransactionUser;
}

const statusMeta: Record<TransactionStatus, { label: string; className: string }> = {
  INITIATED: { label: "Awaiting payment", className: "border-state-pending/25 bg-state-pending-container text-state-pending" },
  FUNDED: { label: "Payment secured", className: "border-state-success/25 bg-state-success-container text-state-success" },
  SHIPPED: { label: "In transit", className: "border-state-info/25 bg-state-info-container text-state-info" },
  RECEIVED: { label: "Received", className: "border-state-info/25 bg-state-info-container text-state-info" },
  COMPLETE: { label: "Complete", className: "border-state-success/25 bg-state-success-container text-state-success" },
  DISPUTED: { label: "Problem reported", className: "border-state-danger/25 bg-state-danger-container text-state-danger" },
  REFUNDED: { label: "Refunded", className: "border-state-neutral/25 bg-state-neutral-container text-state-neutral" },
  CANCELLED: { label: "Cancelled", className: "border-state-neutral/25 bg-state-neutral-container text-state-neutral" },
};

const steps: Array<{ status: TransactionStatus; label: string; icon: ElementType }> = [
  { status: "INITIATED", label: "Created", icon: CreditCard },
  { status: "FUNDED", label: "Paid", icon: ShieldCheck },
  { status: "SHIPPED", label: "Shipped", icon: Truck },
  { status: "RECEIVED", label: "Received", icon: PackageCheck },
  { status: "COMPLETE", label: "Complete", icon: CheckCircle2 },
];

const statusOrder: TransactionStatus[] = ["INITIATED", "FUNDED", "SHIPPED", "RECEIVED", "COMPLETE"];

function formatDate(value: string | null) {
  if (!value) return "Pending";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Pending";
  return date.toLocaleDateString("en-NG", { month: "short", day: "numeric", year: "numeric" });
}

export default function TransactionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const id = params.id as string;

  const [transaction, setTransaction] = useState<TransactionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [trackingInfo, setTrackingInfo] = useState("");

  const loadTransaction = useCallback(async () => {
    if (!id || !isAuthenticated) return;
    setLoading(true);
    try {
      const data = await transactionsApi.getTransaction(id);
      setTransaction(data);
      setTrackingInfo(data.trackingInfo ?? "");
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Could not load transaction";
      toast.error(message);
      setTransaction(null);
    } finally {
      setLoading(false);
    }
  }, [id, isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    loadTransaction();
  }, [isAuthenticated, loadTransaction, router]);

  const role = useMemo(() => {
    if (!transaction || !user) return null;
    if (transaction.buyer.id === user.id) return "buyer";
    if (transaction.seller.id === user.id) return "seller";
    return null;
  }, [transaction, user]);

  const currentStepIndex = transaction ? statusOrder.indexOf(transaction.status) : -1;

  const runAction = async (label: string, action: () => Promise<unknown>, success: string) => {
    setActionLoading(label);
    try {
      await action();
      toast.success(success);
      await loadTransaction();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Action failed";
      toast.error(message);
    } finally {
      setActionLoading(null);
    }
  };

  const openCheckout = () => {
    const checkoutUrl = transaction?.paymentCheckoutUrl || transaction?.escrowCheckoutUrl;
    const destination = getSafeCheckoutUrl(checkoutUrl);
    if (!destination) {
      toast.error("The payment link is unavailable or unsafe. Please refresh the order.");
      return;
    }
    if (destination.external) {
      window.location.assign(destination.href);
      return;
    }
    router.push(destination.href);
  };

  if (loading) {
    return (
      <LoadingState label="Loading transaction" className="min-h-[60vh] bg-background" />
    );
  }

  if (!transaction) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center px-4 text-center">
        <AlertTriangle className="mb-4 text-amber-600" size={44} />
        <h1 className="text-2xl font-bold text-foreground">Transaction not found</h1>
        <p className="mt-2 text-sm text-muted-foreground">The transaction may have been removed or is not linked to this account.</p>
        <Button asChild className="mt-6 bg-[var(--brand)] text-white hover:bg-[var(--brand-dark)]">
          <Link href="/user/dashboard?section=transactions">Back to transactions</Link>
        </Button>
      </div>
    );
  }

  const meta = statusMeta[transaction.status] ?? statusMeta.INITIATED;

  return (
    <div className="min-h-screen bg-white px-4 py-8 text-foreground md:py-12">
      <div className="mx-auto max-w-6xl">
        <button
          type="button"
          onClick={() => router.back()}
          className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft size={16} />
          Back
        </button>

        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <div className="space-y-6">
            <section className="rounded-card border border-[var(--border)] bg-card p-5 md:p-6">
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-muted-foreground">Order</p>
                  <h1 className="mt-1 text-2xl font-bold text-foreground md:text-3xl">{transaction.listing.title}</h1>
                  <p className="mt-2 text-sm text-muted-foreground">Created {formatDate(transaction.createdAt)}</p>
                </div>
                <span className={cn("inline-flex w-fit items-center rounded-pill border px-3 py-1 text-xs font-bold", meta.className)}>
                  {meta.label}
                </span>
              </div>

              <div className="mt-8 grid gap-3 sm:grid-cols-5">
                {steps.map((step, index) => {
                  const Icon = step.icon;
                  const complete = currentStepIndex >= index || transaction.status === "COMPLETE";
                  return (
                    <div key={step.status} className="flex min-w-0 items-center gap-3 sm:block">
                      <div
                        className={cn(
                          "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border",
                          complete
                            ? "border-[var(--brand)] bg-[var(--brand)] text-white"
                            : "border-[var(--border)] bg-background text-muted-foreground",
                        )}
                      >
                        <Icon size={18} />
                      </div>
                      <p className="mt-0 truncate text-sm font-semibold text-foreground sm:mt-2">{step.label}</p>
                    </div>
                  );
                })}
              </div>
            </section>

            <section className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Buyer</CardTitle>
                </CardHeader>
                <CardContent className="flex items-center gap-3">
                  <NameAvatar name={transaction.buyer.name} className="h-11 w-11 text-sm" />
                  <p className="font-semibold text-foreground">{transaction.buyer.name}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Seller</CardTitle>
                </CardHeader>
                <CardContent className="flex items-center gap-3">
                  <NameAvatar name={transaction.seller.name} className="h-11 w-11 text-sm" />
                  <p className="font-semibold text-foreground">{transaction.seller.name}</p>
                </CardContent>
              </Card>
            </section>
          </div>

          <aside className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Payment</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Amount</p>
                  <p className="text-2xl font-bold text-foreground">{formatCurrency(Number(transaction.amount))}</p>
                </div>
                <div className="flex items-start gap-2 rounded-control bg-[var(--brand-soft)] p-3 text-sm leading-5 text-[var(--ink-soft)]">
                  <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[var(--brand)]" aria-hidden="true" />
                  <p>Follow the payment status shown here. Only hand over the item after the agreed payment is confirmed.</p>
                </div>
                <div className="rounded-lg bg-muted p-3 text-sm">
                  <div className="flex justify-between gap-4">
                    <span className="text-muted-foreground">Platform fee</span>
                    <span className="font-semibold">{formatCurrency(Number(transaction.platformFee))}</span>
                  </div>
                  {(transaction.paymentProviderStatus || transaction.escrowProviderStatus) && (
                    <div className="mt-2 flex justify-between gap-4">
                      <span className="text-muted-foreground">Provider</span>
                      <span className="font-semibold">{(transaction.paymentProviderStatus || transaction.escrowProviderStatus)?.replace("paystack:", "Paystack · ")}</span>
                    </div>
                  )}
                </div>

                {role === "buyer" && transaction.status === "INITIATED" && (transaction.paymentCheckoutUrl || transaction.escrowCheckoutUrl) && (
                  <Button onClick={openCheckout} className="w-full bg-[var(--brand)] text-white hover:bg-[var(--brand-dark)]">
                    {getSafeCheckoutUrl(transaction.paymentCheckoutUrl || transaction.escrowCheckoutUrl)?.external ? <ExternalLink size={16} /> : <CreditCard size={16} />}
                    Continue payment
                  </Button>
                )}

                {role === "seller" && transaction.status === "FUNDED" && (
                  <div className="space-y-3">
                    <Input
                      value={trackingInfo}
                      onChange={(event) => setTrackingInfo(event.target.value)}
                      placeholder="Tracking or handoff note"
                    />
                    <Button
                      onClick={() =>
                        runAction(
                          "ship",
                          () => transactionsApi.markShipped(transaction.id, trackingInfo.trim() || undefined),
                          "Shipment recorded",
                        )
                      }
                      disabled={actionLoading === "ship"}
                      className="w-full bg-[var(--brand)] text-white hover:bg-[var(--brand-dark)]"
                    >
                      {actionLoading === "ship" ? <Loader2 className="animate-spin" size={16} /> : <Truck size={16} />}
                      Mark shipped
                    </Button>
                  </div>
                )}

                {role === "buyer" && transaction.status === "SHIPPED" && (
                  <Button
                    onClick={() =>
                      runAction("confirm", () => transactionsApi.confirmReceipt(transaction.id), "Receipt confirmed")
                    }
                    disabled={actionLoading === "confirm"}
                    className="w-full bg-[var(--brand)] text-white hover:bg-[var(--brand-dark)]"
                  >
                    {actionLoading === "confirm" ? <Loader2 className="animate-spin" size={16} /> : <PackageCheck size={16} />}
                    Confirm receipt
                  </Button>
                )}

                {["FUNDED", "SHIPPED", "RECEIVED"].includes(transaction.status) && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      if (window.confirm("Report a problem with this order? This will pause the normal transaction flow for review.")) {
                        void runAction("dispute", () => transactionsApi.disputeTransaction(transaction.id), "Problem reported");
                      }
                    }}
                    disabled={actionLoading === "dispute"}
                    className="w-full border-state-danger/30 text-state-danger hover:border-state-danger/45 hover:bg-state-danger-container hover:text-state-danger"
                  >
                    {actionLoading === "dispute" ? <Loader2 className="animate-spin" size={16} /> : <AlertTriangle size={16} />}
                    Report a problem
                  </Button>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Timeline</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex justify-between gap-4">
                  <span className="text-muted-foreground">Created</span>
                  <span className="font-medium">{formatDate(transaction.createdAt)}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-muted-foreground">Paid</span>
                  <span className="font-medium">{formatDate(transaction.fundedAt)}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-muted-foreground">Shipped</span>
                  <span className="font-medium">{formatDate(transaction.shippedAt)}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-muted-foreground">Received</span>
                  <span className="font-medium">{formatDate(transaction.receivedAt)}</span>
                </div>
              </CardContent>
            </Card>
          </aside>
        </div>
      </div>
    </div>
  );
}
