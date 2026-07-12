'use client';

import React, { createContext, useContext, useCallback } from 'react';

interface SocketContextValue {
  socket: null;
  isConnected: boolean;
  joinRoom: (roomId: string) => void;
  leaveRoom: (roomId: string) => void;
}

const SocketContext = createContext<SocketContextValue>({
  socket: null,
  isConnected: true,
  joinRoom: () => {},
  leaveRoom: () => {},
});

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const joinRoom = useCallback(() => {}, []);
  const leaveRoom = useCallback(() => {}, []);

  return (
    <SocketContext.Provider value={{ socket: null, isConnected: true, joinRoom, leaveRoom }}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  return useContext(SocketContext);
}
