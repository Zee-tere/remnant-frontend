"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AlertTriangle, ArrowLeft, Loader2, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { conversationsApi } from "@/lib/api";
import { writeSessionValue } from "@/lib/browser-storage";

interface GuestConversationRow {
  id: string;
  listing: { id: string; title: string; slug?: string };
  buyerId: string;
  sellerId: string;
  buyer: { id: string; name: string };
  seller: { id: string; name: string };
  messages: Array<{ content: string; createdAt: string }>;
  activityAt: string;
}

export default function GuestMessagesInboxPage() {
  const [token, setToken] = useState("");
  const [conversations, setConversations] = useState<GuestConversationRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let identityToken = "";
    try {
      identityToken = window.localStorage.getItem("remnant-guest-identity") || "";
    } catch {
      // The empty state below explains how to return through a private listing link.
    }
    setToken(identityToken);
    if (!identityToken) {
      setLoading(false);
      return;
    }
    conversationsApi.getGuestConversations(identityToken)
      .then((result) => setConversations(Array.isArray(result) ? result : result.conversations ?? []))
      .catch(() => setConversations([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <main className="flex min-h-[65dvh] items-center justify-center"><Loader2 className="animate-spin text-[var(--brand)]" aria-label="Loading messages" /></main>;
  }

  if (!token) {
    return (
      <main className="mx-auto flex min-h-[65dvh] max-w-lg flex-col items-center justify-center px-5 text-center">
        <AlertTriangle size={40} className="text-amber-600" />
        <h1 className="mt-4 text-2xl font-bold">Private guest link required</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--ink-soft)]">Open the private management link created with your guest listing. It restores access without creating an account.</p>
        <Button asChild className="mt-6 bg-[var(--brand)] text-white"><Link href="/marketplace">Back to marketplace</Link></Button>
      </main>
    );
  }

  return (
    <main className="mx-auto min-h-[70dvh] max-w-2xl px-4 py-8 sm:py-12">
      <Link href="/marketplace" className="inline-flex items-center gap-2 text-sm font-bold text-[var(--brand)]"><ArrowLeft size={16} /> Marketplace</Link>
      <h1 className="mt-5 text-3xl font-bold">Guest messages</h1>
      <p className="mt-2 text-sm text-[var(--ink-soft)]">Available in this browser through your private guest key. No account is required.</p>

      {conversations.length === 0 ? (
        <div className="mt-8 rounded-card border border-[var(--border)] p-8 text-center">
          <MessageSquare className="mx-auto text-[var(--brand)]" size={36} />
          <h2 className="mt-3 text-lg font-bold">No messages yet</h2>
          <p className="mt-1 text-sm text-[var(--ink-soft)]">Buyer conversations about your guest listings will appear here.</p>
        </div>
      ) : (
        <div className="mt-7 divide-y divide-[var(--border)] overflow-hidden rounded-card border border-[var(--border)]">
          {conversations.map((conversation) => {
            const latest = conversation.messages[0];
            return (
              <Link
                key={conversation.id}
                href={`/guest/messages/${conversation.id}`}
                onClick={() => writeSessionValue(`remnant-guest-conversation:${conversation.id}`, token)}
                className="block bg-white px-4 py-4 transition-colors hover:bg-[var(--brand-soft)]"
              >
                <div className="flex items-center justify-between gap-3">
                  <h2 className="truncate font-bold">{conversation.listing.title}</h2>
                  <time className="shrink-0 text-xs text-[var(--muted-foreground)]">{new Date(conversation.activityAt).toLocaleDateString("en-NG", { month: "short", day: "numeric" })}</time>
                </div>
                <p className="mt-1 line-clamp-1 text-sm text-[var(--ink-soft)]">{latest?.content ?? "Conversation started"}</p>
              </Link>
            );
          })}
        </div>
      )}
    </main>
  );
}
