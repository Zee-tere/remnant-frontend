'use client';

import { useEffect, useRef } from 'react';
import type { RealtimeChannel } from '@supabase/supabase-js';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { conversationsApi } from '@/lib/api';
import { useAuthStore } from '@/lib/auth';
import { getMessagingRealtime } from '@/lib/messaging-realtime';

interface ConversationPreview {
  id: string;
  buyer: { id: string; name: string };
  seller: { id: string; name: string };
  messages: Array<{ id: string; senderId: string; content: string; type: string }>;
}

function rowsFrom(result: unknown): ConversationPreview[] {
  if (Array.isArray(result)) return result as ConversationPreview[];
  if (result && typeof result === 'object' && Array.isArray((result as { conversations?: unknown }).conversations)) {
    return (result as { conversations: ConversationPreview[] }).conversations;
  }
  return [];
}

export function MessageNotifications() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const latestMessageIds = useRef(new Map<string, string>());
  const initialised = useRef(false);
  const viewingMessages = pathname === '/user/dashboard' && searchParams.get('section') === 'messages';

  useEffect(() => {
    if (!isAuthenticated || !user) {
      latestMessageIds.current.clear();
      initialised.current = false;
      return;
    }

    let cancelled = false;
    let channel: RealtimeChannel | null = null;
    let connection: Awaited<ReturnType<typeof getMessagingRealtime>> = null;
    let realtimeConnected = false;

    const refresh = async (notify: boolean) => {
      try {
        const conversations = rowsFrom(await conversationsApi.getConversations(true, 30));
        if (cancelled) return;
        for (const conversation of conversations) {
          const latest = conversation.messages?.at(-1);
          const previousId = latestMessageIds.current.get(conversation.id);
          latestMessageIds.current.set(conversation.id, latest?.id ?? '');
          if (!notify || !initialised.current || !latest || latest.id === previousId || latest.senderId === user.id || viewingMessages) continue;

          const sender = conversation.buyer.id === latest.senderId ? conversation.buyer : conversation.seller;
          const description = latest.type === 'TEXT'
            ? latest.content.slice(0, 110)
            : 'Sent you a new message';
          toast.message(`New message from ${sender.name}`, {
            description,
            duration: 7000,
            action: {
              label: 'Open chat',
              onClick: () => router.push('/user/dashboard?section=messages'),
            },
          });
        }
        initialised.current = true;
        window.dispatchEvent(new Event('remnant:summary-refresh'));
      } catch {
        // Realtime and focus/poll retries keep this unobtrusive when offline.
      }
    };

    const bootstrap = async () => {
      await refresh(false);
      try {
        connection = await getMessagingRealtime();
        if (!connection || cancelled) return;
        channel = await connection.createPrivateChannel(`user:${user.id}`);
        channel.on('broadcast', { event: 'conversation.updated' }, () => void refresh(true));
        channel.subscribe((status) => {
          realtimeConnected = status === 'SUBSCRIBED';
        });
      } catch {
        realtimeConnected = false;
      }
    };

    void bootstrap();
    const poll = window.setInterval(() => {
      if (!realtimeConnected && document.visibilityState === 'visible') void refresh(true);
    }, 20_000);
    const onFocus = () => void refresh(true);
    window.addEventListener('focus', onFocus);

    return () => {
      cancelled = true;
      window.clearInterval(poll);
      window.removeEventListener('focus', onFocus);
      if (channel && connection) void connection.client.removeChannel(channel);
    };
  }, [isAuthenticated, router, user, viewingMessages]);

  return null;
}
