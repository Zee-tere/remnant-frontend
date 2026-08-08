'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { RealtimeChannel } from '@supabase/supabase-js';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowLeft,
  ChevronRight,
  ExternalLink,
  Flag,
  Inbox,
  Loader2,
  MessageSquare,
  MoreVertical,
  PackageOpen,
  Search,
  Send,
  ShieldCheck,
} from 'lucide-react';
import { toast } from 'sonner';
import { NameAvatar } from '@/components/ui/name-avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { conversationsApi } from '@/lib/api';
import { useAuthStore } from '@/lib/auth';
import { getApiErrorMessage } from '@/lib/errors';
import { cn } from '@/lib/utils';
import { DashboardSectionLoading, LoadingState } from '@/components/feedback/LoadingState';
import { useMobileVisualViewport } from '@/hooks/use-mobile-visual-viewport';
import { getMessagingRealtime } from '@/lib/messaging-realtime';

interface ConversationUser {
  id: string;
  name: string;
  avatarUrl: string | null;
  isGuest?: boolean;
}

interface ConversationSummary {
  id: string;
  listing: {
    id: string;
    title: string;
    slug: string;
    images: string[];
  };
  buyer: ConversationUser;
  seller: ConversationUser;
  messages: Message[];
  readState: {
    lastReadSequence: number;
    otherLastReadSequence: number;
  };
  activityAt: string;
  createdAt: string;
}

interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  clientMessageId: string;
  sequence: number;
  type: 'TEXT' | 'IMAGE' | 'OFFER' | 'SYSTEM';
  content: string;
  readAt: string | null;
  createdAt: string;
  clientState?: 'sending';
}

interface ConversationPage {
  conversations: ConversationSummary[];
  hasMore: boolean;
  nextCursor: string | null;
}

interface MessagePage {
  messages: Message[];
  hasMore: boolean;
  previousCursor: number | null;
  nextCursor: number | null;
}

function asConversationRows(data: ConversationPage | ConversationSummary[]) {
  return Array.isArray(data) ? data : data.conversations;
}

function asMessageRows(data: MessagePage | Message[]) {
  return Array.isArray(data) ? data : data.messages;
}

function mergeMessages(current: Message[], incoming: Message[]) {
  const byId = new Map<string, Message>();
  const clientKeyToId = new Map<string, string>();

  for (const message of [...current, ...incoming]) {
    const clientKey = `${message.senderId}:${message.clientMessageId || message.id}`;
    const previousId = clientKeyToId.get(clientKey);
    if (previousId && previousId !== message.id) {
      const previous = byId.get(previousId);
      if (previous?.clientState === 'sending' || !message.clientState) {
        byId.delete(previousId);
      }
    }
    const previous = byId.get(message.id);
    byId.set(
      message.id,
      previous
        ? {
            ...previous,
            ...message,
            readAt: message.readAt ?? previous.readAt,
          }
        : message,
    );
    clientKeyToId.set(clientKey, message.id);
  }

  return [...byId.values()].sort((left, right) => {
    if (left.sequence !== right.sequence) return left.sequence - right.sequence;
    return left.id.localeCompare(right.id);
  });
}

function messageFromBroadcast(event: unknown): Message | null {
  const envelope = event && typeof event === 'object'
    ? event as Record<string, unknown>
    : {};
  const payload = envelope.payload && typeof envelope.payload === 'object'
    ? envelope.payload as Record<string, unknown>
    : envelope;
  const recordCandidate = payload.new ?? payload.record ?? payload;
  const record = recordCandidate && typeof recordCandidate === 'object'
    ? recordCandidate as Record<string, unknown>
    : null;

  if (
    !record ||
    typeof record.id !== 'string' ||
    typeof record.conversationId !== 'string' ||
    typeof record.senderId !== 'string' ||
    typeof record.content !== 'string' ||
    typeof record.sequence !== 'number'
  ) {
    return null;
  }
  return {
    id: record.id,
    conversationId: record.conversationId,
    senderId: record.senderId,
    clientMessageId:
      typeof record.clientMessageId === 'string'
        ? record.clientMessageId
        : record.id,
    sequence: record.sequence,
    type:
      record.type === 'IMAGE' || record.type === 'OFFER' || record.type === 'SYSTEM'
        ? record.type
        : 'TEXT',
    content: record.content,
    readAt: typeof record.readAt === 'string' ? record.readAt : null,
    createdAt:
      typeof record.createdAt === 'string'
        ? record.createdAt
        : new Date().toISOString(),
  };
}

function broadcastPayload(event: unknown) {
  const envelope = event && typeof event === 'object'
    ? event as Record<string, unknown>
    : {};
  return envelope.payload && typeof envelope.payload === 'object'
    ? envelope.payload as Record<string, unknown>
    : envelope;
}

function formatTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' });
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Recently';

  const today = new Date();
  const isToday = date.toDateString() === today.toDateString();
  if (isToday) return formatTime(value);

  return date.toLocaleDateString('en-NG', { month: 'short', day: 'numeric' });
}

function formatMessageDay(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Recently';

  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  if (date.toDateString() === today.toDateString()) return 'Today';
  if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return date.toLocaleDateString('en-NG', { weekday: 'short', month: 'short', day: 'numeric' });
}

