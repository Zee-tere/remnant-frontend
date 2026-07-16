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
import { transactionsApi } from "@/lib/api";
import { useAuthStore } from "@/lib/auth";
import { cn, formatCurrency } from "@/lib/utils";

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
  INITIATED: { label: "Awaiting payment", className: "bg-amber-50 text-amber-700 border-amber-200" },
  FUNDED: { label: "Paid", className: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  SHIPPED: { label: "Shipped", className: "bg-sky-50 text-sky-700 border-sky-200" },
  RECEIVED: { label: "Received", className: "bg-indigo-50 text-indigo-700 border-indigo-200" },
  COMPLETE: { label: "Complete", className: "bg-neutral-100 text-neutral-800 border-neutral-200" },
  DISPUTED: { label: "Disputed", className: "bg-red-50 text-red-700 border-red-200" },
  REFUNDED: { label: "Refunded", className: "bg-neutral-100 text-neutral-700 border-neutral-200" },
  CANCELLED: { label: "Cancelled", className: "bg-neutral-100 text-neutral-700 border-neutral-200" },
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

function isExternalUrl(value: string) {
  return /^https?:\/\//i.test(value);
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
    if (!checkoutUrl) return;
    if (isExternalUrl(checkoutUrl)) {
      window.location.href = checkoutUrl;
      return;
    }
    router.push(checkoutUrl);
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-background">
        <Loader2 className="animate-spin text-[var(--brand)]" size={30} />
      </div>
    );
  }

  if (!transaction) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center px-4 text-center">
        <AlertTriangle className="mb-4 text-amber-600" size={44} />
        <h1 className="text-2xl font-bold text-foreground">Transaction not found</h1>
        <p className="mt-2 text-sm text-muted-foreground">The transaction may have been removed or is not linked to this account.</p>
        <Button asChild className="mt-6 bg-[var(--brand)] text-[var(--navy)] hover:bg-[var(--brand-light)]">
          <Link href="/user/dashboard?section=transactions">Back to transactions</Link>
        </Button>
      </div>
    );
  }

  const meta = statusMeta[transaction.status] ?? statusMeta.INITIATED;

  return (
    <div className="min-h-screen bg-neutral-100 px-4 py-8 text-foreground dark:bg-neutral-950 md:py-12">
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
            <section className="rounded-xl border border-[var(--border)] bg-card p-5 md:p-6">
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-muted-foreground">Order</p>
                  <h1 className="mt-1 text-2xl font-bold text-foreground md:text-3xl">{transaction.listing.title}</h1>
                  <p className="mt-2 text-sm text-muted-foreground">Created {formatDate(transaction.createdAt)}</p>
                </div>
                <span className={cn("inline-flex w-fit items-center rounded-full border px-3 py-1 text-xs font-bold", meta.className)}>
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
                            ? "border-[var(--brand)] bg-[var(--brand)] text-[var(--navy)]"
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
                  <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-full bg-[var(--brand-soft)] text-sm font-bold text-[var(--brand)]">
                    {transaction.buyer.avatarUrl ? (
                      <img src={transaction.buyer.avatarUrl} alt="" className="h-full w-full object-cover" />
                    ) : (
                      transaction.buyer.name.charAt(0).toUpperCase()
                    )}
                  </div>
                  <p className="font-semibold text-foreground">{transaction.buyer.name}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Seller</CardTitle>
                </CardHeader>
                <CardContent className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-full bg-[var(--brand-soft)] text-sm font-bold text-[var(--brand)]">
                    {transaction.seller.avatarUrl ? (
                      <img src={transaction.seller.avatarUrl} alt="" className="h-full w-full object-cover" />
                    ) : (
                      transaction.seller.name.charAt(0).toUpperCase()
                    )}
                  </div>
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
                  <Button onClick={openCheckout} className="w-full bg-[var(--brand)] text-[var(--navy)] hover:bg-[var(--brand-light)]">
                    {isExternalUrl(transaction.paymentCheckoutUrl || transaction.escrowCheckoutUrl || "") ? <ExternalLink size={16} /> : <CreditCard size={16} />}
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
                      className="w-full bg-[var(--brand)] text-[var(--navy)] hover:bg-[var(--brand-light)]"
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
                    className="w-full bg-[var(--brand)] text-[var(--navy)] hover:bg-[var(--brand-light)]"
                  >
                    {actionLoading === "confirm" ? <Loader2 className="animate-spin" size={16} /> : <PackageCheck size={16} />}
                    Confirm receipt
                  </Button>
                )}

                {["FUNDED", "SHIPPED", "RECEIVED"].includes(transaction.status) && (
                  <Button
                    variant="outline"
                    onClick={() =>
                      runAction("dispute", () => transactionsApi.disputeTransaction(transaction.id), "Dispute opened")
                    }
                    disabled={actionLoading === "dispute"}
                    className="w-full border-[var(--border)]"
                  >
                    {actionLoading === "dispute" ? <Loader2 className="animate-spin" size={16} /> : <AlertTriangle size={16} />}
                    Open dispute
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
