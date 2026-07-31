"use client";

import { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { AlertTriangle, ArrowLeft, Loader2, Send } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { NameAvatar } from "@/components/ui/name-avatar";
import { LoadingState } from "@/components/feedback/LoadingState";
import { conversationsApi } from "@/lib/api";
import { getApiErrorMessage } from "@/lib/errors";
import { readSessionValue } from "@/lib/browser-storage";
import { useMobileVisualViewport } from "@/hooks/use-mobile-visual-viewport";

interface GuestConversation {
  conversation: {
    id: string;
    buyerId: string;
    listing: { id: string; title: string; images: string[] };
    buyer: { id: string; name: string; avatarUrl: string | null };
    seller: { id: string; name: string; avatarUrl: string | null };
  };
  messages: Array<{
    id: string;
    senderId: string;
    content: string;
    createdAt: string;
    clientState?: "sending";
  }>;
}

export default function GuestMessagesPage() {
  const id = useParams().id as string;
  const [accessToken, setAccessToken] = useState("");
  const [data, setData] = useState<GuestConversation | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState("");
  const messagesViewportRef = useRef<HTMLDivElement>(null);
  const composerRef = useRef<HTMLTextAreaElement>(null);
  const shouldStickToBottomRef = useRef(true);
  const mobileViewportStyle = useMobileVisualViewport(Boolean(accessToken && data));

  const load = useCallback(async (token: string, background = false) => {
    const result = await conversationsApi.getGuestConversation(id, token, background);
    setData((current) => {
      const pending = current?.messages.filter((item) => item.clientState === "sending") ?? [];
      return {
        ...result,
        messages: [
          ...result.messages,
          ...pending.filter((item) => !result.messages.some((row: { id: string }) => row.id === item.id)),
        ],
      };
    });
    void conversationsApi.markGuestAsRead(id, token).catch(() => undefined);
  }, [id]);

  useEffect(() => {
    const token = readSessionValue(`remnant-guest-conversation:${id}`) || "";
    setAccessToken(token);
    if (!token) {
      setLoading(false);
      return;
    }
    load(token).catch(() => setData(null)).finally(() => setLoading(false));
    const refreshWhenActive = () => {
      if (document.visibilityState === "visible") {
        void load(token, true).catch(() => undefined);
      }
    };
    const interval = window.setInterval(refreshWhenActive, 3500);
    window.addEventListener("focus", refreshWhenActive);
    window.addEventListener("online", refreshWhenActive);
    return () => {
      window.clearInterval(interval);
      window.removeEventListener("focus", refreshWhenActive);
      window.removeEventListener("online", refreshWhenActive);
    };
  }, [id, load]);

  useEffect(() => {
    const viewport = messagesViewportRef.current;
    const latest = data?.messages[data.messages.length - 1];
    if (
      !viewport ||
      (!shouldStickToBottomRef.current && latest?.senderId !== data?.conversation.buyerId)
    ) {
      return;
    }
    const frame = window.requestAnimationFrame(() => {
      viewport.scrollTop = viewport.scrollHeight;
    });
    return () => window.cancelAnimationFrame(frame);
  }, [data?.conversation.buyerId, data?.messages]);

  useEffect(() => {
    const composer = composerRef.current;
    if (!composer) return;
    composer.style.height = "0px";
    composer.style.height = `${Math.min(112, Math.max(44, composer.scrollHeight))}px`;
  }, [message]);

  useEffect(() => {
    if (!shouldStickToBottomRef.current) return;
    const frame = window.requestAnimationFrame(() => {
      const viewport = messagesViewportRef.current;
      if (viewport) viewport.scrollTop = viewport.scrollHeight;
    });
    return () => window.cancelAnimationFrame(frame);
  }, [mobileViewportStyle]);

  const sendMessage = async (event: FormEvent) => {
    event.preventDefault();
    const content = message.trim();
    if (!content || !accessToken || !data) return;
    const temporaryId = `pending-${crypto.randomUUID()}`;
    const optimisticMessage = {
      id: temporaryId,
      senderId: data.conversation.buyerId,
      content,
      createdAt: new Date().toISOString(),
      clientState: "sending" as const,
    };

    shouldStickToBottomRef.current = true;
    setSending(true);
    setMessage("");
    setData((current) => current ? {
      ...current,
      messages: [...current.messages, optimisticMessage],
    } : current);
    try {
      const created = await conversationsApi.createGuestMessage(id, accessToken, content);
      setData((current) => current ? {
        ...current,
        messages: [
          ...current.messages.filter((item) => item.id !== temporaryId && item.id !== created.id),
          created,
        ].sort((left, right) => new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime()),
      } : current);
    } catch (error) {
      setData((current) => current ? {
        ...current,
        messages: current.messages.filter((item) => item.id !== temporaryId),
      } : current);
      setMessage((current) => current || content);
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

  if (loading) return <LoadingState label="Loading conversation" className="min-h-[60vh]" />;
  if (!accessToken || !data) return (
    <main className="mx-auto max-w-lg px-5 py-20 text-center">
      <AlertTriangle className="mx-auto text-amber-600" size={42} />
      <h1 className="mt-4 text-2xl font-bold">This conversation is unavailable</h1>
      <p className="mt-2 text-sm leading-6 text-[var(--ink-soft)]">Open it on the browser where you first contacted the seller, or create an account for conversations that follow you across devices.</p>
      <Button asChild className="mt-6 rounded-full bg-[var(--brand)] text-white"><Link href="/marketplace">Back to marketplace</Link></Button>
    </main>
  );

  return (
    <main
      style={mobileViewportStyle}
      className="fixed inset-x-0 top-0 z-[80] h-dvh bg-white md:static md:mx-auto md:h-auto md:max-w-3xl md:transform-none md:px-5 md:py-12"
    >
      <section className="flex h-full min-h-0 flex-col overflow-hidden bg-white md:h-[min(680px,78dvh)] md:rounded-lg md:border md:border-[var(--border)]/70">
        <header className="flex items-center gap-2 border-b border-[#f1f0ec] px-2 py-1.5 sm:px-5 sm:py-3">
          <Link href={`/marketplace/${data.conversation.listing.id}`} className="flex h-11 w-11 shrink-0 items-center justify-center text-[var(--foreground)] hover:text-[var(--brand)]" aria-label="Back to item"><ArrowLeft size={18} /></Link>
          <NameAvatar name={data.conversation.seller.name} className="h-9 w-9 shrink-0 text-xs" />
          <div className="min-w-0">
            <h1 className="truncate text-sm font-bold sm:text-base">{data.conversation.seller.name}</h1>
            <p className="truncate text-xs text-[var(--ink-soft)] sm:text-sm">{data.conversation.listing.title}</p>
          </div>
        </header>
        <div
          ref={messagesViewportRef}
          onScroll={(event) => {
            const viewport = event.currentTarget;
            shouldStickToBottomRef.current =
              viewport.scrollHeight - viewport.scrollTop - viewport.clientHeight < 96;
          }}
          className="min-h-0 flex-1 space-y-1.5 overflow-y-auto overscroll-contain bg-white px-3 py-4 [overflow-anchor:none] sm:px-5"
        >
          {data.messages.map((item) => {
            const mine = item.senderId === data.conversation.buyerId;
            return (
              <div key={item.id} className={`flex items-end gap-2 ${mine ? "justify-end" : "justify-start"}`}>
                {!mine && <NameAvatar name={data.conversation.seller.name} className="h-7 w-7 shrink-0 text-[0.62rem]" />}
                <div className={`max-w-[82%] rounded-[18px] px-3 py-2.5 text-sm leading-5 ${mine ? "rounded-br-md bg-[var(--brand)] text-white" : "rounded-bl-md bg-[#f1f1ef] text-[var(--foreground)]"}`}>
                  <p>{item.content}</p>
                  <p className={`mt-1 text-[11px] ${mine ? "text-white/70" : "text-[var(--muted-foreground)]"}`}>{item.clientState === "sending" ? "Sending…" : new Date(item.createdAt).toLocaleString("en-NG", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}</p>
                </div>
                {mine && <NameAvatar name={data.conversation.buyer.name || "You"} className="h-7 w-7 shrink-0 text-[0.62rem]" />}
              </div>
            );
          })}
        </div>
        <form onSubmit={sendMessage} className="flex items-end gap-1 border-t border-[#f1f0ec] bg-white px-2.5 pb-[calc(0.5rem+var(--safe-area-bottom))] pt-2 sm:p-3">
          <div className="flex min-w-0 flex-1 items-end rounded-xl border border-[#e7e7e3] px-1.5 py-1">
            <textarea
            ref={composerRef}
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => {
              if (!shouldStickToBottomRef.current) return;
              window.requestAnimationFrame(() => {
                const viewport = messagesViewportRef.current;
                if (viewport) viewport.scrollTop = viewport.scrollHeight;
              });
            }}
            aria-label="Message"
            placeholder="Write a message"
            maxLength={2000}
            rows={1}
            className="min-h-11 max-h-28 min-w-0 flex-1 resize-none overflow-y-auto bg-transparent px-2 py-2.5 text-base leading-6 outline-none sm:min-h-10 sm:text-sm"
            />
          </div>
          <Button type="submit" disabled={sending || !message.trim()} size="icon" className="h-11 w-11 shrink-0 bg-transparent text-[var(--brand)] hover:bg-transparent hover:text-[var(--brand-dark)]" aria-label="Send message">
            {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
          </Button>
        </form>
      </section>
    </main>
  );
}
