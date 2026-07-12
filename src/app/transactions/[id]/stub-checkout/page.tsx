"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, CreditCard, Loader2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { transactionsApi } from "@/lib/api";
import { useAuthStore } from "@/lib/auth";
import { formatCurrency } from "@/lib/utils";

interface CheckoutTransaction {
  id: string;
  status: string;
  amount: string;
  listing: { title: string; images: string[] };
  seller: { name: string };
}

export default function StubCheckoutPage() {
  const params = useParams();
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const id = params.id as string;

  const [transaction, setTransaction] = useState<CheckoutTransaction | null>(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);

  const loadTransaction = useCallback(async () => {
    if (!id || !isAuthenticated) return;
    setLoading(true);
    try {
      const data = await transactionsApi.getTransaction(id);
      setTransaction(data);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Could not load checkout";
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

  const handlePay = async () => {
    if (!transaction) return;
    setPaying(true);
    try {
      await transactionsApi.fundStubTransaction(transaction.id);
      toast.success("Escrow funded");
      router.push(`/transactions/${transaction.id}`);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Could not fund escrow";
      toast.error(message);
    } finally {
      setPaying(false);
    }
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
      <div className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center px-4 text-center">
        <CreditCard className="mb-4 text-muted-foreground" size={44} />
        <h1 className="text-2xl font-bold text-foreground">Checkout unavailable</h1>
        <Button asChild className="mt-6 bg-[var(--brand)] text-[var(--navy)] hover:bg-[var(--brand-light)]">
          <Link href="/user/dashboard?section=transactions">Back to transactions</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-100 px-4 py-8 dark:bg-neutral-950 md:py-12">
      <div className="mx-auto max-w-3xl">
        <Link
          href={`/transactions/${transaction.id}`}
          className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft size={16} />
          Transaction
        </Link>

        <section className="rounded-xl border border-[var(--border)] bg-card p-5 shadow-sm md:p-7">
          <div className="flex flex-col gap-6 md:flex-row">
            <div className="aspect-square w-full overflow-hidden rounded-lg bg-muted md:w-44">
              {transaction.listing.images?.[0] ? (
                <img src={transaction.listing.images[0]} alt="" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                  <ShieldCheck size={40} />
                </div>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold uppercase tracking-[0.12em] text-muted-foreground">Sandbox escrow</p>
              <h1 className="mt-2 text-2xl font-bold text-foreground md:text-3xl">{transaction.listing.title}</h1>
              <p className="mt-2 text-sm text-muted-foreground">Seller: {transaction.seller.name}</p>
              <p className="mt-6 text-3xl font-extrabold text-foreground">{formatCurrency(Number(transaction.amount))}</p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button
                  onClick={handlePay}
                  disabled={paying || transaction.status !== "INITIATED"}
                  className="h-12 bg-[var(--brand)] text-[var(--navy)] hover:bg-[var(--brand-light)]"
                >
                  {paying ? <Loader2 className="animate-spin" size={17} /> : <CreditCard size={17} />}
                  {transaction.status === "INITIATED" ? "Fund escrow" : "Escrow funded"}
                </Button>
                <Button asChild variant="outline" className="h-12 border-[var(--border)]">
                  <Link href={`/transactions/${transaction.id}`}>Review transaction</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
