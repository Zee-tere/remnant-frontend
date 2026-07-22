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

interface ConversationUser {
  id: string;
  name: string;
  avatarUrl: string | null;
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
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const workspaceRef = useRef<HTMLDivElement>(null);
  const [mobileWorkspaceHeight, setMobileWorkspaceHeight] = useState<number | null>(null);

  const loadConversations = useCallback(async (silent = false) => {
    if (!isAuthenticated) {
      setConversations([]);
      setLoadingConversations(false);
      return;
    }

    if (!silent) setLoadingConversations(true);
    try {
      const data = await conversationsApi.getConversations();
      const rows = Array.isArray(data) ? data : [];
      setConversations(rows);
      setActiveConversationId((current) => current && rows.some((row) => row.id === current) ? current : null);
    } catch (error) {
      setConversations([]);
      toast.error(getApiErrorMessage(error, 'Could not load conversations'));
    } finally {
      if (!silent) setLoadingConversations(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    loadConversations();
    const poll = window.setInterval(() => loadConversations(true), 15000);
    return () => window.clearInterval(poll);
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
        const data = await conversationsApi.getMessages(activeConversationId);
        if (!cancelled) {
          const rows = Array.isArray(data) ? data : [];
          setMessages((current) => {
            const unchanged =
              current.length === rows.length &&
              current.every((message, index) => {
                const next = rows[index];
                return (
                  message.id === next?.id &&
                  message.content === next.content &&
                  message.readAt === next.readAt
                );
              });
            return unchanged ? current : rows;
          });
          conversationsApi.markAsRead(activeConversationId).catch(() => undefined);
        }
      } catch (error) {
        if (!cancelled) {
          setMessages([]);
          toast.error(getApiErrorMessage(error, 'Could not load messages'));
        }
      } finally {
        if (!cancelled && !silent) setLoadingMessages(false);
      }
    };

    loadMessages();
    const poll = window.setInterval(() => loadMessages(true), 8000);
    return () => {
      cancelled = true;
      window.clearInterval(poll);
    };
  }, [activeConversationId]);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      messagesEndRef.current?.scrollIntoView({ block: 'end' });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [messages, activeConversationId]);

  useEffect(() => {
    if (loadingConversations) return;

    let frame = 0;
    const updateWorkspaceHeight = () => {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(() => {
        if (window.innerWidth >= 768 || !workspaceRef.current) {
          setMobileWorkspaceHeight(null);
          return;
        }

        const viewport = window.visualViewport;
        const viewportBottom = viewport
          ? viewport.offsetTop + viewport.height
          : window.innerHeight;
        const workspaceTop = workspaceRef.current.getBoundingClientRect().top;
        setMobileWorkspaceHeight(Math.max(280, Math.floor(viewportBottom - workspaceTop)));
      });
    };

    updateWorkspaceHeight();
    window.addEventListener('resize', updateWorkspaceHeight);
    window.visualViewport?.addEventListener('resize', updateWorkspaceHeight);
    window.visualViewport?.addEventListener('scroll', updateWorkspaceHeight);

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener('resize', updateWorkspaceHeight);
      window.visualViewport?.removeEventListener('resize', updateWorkspaceHeight);
      window.visualViewport?.removeEventListener('scroll', updateWorkspaceHeight);
    };
  }, [activeConversationId, loadingConversations]);

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
    if (!newMessage.trim() || !activeConversationId) return;

    const content = newMessage.trim();
    setSending(true);
    setNewMessage('');

    try {
      const message = await conversationsApi.createMessage(activeConversationId, content, 'TEXT');
      setMessages((current) => [...current, message]);
      setConversations((current) =>
        current.map((conversation) =>
          conversation.id === activeConversationId ? { ...conversation, messages: [message] } : conversation,
        ),
      );
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Could not send message'));
      setNewMessage(content);
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
    return (
      <div className="flex min-h-[360px] items-center justify-center">
        <Loader2 className="animate-spin text-[var(--brand)]" size={28} />
      </div>
    );
  }

  const ConversationList = () => (
    <div className="flex h-full min-h-0 flex-col">
      <div className="border-b border-[var(--border)]/70 p-3 md:p-4">
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
        <div className="flex gap-2">
          {(['all', 'unread'] as const).map((filterType) => (
            <Button
              key={filterType}
              type="button"
              variant={filter === filterType ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter(filterType)}
              className={filter !== filterType ? 'border-[var(--border)]' : ''}
            >
              {filterType === 'all' ? 'All' : 'Unread'}
            </Button>
          ))}
        </div>
      </div>

      <div className="min-h-0 flex-1 touch-pan-y overflow-y-auto overscroll-contain">
        {filteredConversations.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center px-6 py-12 text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--brand-soft)]">
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
                    'w-full border-b border-[var(--border)]/60 p-3 text-left transition-colors hover:bg-muted/50 md:p-4',
                    activeConversationId === conversation.id && 'bg-[var(--brand-soft)]/60 dark:bg-[var(--brand-muted)]/40',
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
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--brand-soft)]">
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

    return (
      <div className="flex h-full min-h-0 flex-col overflow-hidden bg-card">
        <div className="flex min-h-14 items-center justify-between gap-3 border-b border-[var(--border)]/70 px-2.5 py-2 md:p-4">
          <div className="flex min-w-0 items-center gap-3">
            <button type="button" onClick={() => setActiveConversationId(null)} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md hover:bg-muted lg:hidden" aria-label="Back to conversations">
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

        <div className="min-h-0 flex-1 touch-pan-y overflow-y-auto overscroll-contain bg-[var(--background)]/45 p-3 [scrollbar-gutter:stable] md:p-4">
          {loadingMessages ? (
            <div className="flex h-full items-center justify-center">
              <Loader2 className="animate-spin text-[var(--brand)]" size={24} />
            </div>
          ) : messages.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <MessageSquare className="mb-3 text-muted-foreground/40" size={38} />
              <p className="text-sm text-muted-foreground">No messages yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
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
                        'max-w-[84%] rounded-lg px-3 py-2 text-sm leading-5 md:max-w-[76%] md:py-2.5',
                        mine
                          ? 'rounded-br-md bg-[var(--brand)] text-[var(--navy)]'
                          : 'rounded-bl-md bg-muted text-foreground',
                      )}
                    >
                      <p className="whitespace-pre-wrap break-words">{message.content}</p>
                      <p className={cn('mt-1 text-[11px]', mine ? 'text-[var(--navy)]/70' : 'text-muted-foreground')}>
                        {formatTime(message.createdAt)}
                      </p>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        <div className="shrink-0 border-t border-[var(--border)]/70 bg-white px-2.5 pb-[calc(0.625rem+var(--safe-area-bottom))] pt-2.5 md:p-3">
          <div className="flex items-end gap-2 rounded-lg border border-[var(--border)]/60 bg-white p-1.5">
            <textarea
              aria-label="Message"
              placeholder="Type your message"
              value={newMessage}
              onChange={(event) => setNewMessage(event.target.value)}
              onKeyDown={handleKeyDown}
              enterKeyHint="send"
              rows={1}
              className="min-h-11 max-h-28 flex-1 resize-none bg-transparent px-2 py-2.5 text-base leading-6 outline-none placeholder:text-muted-foreground md:min-h-10 md:py-2 md:text-sm md:leading-5"
            />
            <Button
              type="button"
              onClick={handleSendMessage}
              disabled={!newMessage.trim() || sending}
              size="icon"
              className="h-11 w-11 shrink-0 rounded-md bg-[var(--brand)] text-white hover:bg-[var(--brand-dark)] md:h-10 md:w-10"
            >
              {sending ? <Loader2 className="animate-spin" size={16} /> : <Send size={16} />}
            </Button>
          </div>
          <p className="mt-2 hidden text-center text-xs text-muted-foreground sm:block">
            Agree on payment and collection directly. Never share verification codes.
          </p>
        </div>
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
        ref={workspaceRef}
        style={mobileWorkspaceHeight ? { height: `${mobileWorkspaceHeight}px` } : undefined}
        className="grid h-[calc(100dvh-4.5rem)] min-h-[280px] grid-cols-1 overflow-hidden border-y border-[var(--border)]/70 bg-card md:h-auto md:min-h-[620px] md:rounded-xl md:border lg:grid-cols-[340px_1fr]"
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
