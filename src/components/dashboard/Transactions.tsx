"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { ElementType } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  CheckCircle2,
  CreditCard,
  Loader2,
  Package,
  PackageCheck,
  ShieldCheck,
  Truck,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
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

interface TransactionRow {
  id: string;
  status: TransactionStatus;
  amount: string;
  escrowCheckoutUrl: string | null;
  createdAt: string;
  listing: { id: string; title: string; slug: string; images: string[] };
  buyer: { id: string; name: string; avatarUrl: string | null };
  seller: { id: string; name: string; avatarUrl: string | null };
}

const statusMeta: Record<TransactionStatus, { label: string; className: string; icon: ElementType }> = {
  INITIATED: { label: "Awaiting payment", className: "bg-amber-50 text-amber-700", icon: CreditCard },
  FUNDED: { label: "Funded", className: "bg-emerald-50 text-emerald-700", icon: ShieldCheck },
  SHIPPED: { label: "Shipped", className: "bg-sky-50 text-sky-700", icon: Truck },
  RECEIVED: { label: "Received", className: "bg-indigo-50 text-indigo-700", icon: PackageCheck },
  COMPLETE: { label: "Complete", className: "bg-neutral-100 text-neutral-800", icon: CheckCircle2 },
  DISPUTED: { label: "Disputed", className: "bg-red-50 text-red-700", icon: AlertTriangle },
  REFUNDED: { label: "Refunded", className: "bg-neutral-100 text-neutral-700", icon: CreditCard },
  CANCELLED: { label: "Cancelled", className: "bg-neutral-100 text-neutral-700", icon: CreditCard },
};

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Recently";
  return date.toLocaleDateString("en-NG", { month: "short", day: "numeric" });
}

function isExternalUrl(value: string) {
  return /^https?:\/\//i.test(value);
}

export default function TransactionsSection() {
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const [transactions, setTransactions] = useState<TransactionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "buyer" | "seller" | "active">("all");
  const [query, setQuery] = useState("");

  const loadTransactions = useCallback(async () => {
    if (!isAuthenticated) {
      setTransactions([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const data = await transactionsApi.getTransactions();
      setTransactions(Array.isArray(data) ? data : []);
    } catch {
      setTransactions([]);
      toast.error("Could not load transactions");
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return transactions.filter((transaction) => {
      const roleMatches =
        filter === "all" ||
        (filter === "buyer" && transaction.buyer.id === user?.id) ||
        (filter === "seller" && transaction.seller.id === user?.id) ||
        (filter === "active" && ["INITIATED", "FUNDED", "SHIPPED", "RECEIVED", "DISPUTED"].includes(transaction.status));
      const queryMatches =
        !q ||
        transaction.listing.title.toLowerCase().includes(q) ||
        transaction.buyer.name.toLowerCase().includes(q) ||
        transaction.seller.name.toLowerCase().includes(q);
      return roleMatches && queryMatches;
    });
  }, [filter, query, transactions, user?.id]);

  const activeCount = transactions.filter((transaction) =>
    ["INITIATED", "FUNDED", "SHIPPED", "RECEIVED", "DISPUTED"].includes(transaction.status),
  ).length;

  if (loading) {
    return (
      <div className="flex min-h-[360px] items-center justify-center">
        <Loader2 className="animate-spin text-[var(--brand)]" size={28} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground md:text-3xl">Transactions</h1>
          <p className="text-sm text-muted-foreground">{activeCount} active escrow exchange{activeCount === 1 ? "" : "s"}</p>
        </div>
        <Button asChild className="w-fit bg-[var(--brand)] text-[var(--navy)] hover:bg-[var(--brand-light)]">
          <Link href="/marketplace">Browse marketplace</Link>
        </Button>
      </div>

      <section className="rounded-xl border border-[var(--border)] bg-card p-4 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search transactions"
            className="md:max-w-sm"
          />
          <div className="flex flex-wrap gap-2">
            {(["all", "active", "buyer", "seller"] as const).map((item) => (
              <Button
                key={item}
                type="button"
                variant={filter === item ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter(item)}
                className={filter !== item ? "border-[var(--border)]" : ""}
              >
                {item === "all" ? "All" : item.charAt(0).toUpperCase() + item.slice(1)}
              </Button>
            ))}
          </div>
        </div>
      </section>

      {filtered.length === 0 ? (
        <section className="flex min-h-[320px] flex-col items-center justify-center rounded-xl border border-dashed border-[var(--border)] bg-card px-6 text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-[var(--brand-soft)]">
            <Package className="text-[var(--brand)]" size={26} />
          </div>
          <h3 className="text-lg font-semibold text-foreground">No transactions</h3>
          <p className="mt-2 max-w-md text-sm text-muted-foreground">Escrow exchanges appear here after a buyer starts checkout from a listing.</p>
        </section>
      ) : (
        <div className="space-y-3">
          {filtered.map((transaction) => {
            const meta = statusMeta[transaction.status] ?? statusMeta.INITIATED;
            const Icon = meta.icon;
            const otherUser = transaction.buyer.id === user?.id ? transaction.seller : transaction.buyer;
            const role = transaction.buyer.id === user?.id ? "Buying from" : "Selling to";

            return (
              <section
                key={transaction.id}
                className="rounded-xl border border-[var(--border)] bg-card p-4 shadow-sm transition-colors hover:border-[var(--brand)]/50"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex min-w-0 gap-4">
                    <div className="h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-muted">
                      {transaction.listing.images?.[0] ? (
                        <img src={transaction.listing.images[0]} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                          <Package size={26} />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold", meta.className)}>
                          <Icon size={13} />
                          {meta.label}
                        </span>
                        <span className="text-xs text-muted-foreground">{formatDate(transaction.createdAt)}</span>
                      </div>
                      <h3 className="mt-2 line-clamp-1 text-base font-bold text-foreground">{transaction.listing.title}</h3>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {role} {otherUser.name}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <p className="text-lg font-bold text-foreground sm:min-w-28 sm:text-right">{formatCurrency(Number(transaction.amount))}</p>
                    {transaction.status === "INITIATED" && transaction.buyer.id === user?.id && transaction.escrowCheckoutUrl ? (
                      <Button asChild className="bg-[var(--brand)] text-[var(--navy)] hover:bg-[var(--brand-light)]">
                        {isExternalUrl(transaction.escrowCheckoutUrl) ? (
                          <a href={transaction.escrowCheckoutUrl} rel="noreferrer" target="_blank">
                            Pay escrow
                          </a>
                        ) : (
                          <Link href={transaction.escrowCheckoutUrl}>Pay escrow</Link>
                        )}
                      </Button>
                    ) : (
                      <Button asChild variant="outline" className="border-[var(--border)]">
                        <Link href={`/transactions/${transaction.id}`}>View</Link>
                      </Button>
                    )}
                  </div>
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
