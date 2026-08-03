'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  ExternalLink,
  Flag,
  Loader2,
  MessageSquare,
  MoreVertical,
  Search,
  Send,
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
  createdAt: string;
}

interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  type: 'TEXT' | 'IMAGE' | 'OFFER' | 'SYSTEM';
  content: string;
  readAt: string | null;
  createdAt: string;
  clientState?: 'sending';
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
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const messagesViewportRef = useRef<HTMLDivElement>(null);
  const composerRef = useRef<HTMLTextAreaElement>(null);
  const shouldStickToBottomRef = useRef(true);
  const mobileViewportStyle = useMobileVisualViewport(true);

  const loadConversations = useCallback(async (silent = false) => {
    if (!isAuthenticated) {
      setConversations([]);
      setLoadingConversations(false);
      return;
    }

    if (!silent) setLoadingConversations(true);
    try {
      const data = await conversationsApi.getConversations(silent);
      const rows = Array.isArray(data) ? data : [];
      setConversations(rows);
      setActiveConversationId((current) => current && rows.some((row) => row.id === current) ? current : null);
    } catch (error) {
      if (!silent) {
        setConversations([]);
        toast.error(getApiErrorMessage(error, 'Could not load conversations'));
      }
    } finally {
      if (!silent) setLoadingConversations(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    loadConversations();
    const refreshWhenActive = () => {
      if (document.visibilityState === 'visible') void loadConversations(true);
    };
    const poll = window.setInterval(refreshWhenActive, 12000);
    window.addEventListener('focus', refreshWhenActive);
    window.addEventListener('online', refreshWhenActive);
    return () => {
      window.clearInterval(poll);
      window.removeEventListener('focus', refreshWhenActive);
      window.removeEventListener('online', refreshWhenActive);
    };
  }, [loadConversations]);

  useEffect(() => {
    if (!activeConversationId) {
      setMessages([]);
      return;
    }

    let cancelled = false;

    const loadMessages = async (silent = false) => {
      if (!silent) setLoadingMessages(true);
      try {
        const data = await conversationsApi.getMessages(activeConversationId, silent);
        if (!cancelled) {
          const rows = Array.isArray(data) ? data : [];
          setMessages((current) => {
            const pending = current.filter((message) => message.clientState === 'sending');
            const nextRows = [
              ...rows,
              ...pending.filter((message) => !rows.some((row) => row.id === message.id)),
            ];
            const unchanged =
              current.length === nextRows.length &&
              current.every((message, index) => {
                const next = nextRows[index];
                return (
                  message.id === next?.id &&
                  message.content === next.content &&
                  message.readAt === next.readAt &&
                  message.clientState === next.clientState
                );
              });
            return unchanged ? current : nextRows;
          });
          conversationsApi.markAsRead(activeConversationId).catch(() => undefined);
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

    loadMessages();
    const refreshWhenActive = () => {
      if (document.visibilityState === 'visible') void loadMessages(true);
    };
    const poll = window.setInterval(refreshWhenActive, 12000);
    window.addEventListener('focus', refreshWhenActive);
    window.addEventListener('online', refreshWhenActive);
    return () => {
      cancelled = true;
      window.clearInterval(poll);
      window.removeEventListener('focus', refreshWhenActive);
      window.removeEventListener('online', refreshWhenActive);
    };
  }, [activeConversationId]);

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
      const unread = Boolean(latest && latest.senderId !== user?.id && !latest.readAt);
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
              messages: conversation.messages.map((message) =>
                user && message.senderId !== user.id ? { ...message, readAt: message.readAt ?? new Date().toISOString() } : message,
              ),
            }
          : conversation,
      ),
    );
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !activeConversationId || !user) return;

    const content = newMessage.trim();
    const temporaryId = `pending-${crypto.randomUUID()}`;
    const optimisticMessage: Message = {
      id: temporaryId,
      conversationId: activeConversationId,
      senderId: user.id,
      type: 'TEXT',
      content,
      readAt: null,
      createdAt: new Date().toISOString(),
      clientState: 'sending',
    };

    shouldStickToBottomRef.current = true;
    setSending(true);
    setNewMessage('');
    setMessages((current) => [...current, optimisticMessage]);
    setConversations((current) =>
      current.map((conversation) =>
        conversation.id === activeConversationId
          ? { ...conversation, messages: [optimisticMessage] }
          : conversation,
      ),
    );

    try {
      const message = await conversationsApi.createMessage(activeConversationId, content, 'TEXT');
      setMessages((current) => {
        const withoutTemporary = current.filter(
          (item) => item.id !== temporaryId && item.id !== message.id,
        );
        return [...withoutTemporary, message].sort(
          (left, right) => new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime(),
        );
      });
      setConversations((current) =>
        current.map((conversation) =>
          conversation.id === activeConversationId ? { ...conversation, messages: [message] } : conversation,
        ),
      );
    } catch (error) {
      setMessages((current) => current.filter((message) => message.id !== temporaryId));
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

  const ConversationList = () => (
    <div className="flex h-full min-h-0 flex-col">
      <div className="border-b border-[#f1f0ec] px-3 pb-3 pt-4 md:p-4">
        <div className="mb-3 flex items-end justify-between md:hidden">
          <div>
            <h1 className="text-lg font-bold text-foreground">Messages</h1>
            <p className="text-xs text-muted-foreground">Buyers and sellers</p>
          </div>
          <span className="text-xs font-semibold text-muted-foreground">
            {conversations.length}
          </span>
        </div>
        <div className="relative mb-2.5">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={15} />
          <Input
            placeholder="Search conversations"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            className="h-11 rounded-md pl-9 text-base md:h-10 md:text-sm"
          />
        </div>
        <div className="flex gap-5">
          {(['all', 'unread'] as const).map((filterType) => (
            <Button
              key={filterType}
              type="button"
              variant="link"
              size="sm"
              onClick={() => setFilter(filterType)}
              className={cn(
                'h-8 px-0 text-xs no-underline',
                filter === filterType ? 'font-black text-[var(--brand)]' : 'text-muted-foreground',
              )}
            >
              {filterType === 'all' ? 'All' : 'Unread'}
            </Button>
          ))}
        </div>
      </div>

      <div className="min-h-0 flex-1 touch-pan-y overflow-y-auto overscroll-contain">
        {filteredConversations.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center px-6 py-12 text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center text-[var(--brand)]">
              <MessageSquare className="text-[var(--brand)]" size={26} />
            </div>
            <h3 className="font-semibold text-foreground">No conversations</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Conversations will appear here when buyers or sellers message you.
            </p>
          </div>
        ) : (
          <div>
            {filteredConversations.map((conversation) => {
              const otherUser = getOtherUser(conversation);
              const latest = conversation.messages[0];
              const unread = Boolean(latest && latest.senderId !== user?.id && !latest.readAt);

              return (
                <button
                  key={conversation.id}
                  type="button"
                  onClick={() => handleSelectConversation(conversation.id)}
                  className={cn(
                    'w-full border-b border-[#f1f0ec] p-3 text-left transition-colors hover:bg-muted/35 md:p-4',
                    activeConversationId === conversation.id && 'text-[var(--brand)]',
                  )}
                >
                  <div className="flex items-start gap-3">
                    <NameAvatar name={otherUser.name} className="h-9 w-9 text-xs md:h-10 md:w-10 md:text-sm" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-foreground">{otherUser.name}</p>
                          <p className="truncate text-xs text-muted-foreground">{conversation.listing.title}</p>
                        </div>
                        <span className="shrink-0 text-xs text-muted-foreground">
                          {latest ? formatDate(latest.createdAt) : formatDate(conversation.createdAt)}
                        </span>
                      </div>
                      <div className="mt-1 flex items-center justify-between gap-2">
                        <p className="line-clamp-1 text-xs text-muted-foreground md:text-sm">
                          {latest?.content ?? 'Conversation started'}
                        </p>
                        {unread && <span className="h-2.5 w-2.5 rounded-full bg-[var(--brand)]" aria-label="Unread" />}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );

  const ChatWindow = () => {
    if (!activeConversation) {
      return (
        <div className="flex h-full min-h-[420px] flex-col items-center justify-center bg-card px-6 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center text-[var(--brand)]">
            <MessageSquare className="text-[var(--brand)]" size={30} />
          </div>
          <h3 className="text-lg font-semibold text-foreground">Select a conversation</h3>
          <p className="mt-2 max-w-sm text-sm text-muted-foreground">
            Real buyer and seller messages will appear here once conversations exist.
          </p>
        </div>
      );
    }

    const otherUser = getOtherUser(activeConversation);
    const isGuestHandoff = otherUser.isGuest === true;

    return (
      <div className="flex h-full min-h-0 flex-col overflow-hidden bg-white">
        <div className="flex min-h-14 items-center justify-between gap-3 border-b border-[#f1f0ec] px-2 py-1.5 md:p-4">
          <div className="flex min-w-0 items-center gap-3">
            <button type="button" onClick={() => setActiveConversationId(null)} className="flex h-11 w-11 shrink-0 items-center justify-center text-[var(--foreground)] hover:text-[var(--brand)] lg:hidden" aria-label="Back to conversations">
              <ArrowLeft size={18} />
            </button>
            <NameAvatar name={otherUser.name} className="h-9 w-9 text-xs md:h-10 md:w-10 md:text-sm" />
            <div className="min-w-0">
              <h3 className="truncate text-sm font-semibold text-foreground md:text-base">{otherUser.name}</h3>
              <p className="truncate text-xs text-muted-foreground md:text-sm">{activeConversation.listing.title}</p>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button type="button" variant="ghost" size="icon">
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

        <div
          ref={messagesViewportRef}
          onScroll={(event) => {
            const viewport = event.currentTarget;
            const distanceFromBottom =
              viewport.scrollHeight - viewport.scrollTop - viewport.clientHeight;
            shouldStickToBottomRef.current = distanceFromBottom < 96;
          }}
          className="min-h-0 flex-1 touch-pan-y overflow-y-auto overscroll-contain bg-white px-3 py-4 [overflow-anchor:none] [scrollbar-gutter:stable] md:px-4"
        >
          {loadingMessages ? (
            <LoadingState label="Loading messages" compact className="h-full" />
          ) : messages.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <MessageSquare className="mb-3 text-muted-foreground/40" size={38} />
              <p className="text-sm text-muted-foreground">No messages yet.</p>
            </div>
          ) : (
            <div className="space-y-1.5">
              {messages.map((message) => {
                const mine = message.senderId === user?.id;
                return (
                  <div
                    key={message.id}
                    className={cn('flex items-end gap-2', mine ? 'justify-end' : 'justify-start')}
                  >
                    {!mine && (
                      <NameAvatar name={otherUser.name} className="h-8 w-8 text-xs" />
                    )}
                    <div
                      className={cn(
                        'max-w-[84%] rounded-[18px] px-3 py-2 text-sm leading-5 md:max-w-[76%] md:py-2.5',
                        mine
                          ? 'rounded-br-md bg-[var(--brand)] text-white'
                          : 'rounded-bl-md bg-[#f1f1ef] text-foreground',
                      )}
                    >
                      <p className="whitespace-pre-wrap break-words">{message.content}</p>
                      <p className={cn('mt-1 text-[11px]', mine ? 'text-white/70' : 'text-muted-foreground')}>
                        {message.clientState === 'sending' ? 'Sending…' : formatTime(message.createdAt)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {isGuestHandoff ? (
          <div className="shrink-0 border-t border-[#f1f0ec] bg-white px-4 pb-[calc(0.85rem+var(--safe-area-bottom))] pt-3 md:p-4">
            <p className="text-sm font-bold text-[var(--foreground)]">Continue outside Remnant</p>
            <p className="mt-1 text-xs leading-5 text-[var(--ink-soft)]">This buyer sent a guest offer. Use the contact detail in their offer above to reply on the platform they chose.</p>
          </div>
        ) : <div className="shrink-0 border-t border-[#f1f0ec] bg-white px-2.5 pb-[calc(0.5rem+var(--safe-area-bottom))] pt-2 md:p-3">
          <div className="flex items-end gap-1 rounded-xl border border-[#e7e7e3] bg-white px-1.5 py-1">
            <textarea
              ref={composerRef}
              aria-label="Message"
              placeholder="Type your message"
              value={newMessage}
              onChange={(event) => setNewMessage(event.target.value)}
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
              className="min-h-11 max-h-28 flex-1 resize-none overflow-y-auto bg-transparent px-2 py-2.5 text-base leading-6 outline-none placeholder:text-muted-foreground md:min-h-10 md:py-2 md:text-sm md:leading-5"
            />
            <Button
              type="button"
              onClick={handleSendMessage}
              disabled={!newMessage.trim() || sending}
              size="icon"
              aria-label={sending ? 'Sending message' : 'Send message'}
              className="h-11 w-11 shrink-0 bg-transparent text-[var(--brand)] hover:bg-transparent hover:text-[var(--brand-dark)] md:h-10 md:w-10"
            >
              {sending ? <Loader2 className="animate-spin" size={16} /> : <Send size={16} />}
            </Button>
          </div>
          <p className="mt-2 hidden text-center text-xs text-muted-foreground sm:block">
            Agree on payment and collection directly. Never share verification codes.
          </p>
        </div>}
      </div>
    );
  };

  return (
    <div className="md:space-y-6">
      <div className="hidden md:block">
        <h1 className="text-xl font-bold text-foreground md:text-3xl">Messages</h1>
        <p className="hidden text-sm text-muted-foreground sm:block">Buyer and seller messages</p>
      </div>

      <div
        style={mobileViewportStyle}
        className="fixed inset-x-0 top-0 z-[80] grid h-dvh min-h-[280px] grid-cols-1 overflow-hidden bg-white md:static md:z-auto md:h-auto md:min-h-[620px] md:transform-none md:rounded-xl md:border md:border-[var(--border)]/70 lg:grid-cols-[340px_1fr]"
      >
        <div className={cn('min-h-0 border-b border-[var(--border)]/70 lg:block lg:border-b-0 lg:border-r', activeConversationId ? 'hidden' : 'block')}>
          {ConversationList()}
        </div>
        <div className={cn('min-h-0 lg:block', activeConversationId ? 'block' : 'hidden')}>
          {ChatWindow()}
        </div>
      </div>
    </div>
  );
}
