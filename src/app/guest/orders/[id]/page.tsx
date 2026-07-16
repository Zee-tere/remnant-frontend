"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { AlertTriangle, ArrowLeft, CheckCircle2, CreditCard, Loader2, PackageCheck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { transactionsApi } from "@/lib/api";
import { getApiErrorMessage } from "@/lib/errors";
import { formatCurrency } from "@/lib/utils";

interface GuestOrder {
  id: string;
  amount: string;
  status: string;
  paymentCheckoutUrl?: string | null;
  escrowCheckoutUrl?: string | null;
  listing: { id: string; title: string; images: string[] };
  seller: { name: string };
}

export default function GuestOrderPage() {
  const id = useParams().id as string;
  const [order, setOrder] = useState<GuestOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState("");
  const [busy, setBusy] = useState(false);

  const loadOrder = useCallback(async (accessToken: string) => {
    const data = await transactionsApi.getGuestTransaction(id, accessToken);
    setOrder(data);
  }, [id]);

  useEffect(() => {
    const accessToken = localStorage.getItem(`remnant-guest-order:${id}`) || "";
    setToken(accessToken);
    if (!accessToken) {
      setLoading(false);
      return;
    }
    loadOrder(accessToken).catch(() => setOrder(null)).finally(() => setLoading(false));
  }, [id, loadOrder]);

  const updateOrder = async (action: "confirm" | "dispute") => {
    if (!token) return;
    setBusy(true);
    try {
      const updated = action === "confirm"
        ? await transactionsApi.confirmGuestReceipt(id, token)
        : await transactionsApi.disputeGuestTransaction(id, token);
      setOrder(updated);
      toast.success(action === "confirm" ? "Receipt confirmed" : "Dispute opened");
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <div className="flex min-h-[60vh] items-center justify-center"><Loader2 className="animate-spin text-[var(--brand)]" /></div>;
  if (!token || !order) return (
    <main className="mx-auto max-w-lg px-5 py-20 text-center">
      <AlertTriangle className="mx-auto text-amber-600" size={42} />
      <h1 className="mt-4 text-2xl font-bold">This order link is unavailable</h1>
      <p className="mt-2 text-sm leading-6 text-[var(--ink-soft)]">Open the order on the same browser used for checkout, or sign in to keep future orders in your account.</p>
      <Button asChild className="mt-6 rounded-full bg-[var(--brand)] text-white"><Link href="/marketplace">Back to marketplace</Link></Button>
    </main>
  );

  const checkoutUrl = order.paymentCheckoutUrl || order.escrowCheckoutUrl;
  return (
    <main className="mx-auto max-w-2xl px-5 py-10 sm:py-14">
      <Link href="/marketplace" className="inline-flex items-center gap-2 text-sm font-bold text-[var(--muted-foreground)] hover:text-[var(--brand)]"><ArrowLeft size={16} /> Marketplace</Link>
      <div className="mt-6 rounded-lg border border-[var(--border)] bg-white p-6 shadow-sm sm:p-8">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[var(--brand-soft)] text-[var(--brand)]"><PackageCheck /></div>
          <div><p className="text-sm font-bold uppercase text-[var(--muted-foreground)]">Order {order.id.slice(0, 8)}</p><h1 className="mt-1 text-2xl font-bold">{order.listing.title}</h1><p className="mt-1 text-sm text-[var(--ink-soft)]">Seller: {order.seller.name}</p></div>
        </div>
        <div className="mt-7 grid grid-cols-2 gap-3 border-y border-[var(--border)] py-5">
          <div><p className="text-xs font-bold uppercase text-[var(--muted-foreground)]">Total</p><p className="mt-1 text-xl font-bold text-[var(--brand)]">{formatCurrency(Number(order.amount))}</p></div>
          <div><p className="text-xs font-bold uppercase text-[var(--muted-foreground)]">Status</p><p className="mt-1 font-bold">{order.status === "FUNDED" ? "PAID" : order.status.replaceAll("_", " ")}</p></div>
        </div>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          {order.status === "INITIATED" && checkoutUrl && <Button onClick={() => { window.location.href = checkoutUrl; }} className="rounded-full bg-[var(--brand)] text-white"><CreditCard size={17} /> Complete payment</Button>}
          {order.status === "SHIPPED" && <Button disabled={busy} onClick={() => updateOrder("confirm")} className="rounded-full bg-[var(--brand)] text-white"><CheckCircle2 size={17} /> Confirm receipt</Button>}
          {["FUNDED", "SHIPPED", "RECEIVED"].includes(order.status) && <Button disabled={busy} variant="outline" onClick={() => updateOrder("dispute")} className="rounded-full"><AlertTriangle size={17} /> Report a problem</Button>}
        </div>
      </div>
    </main>
  );
}