function ListingThumbnail({ conversation, size = 'regular' }: { conversation: ConversationSummary; size?: 'small' | 'regular' }) {
  return (
    <div className={cn(
      'relative shrink-0 overflow-hidden rounded-card border border-[var(--line-soft)] bg-[var(--sand)]',
      size === 'small' ? 'h-10 w-10' : 'h-14 w-14',
    )}>
      {conversation.listing.images?.[0] ? (
        <Image
          src={conversation.listing.images[0]}
          alt=""
          fill
          sizes={size === 'small' ? '40px' : '56px'}
          className="object-cover"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-[var(--muted-foreground)]">
          <PackageOpen size={size === 'small' ? 16 : 20} aria-hidden="true" />
        </div>
      )}
    </div>
  );
}

export default function MessagesSection() {
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [loadingMoreConversations, setLoadingMoreConversations] = useState(false);
  const [nextConversationCursor, setNextConversationCursor] = useState<string | null>(null);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [hasEarlierMessages, setHasEarlierMessages] = useState(false);
  const [loadingEarlierMessages, setLoadingEarlierMessages] = useState(false);
  const [realtimeState, setRealtimeState] = useState<'connecting' | 'live' | 'recovering'>('connecting');
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  const messagesViewportRef = useRef<HTMLDivElement>(null);
  const composerRef = useRef<HTMLTextAreaElement>(null);
  const shouldStickToBottomRef = useRef(true);
  const messagesRef = useRef<Message[]>([]);
  const activeChannelRef = useRef<RealtimeChannel | null>(null);
  const typingStopTimerRef = useRef<number | null>(null);
  const lastTypingSentAtRef = useRef(0);
  const mobileViewportStyle = useMobileVisualViewport(true);

  const setMergedMessages = useCallback((incoming: Message[]) => {
    setMessages((current) => {
      const next = mergeMessages(current, incoming);
      messagesRef.current = next;
      return next;
    });
  }, []);

  const loadConversations = useCallback(async (silent = false, cursor?: string) => {
    if (!isAuthenticated) {
      setConversations([]);
      setLoadingConversations(false);
      return;
    }

    if (!silent && !cursor) setLoadingConversations(true);
    if (cursor) setLoadingMoreConversations(true);
    try {
      const data = await conversationsApi.getConversations(silent, 30, cursor);
      const rows = asConversationRows(data);
      setConversations((current) => {
        if (!cursor) return rows;
        const merged = new Map(current.map((conversation) => [conversation.id, conversation]));
        rows.forEach((conversation) => merged.set(conversation.id, conversation));
        return [...merged.values()];
      });
      setNextConversationCursor(Array.isArray(data) ? null : data.nextCursor);
      if (!cursor) {
        setActiveConversationId((current) => current && rows.some((row) => row.id === current) ? current : null);
      }
    } catch (error) {
      if (!silent) {
        setConversations([]);
        toast.error(getApiErrorMessage(error, 'Could not load conversations'));
      }
    } finally {
      if (!silent && !cursor) setLoadingConversations(false);
      if (cursor) setLoadingMoreConversations(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated || !user) {
      void loadConversations();
      return;
    }

    let cancelled = false;
    let channel: RealtimeChannel | null = null;
    let connection: Awaited<ReturnType<typeof getMessagingRealtime>> = null;
    let realtimeConnected = false;
    let refreshTimer: number | null = null;

    const bootstrap = async () => {
      try {
        connection = await getMessagingRealtime();
        if (connection && !cancelled) {
          channel = await connection.createPrivateChannel(`user:${user.id}`);
          channel.on('broadcast', { event: 'conversation.updated' }, () => {
            if (!cancelled) void loadConversations(true);
          });
          await new Promise<void>((resolve) => {
            let resolved = false;
            const timeout = window.setTimeout(() => {
              if (!resolved) resolve();
            }, 1500);
            channel?.subscribe((status) => {
              if (status === 'SUBSCRIBED') {
                realtimeConnected = true;
                if (!resolved) {
                  resolved = true;
                  window.clearTimeout(timeout);
                  resolve();
                }
              } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED') {
                realtimeConnected = false;
              }
            });
          });
          const activeConnection = connection;
          refreshTimer = window.setInterval(() => {
            activeConnection.refreshAuth().catch(() => undefined);
          }, 10 * 60_000);
        }
      } catch {
        realtimeConnected = false;
      }
      if (!cancelled) await loadConversations();
    };

    void bootstrap();
    const refreshWhenActive = () => {
      if (document.visibilityState === 'visible') void loadConversations(true);
    };
    const poll = window.setInterval(() => {
      if (!realtimeConnected) refreshWhenActive();
    }, 15_000);
    window.addEventListener('focus', refreshWhenActive);
    window.addEventListener('online', refreshWhenActive);
    return () => {
      cancelled = true;
      window.clearInterval(poll);
      if (refreshTimer) window.clearInterval(refreshTimer);
      if (channel && connection) void connection.client.removeChannel(channel);
      window.removeEventListener('focus', refreshWhenActive);
      window.removeEventListener('online', refreshWhenActive);
    };
  }, [isAuthenticated, loadConversations, user]);

  useEffect(() => {
    if (!activeConversationId) {
      setMessages([]);
      messagesRef.current = [];
      activeChannelRef.current = null;
      setOtherUserTyping(false);
      return;
    }

    setMessages([]);
    messagesRef.current = [];
    setHasEarlierMessages(false);

    let cancelled = false;
    let channel: RealtimeChannel | null = null;
    let connection: Awaited<ReturnType<typeof getMessagingRealtime>> = null;
    let realtimeConnected = false;
    let bootstrapComplete = false;
    let bufferedMessages: Message[] = [];
    let bufferFlushTimer: number | null = null;
    let readTimer: number | null = null;
    let typingExpiryTimer: number | null = null;
    let highestPendingRead = 0;
    setRealtimeState('connecting');

    const markReadSoon = (sequence: number) => {
      highestPendingRead = Math.max(highestPendingRead, sequence);
      if (readTimer) window.clearTimeout(readTimer);
      readTimer = window.setTimeout(() => {
        const target = highestPendingRead;
        conversationsApi.markAsRead(activeConversationId, target).then(() => {
          setConversations((current) => current.map((conversation) =>
            conversation.id === activeConversationId
              ? {
                  ...conversation,
                  readState: { ...conversation.readState, lastReadSequence: Math.max(conversation.readState.lastReadSequence, target) },
                }
              : conversation,
          ));
          window.dispatchEvent(new Event('remnant:summary-refresh'));
        }).catch(() => undefined);
      }, 300);
    };

    const applyIncoming = (rows: Message[]) => {
      if (rows.length === 0) return;
      setMergedMessages(rows);
      const latestIncoming = [...rows].reverse().find((message) => message.senderId !== user?.id);
      if (latestIncoming) markReadSoon(latestIncoming.sequence);
    };

    const catchUp = async (silent = true) => {
      const afterSequence = messagesRef.current.reduce(
        (maximum, message) => message.clientState ? maximum : Math.max(maximum, message.sequence),
        0,
      );
      if (!silent) setLoadingMessages(true);
      try {
        const data = await conversationsApi.getMessages(activeConversationId, {
          ...(afterSequence > 0 ? { afterSequence } : {}),
          limit: 50,
          background: silent,
        });
        if (!cancelled) {
          const rows = asMessageRows(data);
          if (afterSequence === 0 && !Array.isArray(data)) {
            setHasEarlierMessages(data.hasMore);
          }
          applyIncoming(rows);
          const latest = rows.at(-1);
          if (latest) markReadSoon(latest.sequence);
        }
      } catch (error) {
        if (!cancelled && !silent) {
          setMessages([]);
          toast.error(getApiErrorMessage(error, 'Could not load messages'));
        }
      } finally {
        if (!cancelled && !silent) setLoadingMessages(false);
      }
    };

    const bootstrap = async () => {
      try {
        connection = await getMessagingRealtime();
        if (connection && !cancelled) {
          channel = await connection.createPrivateChannel(`conversation:${activeConversationId}`);
          activeChannelRef.current = channel;
          channel
            .on('broadcast', { event: 'INSERT' }, (event) => {
              const message = messageFromBroadcast(event);
              if (!message || message.conversationId !== activeConversationId) return;
              if (!bootstrapComplete) bufferedMessages.push(message);
              else applyIncoming([message]);
            })
            .on('broadcast', { event: 'read.position.updated' }, (event) => {
              const payload = broadcastPayload(event);
              const readerId = typeof payload.readerId === 'string' ? payload.readerId : null;
              const lastReadSequence = typeof payload.lastReadSequence === 'number' ? payload.lastReadSequence : null;
              const readAt = typeof payload.readAt === 'string' ? payload.readAt : new Date().toISOString();
              if (!readerId || lastReadSequence === null) return;
              setMessages((current) => {
                const next = current.map((message) =>
                  message.senderId !== readerId && message.sequence <= lastReadSequence
                    ? { ...message, readAt: message.readAt ?? readAt }
                    : message,
                );
                messagesRef.current = next;
                return next;
              });
              setConversations((current) => current.map((conversation) =>
                conversation.id === activeConversationId
                  ? {
                      ...conversation,
                      readState: readerId === user?.id
                        ? { ...conversation.readState, lastReadSequence }
                        : { ...conversation.readState, otherLastReadSequence: lastReadSequence },
                    }
                  : conversation,
              ));
            })
            .on('broadcast', { event: 'typing' }, (event) => {
              const payload = broadcastPayload(event);
              if (payload.userId === user?.id) return;
              const isTyping = payload.isTyping === true;
              setOtherUserTyping(isTyping);
              if (typingExpiryTimer) window.clearTimeout(typingExpiryTimer);
              if (isTyping) {
                typingExpiryTimer = window.setTimeout(() => setOtherUserTyping(false), 3000);
              }
            });

          await new Promise<void>((resolve) => {
            let joined = false;
            const timeout = window.setTimeout(resolve, 1500);
            channel?.subscribe((status) => {
              if (status === 'SUBSCRIBED') {
                const reconnecting = !realtimeConnected && bootstrapComplete;
                realtimeConnected = true;
                setRealtimeState('live');
                if (!joined) {
                  joined = true;
                  window.clearTimeout(timeout);
                  resolve();
                } else if (reconnecting) {
                  void catchUp(true);
                }
              } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED') {
                realtimeConnected = false;
                if (!cancelled) setRealtimeState('recovering');
              }
            });
          });
        }
      } catch {
        realtimeConnected = false;
        if (!cancelled) setRealtimeState('recovering');
      }

      bufferFlushTimer = window.setTimeout(() => {
        if (!bootstrapComplete && bufferedMessages.length > 0) {
          applyIncoming(bufferedMessages);
          bufferedMessages = [];
        }
      }, 5000);
      await catchUp(false);
      bootstrapComplete = true;
      if (bufferFlushTimer) window.clearTimeout(bufferFlushTimer);
      applyIncoming(bufferedMessages);
      bufferedMessages = [];
    };

    void bootstrap();
    const refreshWhenActive = () => {
      if (document.visibilityState === 'visible') void catchUp(true);
    };
    const poll = window.setInterval(() => {
      if (!realtimeConnected) refreshWhenActive();
    }, 15_000);
    const tokenRefresh = window.setInterval(() => {
      connection?.refreshAuth().catch(() => undefined);
    }, 10 * 60_000);
    window.addEventListener('focus', refreshWhenActive);
    window.addEventListener('online', refreshWhenActive);
    return () => {
      cancelled = true;
      window.clearInterval(poll);
      window.clearInterval(tokenRefresh);
      if (bufferFlushTimer) window.clearTimeout(bufferFlushTimer);
      if (readTimer) window.clearTimeout(readTimer);
      if (typingExpiryTimer) window.clearTimeout(typingExpiryTimer);
      if (typingStopTimerRef.current) window.clearTimeout(typingStopTimerRef.current);
      if (channel && connection) void connection.client.removeChannel(channel);
      if (activeChannelRef.current === channel) activeChannelRef.current = null;
      window.removeEventListener('focus', refreshWhenActive);
      window.removeEventListener('online', refreshWhenActive);
    };
  }, [activeConversationId, setMergedMessages, user?.id]);

  useEffect(() => {
    const viewport = messagesViewportRef.current;
    if (!viewport || (!shouldStickToBottomRef.current && messages.at(-1)?.senderId !== user?.id)) {
      return;
    }
    const frame = window.requestAnimationFrame(() => {
      viewport.scrollTop = viewport.scrollHeight;
    });
    return () => window.cancelAnimationFrame(frame);
  }, [messages, activeConversationId, user?.id]);

  useEffect(() => {
    const composer = composerRef.current;
    if (!composer) return;
    composer.style.height = '0px';
    composer.style.height = `${Math.min(112, Math.max(44, composer.scrollHeight))}px`;
  }, [newMessage]);

  useEffect(() => {
    if (!activeConversationId || !shouldStickToBottomRef.current) return;
    const frame = window.requestAnimationFrame(() => {
      const viewport = messagesViewportRef.current;
      if (viewport) viewport.scrollTop = viewport.scrollHeight;
    });
    return () => window.cancelAnimationFrame(frame);
  }, [activeConversationId, mobileViewportStyle]);

  const activeConversation = conversations.find((conversation) => conversation.id === activeConversationId) ?? null;

  const getOtherUser = useCallback(
    (conversation: ConversationSummary) => {
      if (!user) return conversation.seller;
      return conversation.buyer.id === user.id ? conversation.seller : conversation.buyer;
    },
    [user],
  );

  const filteredConversations = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return conversations.filter((conversation) => {
      const otherUser = getOtherUser(conversation);
      const latest = conversation.messages[0];
      const unread = Boolean(
        latest &&
        latest.senderId !== user?.id &&
        latest.sequence > conversation.readState.lastReadSequence,
      );
      const matchesQuery =
        !query ||
        otherUser.name.toLowerCase().includes(query) ||
        conversation.listing.title.toLowerCase().includes(query) ||
        latest?.content.toLowerCase().includes(query);

      return matchesQuery && (filter === 'all' || unread);
    });
  }, [conversations, filter, getOtherUser, searchQuery, user?.id]);

  const handleSelectConversation = (conversationId: string) => {
    shouldStickToBottomRef.current = true;
    setActiveConversationId(conversationId);
    setConversations((current) =>
      current.map((conversation) =>
        conversation.id === conversationId
          ? {
              ...conversation,
              readState: {
                ...conversation.readState,
                lastReadSequence: Math.max(
                  conversation.readState.lastReadSequence,
                  conversation.messages[0]?.sequence ?? 0,
                ),
              },
            }
          : conversation,
      ),
    );
  };

  const sendTyping = (isTyping: boolean) => {
    const channel = activeChannelRef.current;
    if (!channel || !user) return;
    void channel.send({
      type: 'broadcast',
      event: 'typing',
      payload: { userId: user.id, isTyping },
    });
  };

  const handleMessageChange = (value: string) => {
    setNewMessage(value);
    const now = Date.now();
    if (value.trim() && now - lastTypingSentAtRef.current > 1200) {
      lastTypingSentAtRef.current = now;
      sendTyping(true);
    }
    if (typingStopTimerRef.current) window.clearTimeout(typingStopTimerRef.current);
    typingStopTimerRef.current = window.setTimeout(() => sendTyping(false), 1800);
  };

  const loadEarlierMessages = async () => {
    if (!activeConversationId || loadingEarlierMessages) return;
    const oldestSequence = messagesRef.current.find((message) => !message.clientState)?.sequence;
    if (!oldestSequence) return;

    const viewport = messagesViewportRef.current;
    const previousHeight = viewport?.scrollHeight ?? 0;
    setLoadingEarlierMessages(true);
    try {
      const data = await conversationsApi.getMessages(activeConversationId, {
        beforeSequence: oldestSequence,
        limit: 50,
        background: true,
      });
      const rows = asMessageRows(data);
      setMergedMessages(rows);
      setHasEarlierMessages(Array.isArray(data) ? false : data.hasMore);
      window.requestAnimationFrame(() => {
        if (viewport) viewport.scrollTop += viewport.scrollHeight - previousHeight;
      });
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Could not load earlier messages'));
    } finally {
      setLoadingEarlierMessages(false);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !activeConversationId || !user) return;

    const content = newMessage.trim();
    const clientMessageId = crypto.randomUUID();
    const temporaryId = `pending-${clientMessageId}`;
    const optimisticSequence = messagesRef.current.reduce(
      (maximum, message) => Math.max(maximum, message.sequence),
      0,
    ) + 1;
    const optimisticMessage: Message = {
      id: temporaryId,
      conversationId: activeConversationId,
      senderId: user.id,
      clientMessageId,
      sequence: optimisticSequence,
      type: 'TEXT',
      content,
      readAt: null,
      createdAt: new Date().toISOString(),
      clientState: 'sending',
    };

    shouldStickToBottomRef.current = true;
    setSending(true);
    setNewMessage('');
    sendTyping(false);
    setMergedMessages([optimisticMessage]);
    setConversations((current) =>
      current.map((conversation) =>
        conversation.id === activeConversationId
          ? { ...conversation, messages: [optimisticMessage] }
          : conversation,
      ),
    );

    try {
      let message: Message;
      try {
        message = await conversationsApi.createMessage(activeConversationId, content, 'TEXT', clientMessageId);
      } catch {
        await new Promise((resolve) => window.setTimeout(resolve, 500));
        message = await conversationsApi.createMessage(activeConversationId, content, 'TEXT', clientMessageId);
      }
      setMergedMessages([message]);
      setConversations((current) =>
        current.map((conversation) =>
          conversation.id === activeConversationId ? { ...conversation, messages: [message] } : conversation,
        ),
      );
    } catch (error) {
      setMessages((current) => {
        const next = current.filter((message) => message.clientMessageId !== clientMessageId);
        messagesRef.current = next;
        return next;
      });
      toast.error(getApiErrorMessage(error, 'Could not send message'));
      setNewMessage((current) => current || content);
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  if (loadingConversations) {
    return <DashboardSectionLoading label="Loading your conversations" />;
  }

  const unreadConversationCount = conversations.filter((conversation) => {
    const latest = conversation.messages[0];
    return Boolean(
      latest &&
      latest.senderId !== user?.id &&
      latest.sequence > conversation.readState.lastReadSequence,
    );
  }).length;

  const ConversationList = () => (
    <div className="flex h-full min-h-0 flex-col bg-white">
      <div className="border-b border-[var(--line-soft)] px-4 pb-4 pt-[calc(1rem+var(--safe-area-top))] md:px-5 md:pb-5 md:pt-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-[1.35rem] font-bold tracking-[-0.025em] text-foreground md:text-2xl">Inbox</h1>
              {unreadConversationCount > 0 && (
                <span className="rounded-pill bg-[var(--brand)] px-2 py-0.5 text-xs font-black text-white">
                  {unreadConversationCount} new
                </span>
              )}
            </div>
            <p className="mt-0.5 text-xs font-medium text-muted-foreground">Your buying, selling and trade conversations</p>
          </div>
          <span className="pt-1 text-xs font-semibold tabular-nums text-muted-foreground">
            {conversations.length}
          </span>
        </div>

        <div className="relative mt-4">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} aria-hidden="true" />
          <Input
            aria-label="Search conversations"
            placeholder="Search a person, item or message"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            className="h-11 bg-[var(--sand)] pl-10 pr-3 text-base shadow-none md:text-sm"
          />
        </div>

        <div className="mt-3 flex gap-2" aria-label="Conversation filters">
          {(['all', 'unread'] as const).map((filterType) => (
            <button
              key={filterType}
              type="button"
              onClick={() => setFilter(filterType)}
              aria-pressed={filter === filterType}
              className={cn(
                'min-h-9 rounded-pill border px-3 text-xs font-bold transition-colors',
                filter === filterType
                  ? 'border-[var(--brand)] bg-[var(--brand)] text-white'
                  : 'border-[var(--line-soft)] bg-white text-[var(--ink-soft)] hover:border-[var(--brand)]/40',
              )}
            >
              {filterType === 'all' ? 'All conversations' : `Unread${unreadConversationCount ? ` (${unreadConversationCount})` : ''}`}
            </button>
          ))}
        </div>
      </div>

      <div className="min-h-0 flex-1 touch-pan-y overflow-y-auto overscroll-contain">
        {filteredConversations.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center px-7 py-12 text-center">
            <div className="icon-frame mb-4 h-14 w-14 bg-[var(--brand-soft)] text-[var(--brand)]" data-preserve-icon-frame>
              <Inbox size={25} aria-hidden="true" />
            </div>
            <h3 className="font-bold text-foreground">
              {filter === 'unread' ? 'You are all caught up' : searchQuery ? 'Nothing matches that search' : 'No conversations yet'}
            </h3>
            <p className="mt-2 max-w-[17rem] text-sm leading-6 text-muted-foreground">
              {filter === 'unread'
                ? 'New replies will appear here.'
                : searchQuery
                  ? 'Try a person’s name or the title of an item.'
                  : 'When you ask about a listing—or someone asks about yours—the conversation will appear here.'}
            </p>
          </div>
        ) : (
          <div className="py-1.5">
            {filteredConversations.map((conversation) => {
              const otherUser = getOtherUser(conversation);
              const latest = conversation.messages[0];
              const unread = Boolean(
                latest &&
                latest.senderId !== user?.id &&
                latest.sequence > conversation.readState.lastReadSequence,
              );
              const selected = activeConversationId === conversation.id;

              return (
                <button
                  key={conversation.id}
                  type="button"
                  onClick={() => handleSelectConversation(conversation.id)}
                  className={cn(
                    'relative mx-1.5 flex w-[calc(100%-0.75rem)] items-start gap-3 rounded-card px-2.5 py-3 text-left transition-colors md:mx-2 md:w-[calc(100%-1rem)] md:px-3',
                    selected ? 'bg-[var(--brand-soft)]' : 'hover:bg-[var(--sand)]',
                  )}
                >
                  {selected && <span className="absolute inset-y-3 left-0 w-1 rounded-pill bg-[var(--brand)]" aria-hidden="true" />}
                  <div className="relative shrink-0">
                    <ListingThumbnail conversation={conversation} />
                    <NameAvatar name={otherUser.name} className="absolute -bottom-1 -right-1 h-6 w-6 border-2 border-white text-xs" />
                  </div>
                  <div className="min-w-0 flex-1 py-0.5">
                    <div className="flex items-center justify-between gap-2">
                      <p className={cn('truncate text-sm text-foreground', unread ? 'font-black' : 'font-bold')}>{otherUser.name}</p>
                      <span className={cn('shrink-0 text-xs tabular-nums', unread ? 'font-bold text-[var(--brand)]' : 'text-muted-foreground')}>
                        {latest ? formatDate(latest.createdAt) : formatDate(conversation.createdAt)}
                      </span>
                    </div>
                    <p className="mt-0.5 truncate text-xs font-semibold text-[var(--ink-soft)]">{conversation.listing.title}</p>
                    <div className="mt-1.5 flex items-center gap-2">
                      <p className={cn('min-w-0 flex-1 truncate text-xs', unread ? 'font-bold text-foreground' : 'text-muted-foreground')}>
                        {latest ? `${latest.senderId === user?.id ? 'You: ' : ''}${latest.content}` : 'Conversation started'}
                      </p>
                      {unread && <span className="h-2.5 w-2.5 shrink-0 rounded-pill bg-[var(--brand)]" aria-label="Unread" />}
                    </div>
                  </div>
                </button>
              );
            })}
            {nextConversationCursor && (
              <div className="flex justify-center p-3">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={loadingMoreConversations}
                  onClick={() => void loadConversations(true, nextConversationCursor)}
                  className="text-xs text-muted-foreground"
                >
                  {loadingMoreConversations ? 'Loading…' : 'Load more conversations'}
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );

  const ChatWindow = () => {
    if (!activeConversation) {
      return (
        <div className="relative flex h-full min-h-[420px] flex-col items-center justify-center overflow-hidden bg-[var(--brand-soft)] px-6 text-center">
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/70" aria-hidden="true" />
          <div className="absolute -bottom-32 -left-20 h-72 w-72 rounded-full bg-[var(--aqua-soft)]/70" aria-hidden="true" />
          <div className="relative icon-frame mb-5 h-16 w-16 bg-white text-[var(--brand)] soft-shadow" data-preserve-icon-frame>
            <MessageSquare size={29} aria-hidden="true" />
          </div>
          <h2 className="relative text-xl font-bold tracking-[-0.025em] text-foreground">Pick up where you left off</h2>
          <p className="relative mt-2 max-w-sm text-sm leading-6 text-muted-foreground">
            Choose a conversation to discuss the item, arrange collection, or agree on the next step.
          </p>
          <div className="relative mt-6 flex items-center gap-2 text-xs font-semibold text-[var(--brand)]">
            <ShieldCheck size={16} aria-hidden="true" />
            Keep payment and verification codes private
          </div>
        </div>
      );
    }

    const otherUser = getOtherUser(activeConversation);
    const isGuestHandoff = otherUser.isGuest === true;

    return (
      <div className="flex h-full min-h-0 flex-col overflow-hidden bg-white">
        <div className="shrink-0 border-b border-[var(--line-soft)] bg-white pt-[var(--safe-area-top)] md:pt-0">
          <div className="flex min-h-16 items-center justify-between gap-3 px-2 py-2 md:px-5">
          <div className="flex min-w-0 items-center gap-3">
            <button type="button" onClick={() => setActiveConversationId(null)} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-control text-[var(--foreground)] hover:bg-[var(--sand)] hover:text-[var(--brand)] md:hidden" aria-label="Back to inbox">
              <ArrowLeft size={19} />
            </button>
            <NameAvatar name={otherUser.name} className="h-10 w-10 text-sm" />
            <div className="min-w-0">
              <h2 className="truncate text-sm font-bold text-foreground md:text-base">{otherUser.name}</h2>
              <p className={cn(
                'mt-0.5 flex items-center gap-1.5 truncate text-xs',
                otherUserTyping ? 'font-medium text-[var(--brand)]' : 'text-muted-foreground',
              )}>
                {!otherUserTyping && <span className={cn('h-1.5 w-1.5 rounded-pill', realtimeState === 'live' ? 'bg-[var(--state-success)]' : 'bg-[var(--state-pending)]')} aria-hidden="true" />}
                {otherUserTyping ? 'Typing…' : realtimeState === 'live' ? 'Messages update live' : realtimeState === 'recovering' ? 'Reconnecting…' : 'Connecting…'}
              </p>
              <span className="sr-only">
                {realtimeState === 'live' ? 'Live messaging connected' : realtimeState === 'recovering' ? 'Reconnecting live messaging' : 'Connecting live messaging'}
              </span>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button type="button" variant="ghost" size="icon" aria-label="Conversation options">
                <MoreVertical size={18} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href={`/marketplace/${activeConversation.listing.slug || activeConversation.listing.id}`}>
                  <ExternalLink size={16} className="mr-2" />
                  View listing
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <a
                  href={`mailto:support@remnantmarket.co?subject=${encodeURIComponent(
                    `Conversation report: ${activeConversation.id}`,
                  )}`}
                >
                  <Flag size={16} className="mr-2" />
                  Report conversation
                </a>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          </div>

          <Link
            href={`/marketplace/${activeConversation.listing.slug || activeConversation.listing.id}`}
            className="group flex items-center gap-3 border-t border-[var(--line-soft)] bg-[var(--sand)]/70 px-4 py-2.5 transition-colors hover:bg-[var(--brand-soft)] md:px-5"
          >
            <ListingThumbnail conversation={activeConversation} size="small" />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-black uppercase tracking-[0.08em] text-[var(--brand)]">About this listing</p>
              <p className="truncate text-sm font-bold text-foreground">{activeConversation.listing.title}</p>
            </div>
            <span className="hidden text-xs font-bold text-[var(--brand)] sm:inline">View listing</span>
            <ChevronRight size={16} className="shrink-0 text-[var(--brand)] transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
          </Link>
        </div>

        <div
          ref={messagesViewportRef}
          onScroll={(event) => {
            const viewport = event.currentTarget;
            const distanceFromBottom =
              viewport.scrollHeight - viewport.scrollTop - viewport.clientHeight;
            shouldStickToBottomRef.current = distanceFromBottom < 96;
          }}
          className="min-h-0 flex-1 touch-pan-y overflow-y-auto overscroll-contain bg-[#f7f8f6] px-3 py-4 [overflow-anchor:none] [scrollbar-gutter:stable] md:px-6 md:py-5"
        >
          {loadingMessages ? (
            <LoadingState label="Loading messages" compact className="h-full" />
          ) : messages.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center px-6 text-center">
              <div className="icon-frame mb-4 h-14 w-14 bg-white text-[var(--brand)]" data-preserve-icon-frame>
                <MessageSquare size={24} aria-hidden="true" />
              </div>
              <p className="font-bold text-foreground">Start the conversation</p>
              <p className="mt-1.5 max-w-xs text-sm leading-6 text-muted-foreground">Ask about the condition, availability, or a convenient handover.</p>
            </div>
          ) : (
            <div className="mx-auto max-w-3xl">
              {hasEarlierMessages && (
                <div className="flex justify-center pb-3">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={loadingEarlierMessages}
                    onClick={loadEarlierMessages}
                    className="text-xs text-muted-foreground"
                  >
                    {loadingEarlierMessages ? 'Loading…' : 'Load earlier messages'}
                  </Button>
                </div>
              )}
              {messages.map((message, index) => {
                const mine = message.senderId === user?.id;
                const previousMessage = messages[index - 1];
                const nextMessage = messages[index + 1];
                const showDay = !previousMessage || new Date(previousMessage.createdAt).toDateString() !== new Date(message.createdAt).toDateString();
                const endsGroup = !nextMessage || nextMessage.senderId !== message.senderId;

                if (message.type === 'SYSTEM') {
                  return (
                    <div key={message.id} className="py-3 text-center">
                      <span className="rounded-pill bg-white px-3 py-1.5 text-xs font-semibold text-muted-foreground shadow-sm">{message.content}</span>
                    </div>
                  );
                }

                return (
                  <div key={message.id}>
                    {showDay && (
                      <div className="flex items-center gap-3 py-4" aria-label={formatMessageDay(message.createdAt)}>
                        <span className="h-px flex-1 bg-[var(--line-soft)]" />
                        <span className="text-xs font-bold uppercase tracking-[0.08em] text-muted-foreground">{formatMessageDay(message.createdAt)}</span>
                        <span className="h-px flex-1 bg-[var(--line-soft)]" />
                      </div>
                    )}
                    <div className={cn('flex items-end gap-2', endsGroup ? 'mb-3' : 'mb-1', mine ? 'justify-end' : 'justify-start')}>
                      {!mine && (
                        endsGroup
                          ? <NameAvatar name={otherUser.name} className="h-7 w-7 shrink-0 text-xs" />
                          : <span className="w-7 shrink-0" aria-hidden="true" />
                      )}
                      <div
                        className={cn(
                          'max-w-[82%] px-3.5 py-2.5 text-sm leading-5 shadow-[0_1px_1px_rgba(20,33,28,0.04)] md:max-w-[70%]',
                          mine
                            ? 'rounded-card rounded-br-[5px] bg-[var(--brand)] text-white'
                            : 'rounded-card rounded-bl-[5px] border border-[var(--line-soft)] bg-white text-foreground',
                        )}
                      >
                        <p className="whitespace-pre-wrap break-words">{message.content}</p>
                        <p className={cn('mt-1.5 text-xs tabular-nums', mine ? 'text-white/70' : 'text-muted-foreground')}>
                          {message.clientState === 'sending'
                            ? 'Sending…'
                            : `${formatTime(message.createdAt)}${mine && message.readAt ? ' · Read' : ''}`}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {isGuestHandoff ? (
          <div className="shrink-0 border-t border-[var(--line-soft)] bg-white px-4 pb-[calc(0.85rem+var(--safe-area-bottom))] pt-3 md:p-4">
            <p className="text-sm font-bold text-[var(--foreground)]">Continue outside Remnant</p>
            <p className="mt-1 text-xs leading-5 text-[var(--ink-soft)]">This buyer sent a guest offer. Use the contact detail in their offer above to reply on the platform they chose.</p>
          </div>
        ) : <div className="shrink-0 border-t border-[var(--line-soft)] bg-white px-3 pb-[calc(0.6rem+var(--safe-area-bottom))] pt-2.5 md:px-5 md:pb-4 md:pt-3">
          <div className="mx-auto max-w-3xl">
          <div className="flex items-end gap-2 rounded-card border border-[var(--input)] bg-white p-1.5 shadow-[0_2px_10px_rgba(20,33,28,0.06)] transition-[border-color,box-shadow] focus-within:border-[var(--brand)] focus-within:shadow-[0_0_0_3px_var(--brand-muted)]">
            <textarea
              ref={composerRef}
              aria-label="Message"
              placeholder={`Message ${otherUser.name}`}
              value={newMessage}
              onChange={(event) => handleMessageChange(event.target.value)}
              onBlur={() => sendTyping(false)}
              onKeyDown={handleKeyDown}
              onFocus={() => {
                if (!shouldStickToBottomRef.current) return;
                window.requestAnimationFrame(() => {
                  const viewport = messagesViewportRef.current;
                  if (viewport) viewport.scrollTop = viewport.scrollHeight;
                });
              }}
              enterKeyHint="send"
              maxLength={2000}
              rows={1}
              className="min-h-11 max-h-28 flex-1 resize-none overflow-y-auto bg-transparent px-2.5 py-2.5 text-base leading-6 outline-none placeholder:text-muted-foreground md:min-h-10 md:py-2 md:text-sm md:leading-5"
            />
            <Button
              type="button"
              onClick={handleSendMessage}
              disabled={!newMessage.trim() || sending}
              size="icon"
              aria-label={sending ? 'Sending message' : 'Send message'}
              className="h-11 w-11 shrink-0 bg-[var(--brand)] text-white hover:bg-[var(--brand-dark)] md:h-10 md:w-10"
            >
              {sending ? <Loader2 className="animate-spin" size={17} /> : <Send size={17} />}
            </Button>
          </div>
          <p className="mt-2 flex items-center justify-center gap-1.5 text-xs font-medium text-muted-foreground">
            <ShieldCheck size={13} className="text-[var(--brand)]" aria-hidden="true" />
            Never share verification codes or pay before you are comfortable.
          </p>
          </div>
        </div>}
      </div>
    );
  };

  return (
    <div className="md:h-full">
      <div
        style={mobileViewportStyle}
        className="fixed inset-0 z-[80] grid h-dvh min-h-[280px] grid-cols-1 overflow-hidden bg-white md:static md:z-auto md:h-[calc(100dvh-4rem)] md:max-h-[860px] md:min-h-[640px] md:grid-cols-[minmax(18rem,21.5rem)_minmax(0,1fr)] md:transform-none md:rounded-surface md:border md:border-[var(--border)]/80 md:soft-shadow lg:h-[calc(100dvh-5rem)]"
      >
        <div className={cn('min-h-0 border-b border-[var(--border)]/70 md:block md:border-b-0 md:border-r', activeConversationId ? 'hidden' : 'block')}>
          {ConversationList()}
        </div>
        <div className={cn('min-h-0 md:block', activeConversationId ? 'block' : 'hidden')}>
          {ChatWindow()}
        </div>
      </div>
    </div>
  );
}
