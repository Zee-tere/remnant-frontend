'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import {
  ExternalLink,
  Flag,
  Loader2,
  MessageSquare,
  MoreVertical,
  Search,
  Send,
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { toast } from 'sonner';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { conversationsApi } from '@/lib/api';
import { useAuthStore } from '@/lib/auth';
import { useSocket } from '@/providers/SocketProvider';
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
  const { joinRoom, leaveRoom } = useSocket();
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

  const loadConversations = useCallback(async () => {
    if (!isAuthenticated) {
      setConversations([]);
      setLoadingConversations(false);
      return;
    }

    setLoadingConversations(true);
    try {
      const data = await conversationsApi.getConversations();
      const rows = Array.isArray(data) ? data : [];
      setConversations(rows);
      setActiveConversationId((current) => current ?? rows[0]?.id ?? null);
    } catch {
      setConversations([]);
      toast.error('Could not load conversations');
    } finally {
      setLoadingConversations(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  useEffect(() => {
    if (!activeConversationId) {
      setMessages([]);
      return;
    }

    let cancelled = false;

    const loadMessages = async () => {
      setLoadingMessages(true);
      try {
        const data = await conversationsApi.getMessages(activeConversationId);
        if (!cancelled) {
          setMessages(Array.isArray(data) ? data : []);
          conversationsApi.markAsRead(activeConversationId).catch(() => undefined);
        }
      } catch {
        if (!cancelled) {
          setMessages([]);
          toast.error('Could not load messages');
        }
      } finally {
        if (!cancelled) setLoadingMessages(false);
      }
    };

    loadMessages();
    joinRoom(activeConversationId);

    return () => {
      cancelled = true;
      leaveRoom(activeConversationId);
    };
  }, [activeConversationId, joinRoom, leaveRoom]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, activeConversationId]);

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
    } catch {
      toast.error('Could not send message');
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
      <div className="border-b border-[var(--border)] p-4">
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <Input
            placeholder="Search conversations"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            className="pl-10"
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

      <div className="min-h-0 flex-1 overflow-y-auto">
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
          <AnimatePresence initial={false}>
            {filteredConversations.map((conversation) => {
              const otherUser = getOtherUser(conversation);
              const latest = conversation.messages[0];
              const unread = Boolean(latest && latest.senderId !== user?.id && !latest.readAt);

              return (
                <motion.button
                  key={conversation.id}
                  type="button"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  onClick={() => handleSelectConversation(conversation.id)}
                  className={cn(
                    'w-full border-b border-[var(--border)] p-4 text-left transition-colors hover:bg-muted/50',
                    activeConversationId === conversation.id && 'bg-[var(--brand-soft)]/60 dark:bg-[var(--brand-muted)]/40',
                  )}
                >
                  <div className="flex items-start gap-3">
                    <Avatar>
                      <AvatarImage src={otherUser.avatarUrl ?? undefined} alt={otherUser.name} />
                      <AvatarFallback>{otherUser.name.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
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
                      <div className="mt-2 flex items-center justify-between gap-2">
                        <p className="line-clamp-1 text-sm text-muted-foreground">
                          {latest?.content ?? 'Conversation started'}
                        </p>
                        {unread && <span className="h-2.5 w-2.5 rounded-full bg-[var(--brand)]" aria-label="Unread" />}
                      </div>
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </AnimatePresence>
        )}
      </div>
    </div>
  );

  const ChatWindow = () => {
    if (!activeConversation) {
      return (
        <div className="flex h-full min-h-[420px] flex-col items-center justify-center rounded-xl border border-[var(--border)] bg-card px-6 text-center">
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
      <div className="flex h-full min-h-[620px] flex-col overflow-hidden rounded-xl border border-[var(--border)] bg-card">
        <div className="flex items-center justify-between gap-3 border-b border-[var(--border)] p-4">
          <div className="flex min-w-0 items-center gap-3">
            <Avatar>
              <AvatarImage src={otherUser.avatarUrl ?? undefined} alt={otherUser.name} />
              <AvatarFallback>{otherUser.name.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <h3 className="truncate font-semibold text-foreground">{otherUser.name}</h3>
              <p className="truncate text-sm text-muted-foreground">{activeConversation.listing.title}</p>
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
                <Link href={`/marketplace/${activeConversation.listing.id}`}>
                  <ExternalLink size={16} className="mr-2" />
                  View listing
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <a
                  href={`mailto:support@remnant.africa?subject=${encodeURIComponent(
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

        <div className="min-h-0 flex-1 overflow-y-auto p-4">
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
            <div className="space-y-4">
              {messages.map((message) => {
                const mine = message.senderId === user?.id;
                return (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={cn('flex gap-3', mine ? 'justify-end' : 'justify-start')}
                  >
                    {!mine && (
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={otherUser.avatarUrl ?? undefined} alt={otherUser.name} />
                        <AvatarFallback>{otherUser.name.charAt(0).toUpperCase()}</AvatarFallback>
                      </Avatar>
                    )}
                    <div
                      className={cn(
                        'max-w-[78%] rounded-2xl px-4 py-3 text-sm shadow-sm',
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
                  </motion.div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        <div className="border-t border-[var(--border)] p-3">
          <div className="flex items-end gap-2 rounded-2xl bg-muted p-2">
            <Textarea
              placeholder="Type your message"
              value={newMessage}
              onChange={(event) => setNewMessage(event.target.value)}
              onKeyDown={handleKeyDown}
              rows={1}
              className="max-h-32 min-h-[44px] flex-1 resize-none border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
            />
            <Button
              type="button"
              onClick={handleSendMessage}
              disabled={!newMessage.trim() || sending}
              className="h-10 bg-[var(--brand)] text-[var(--navy)] hover:bg-[var(--brand-light)]"
            >
              {sending ? <Loader2 className="animate-spin" size={16} /> : <Send size={16} />}
            </Button>
          </div>
          <p className="mt-2 text-center text-xs text-muted-foreground">
            Keep payments and pickup plans inside Remnant until the exchange is complete.
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground md:text-3xl">Messages</h1>
        <p className="text-sm text-muted-foreground">Buyer and seller messages</p>
      </div>

      <div className="grid min-h-[620px] grid-cols-1 overflow-hidden rounded-xl border border-[var(--border)] bg-card lg:grid-cols-[340px_1fr]">
        <div className="min-h-[280px] border-b border-[var(--border)] lg:border-b-0 lg:border-r">
          <ConversationList />
        </div>
        <div className="min-h-0 p-3 lg:p-4">
          <ChatWindow />
        </div>
      </div>
    </div>
  );
}
