'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { Socket } from 'socket.io-client';
import { createSocket } from '@/lib/socket';
import { useAuthStore } from '@/lib/auth';

interface SocketContextValue {
  socket: Socket | null;
  isConnected: boolean;
  joinRoom: (roomId: string) => void;
  leaveRoom: (roomId: string) => void;
}

const SocketContext = createContext<SocketContextValue>({
  socket: null,
  isConnected: false,
  joinRoom: () => {},
  leaveRoom: () => {},
});

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const { accessToken, isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated || !accessToken) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
        setIsConnected(false);
      }
      return;
    }

    const newSocket = createSocket(accessToken);

    newSocket.on('connect', () => {
      setIsConnected(true);
      console.log('[Socket] Connected');
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
      console.log('[Socket] Disconnected');
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [isAuthenticated, accessToken]);

  const joinRoom = useCallback(
    (roomId: string) => {
      socket?.emit('joinRoom', { conversationId: roomId });
    },
    [socket],
  );

  const leaveRoom = useCallback(
    (roomId: string) => {
      socket?.emit('leaveRoom', { conversationId: roomId });
    },
    [socket],
  );

  return (
    <SocketContext.Provider value={{ socket, isConnected, joinRoom, leaveRoom }}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  return useContext(SocketContext);
}
