"use client";

import { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { AlertTriangle, ArrowLeft, Loader2, Send } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { conversationsApi } from "@/lib/api";
import { getApiErrorMessage } from "@/lib/errors";

interface GuestConversation {
  conversation: {
    id: string;
    buyerId: string;
    listing: { id: string; title: string; images: string[] };
    seller: { id: string; name: string; avatarUrl: string | null };
  };
  messages: Array<{ id: string; senderId: string; content: string; createdAt: string }>;
}

export default function GuestMessagesPage() {
  const id = useParams().id as string;
  const [accessToken, setAccessToken] = useState("");
  const [data, setData] = useState<GuestConversation | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  const load = useCallback(async (token: string) => {
    const result = await conversationsApi.getGuestConversation(id, token);
    setData(result);
    void conversationsApi.markGuestAsRead(id, token).catch(() => undefined);
  }, [id]);

  useEffect(() => {
    const token = localStorage.getItem(`remnant-guest-conversation:${id}`) || "";
    setAccessToken(token);
    if (!token) {
      setLoading(false);
      return;
    }
    load(token).catch(() => setData(null)).finally(() => setLoading(false));
    const interval = window.setInterval(() => void load(token).catch(() => undefined), 12000);
    return () => window.clearInterval(interval);
  }, [id, load]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [data?.messages.length]);

  const sendMessage = async (event: FormEvent) => {
    event.preventDefault();
    const content = message.trim();
    if (!content || !accessToken) return;
    setSending(true);
    try {
      await conversationsApi.createGuestMessage(id, accessToken, content);
      setMessage("");
      await load(accessToken);
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Could not send message"));
    } finally {
      setSending(false);
    }
  };

  if (loading) return <div className="flex min-h-[60vh] items-center justify-center"><Loader2 className="animate-spin text-[var(--brand)]" /></div>;
  if (!accessToken || !data) return (
    <main className="mx-auto max-w-lg px-5 py-20 text-center">
      <AlertTriangle className="mx-auto text-amber-600" size={42} />
      <h1 className="mt-4 text-2xl font-bold">This conversation is unavailable</h1>
      <p className="mt-2 text-sm leading-6 text-[var(--ink-soft)]">Open it on the browser where you first contacted the seller, or create an account for conversations that follow you across devices.</p>
      <Button asChild className="mt-6 rounded-full bg-[var(--brand)] text-white"><Link href="/marketplace">Back to marketplace</Link></Button>
    </main>
  );

  return (
    <main className="mx-auto max-w-3xl px-4 py-8 sm:px-5 sm:py-12">
      <Link href={`/marketplace/${data.conversation.listing.id}`} className="inline-flex items-center gap-2 text-sm font-bold text-[var(--muted-foreground)] hover:text-[var(--brand)]"><ArrowLeft size={16} /> Back to item</Link>
      <section className="mt-5 overflow-hidden rounded-lg border border-[var(--border)] bg-white shadow-sm">
        <header className="border-b border-[var(--border)] px-4 py-4 sm:px-6">
          <h1 className="text-lg font-bold">{data.conversation.seller.name}</h1>
          <p className="mt-0.5 text-sm text-[var(--ink-soft)]">About {data.conversation.listing.title}</p>
        </header>
        <div className="h-[48vh] min-h-80 space-y-3 overflow-y-auto bg-[var(--background)] px-4 py-5 sm:px-6">
          {data.messages.map((item) => {
            const mine = item.senderId === data.conversation.buyerId;
            return (
              <div key={item.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[84%] rounded-lg px-4 py-3 text-sm leading-6 ${mine ? "bg-[var(--brand)] text-white" : "border border-[var(--border)] bg-white text-[var(--foreground)]"}`}>
                  <p>{item.content}</p>
                  <p className={`mt-1 text-[11px] ${mine ? "text-white/70" : "text-[var(--muted-foreground)]"}`}>{new Date(item.createdAt).toLocaleString("en-NG", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}</p>
                </div>
              </div>
            );
          })}
          <div ref={endRef} />
        </div>
        <form onSubmit={sendMessage} className="flex items-end gap-2 border-t border-[var(--border)] p-3 sm:p-4">
          <Textarea value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Write a message" maxLength={2000} rows={2} className="min-h-12 resize-none" />
          <Button type="submit" disabled={sending || !message.trim()} size="icon" className="h-12 w-12 shrink-0 rounded-full bg-[var(--brand)] text-white" aria-label="Send message">
            {sending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
          </Button>
        </form>
      </section>
      <p className="mt-3 text-center text-xs leading-5 text-[var(--muted-foreground)]">This guest conversation stays available in this browser for 30 days.</p>
    </main>
  );
}
