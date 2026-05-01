'use client';

import { useEffect, useState, useRef } from 'react';
import { createSocket } from '@/lib/socket';
import { useAuthStore } from '@/lib/auth';
import type { Socket } from 'socket.io-client';

const MessageComponent = () => {
  const [messages, setMessages] = useState<string[]>([]);
  const socketRef = useRef<Socket | null>(null);
  const { accessToken } = useAuthStore();

  useEffect(() => {
    if (!accessToken) return;

    const socket = createSocket(accessToken);
    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('Connected to WebSocket server');
    });

    socket.on('messageReceived', (message: string) => {
      setMessages((prev) => [...prev, message]);
    });

    return () => {
      socket.off('messageReceived');
      socket.disconnect();
    };
  }, [accessToken]);

  return (
    <div>
      <h2 className="text-lg font-semibold mb-2">Chat Messages</h2>
      {messages.length === 0 ? (
        <p className="text-neutral-400 text-sm">No messages yet.</p>
      ) : (
        <ul className="space-y-1">
          {messages.map((msg, index) => (
            <li key={index} className="p-2 bg-neutral-50 rounded text-sm">{msg}</li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default MessageComponent;
