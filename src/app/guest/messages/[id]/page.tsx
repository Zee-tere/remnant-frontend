"use client";

import { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { AlertTriangle, ArrowLeft, Loader2, Send } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { NameAvatar } from "@/components/ui/name-avatar";
import { conversationsApi } from "@/lib/api";
import { getApiErrorMessage } from "@/lib/errors";

interface GuestConversation {
  conversation: {
    id: string;
    buyerId: string;
    listing: { id: string; title: string; images: string[] };
    buyer: { id: string; name: string; avatarUrl: string | null };
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

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      event.currentTarget.form?.requestSubmit();
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
    <main className="mx-auto max-w-3xl px-3 py-3 sm:px-5 sm:py-12">
      <Link href={`/marketplace/${data.conversation.listing.id}`} className="inline-flex items-center gap-2 text-sm font-bold text-[var(--muted-foreground)] hover:text-[var(--brand)]"><ArrowLeft size={16} /> Back to item</Link>
      <section className="mt-3 overflow-hidden rounded-lg border border-[var(--border)]/70 bg-white sm:mt-5">
        <header className="flex items-center gap-3 border-b border-[var(--border)]/70 px-3 py-3 sm:px-5">
          <NameAvatar name={data.conversation.seller.name} className="h-9 w-9 shrink-0 text-xs" />
          <div className="min-w-0">
            <h1 className="truncate text-sm font-bold sm:text-base">{data.conversation.seller.name}</h1>
            <p className="truncate text-xs text-[var(--ink-soft)] sm:text-sm">{data.conversation.listing.title}</p>
          </div>
        </header>
        <div className="h-[calc(100dvh-15.5rem)] min-h-80 space-y-3 overflow-y-auto bg-[var(--background)]/45 px-3 py-4 sm:h-[48vh] sm:px-5">
          {data.messages.map((item) => {
            const mine = item.senderId === data.conversation.buyerId;
            return (
              <div key={item.id} className={`flex items-end gap-2 ${mine ? "justify-end" : "justify-start"}`}>
                {!mine && <NameAvatar name={data.conversation.seller.name} className="h-7 w-7 shrink-0 text-[0.62rem]" />}
                <div className={`max-w-[82%] rounded-lg px-3 py-2.5 text-sm leading-5 ${mine ? "bg-[var(--brand)] text-white" : "border border-[var(--border)]/70 bg-white text-[var(--foreground)]"}`}>
                  <p>{item.content}</p>
                  <p className={`mt-1 text-[11px] ${mine ? "text-white/70" : "text-[var(--muted-foreground)]"}`}>{new Date(item.createdAt).toLocaleString("en-NG", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}</p>
                </div>
                {mine && <NameAvatar name={data.conversation.buyer.name || "You"} className="h-7 w-7 shrink-0 text-[0.62rem]" />}
              </div>
            );
          })}
          <div ref={endRef} />
        </div>
        <form onSubmit={sendMessage} className="flex items-end gap-2 border-t border-[var(--border)]/70 bg-white p-2.5 sm:p-3">
          <textarea value={message} onChange={(event) => setMessage(event.target.value)} onKeyDown={handleKeyDown} placeholder="Write a message" maxLength={2000} rows={1} className="min-h-10 max-h-28 flex-1 resize-none rounded-md border border-[var(--border)]/70 bg-white px-3 py-2.5 text-sm outline-none focus:border-[var(--brand)]" />
          <Button type="submit" disabled={sending || !message.trim()} size="icon" className="h-10 w-10 shrink-0 rounded-md bg-[var(--brand)] text-white" aria-label="Send message">
            {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
          </Button>
        </form>
      </section>
      <p className="mt-3 text-center text-xs leading-5 text-[var(--muted-foreground)]">This guest conversation stays available in this browser for 30 days.</p>
    </main>
  );
}
