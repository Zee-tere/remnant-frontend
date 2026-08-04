import {
  createClient,
  type RealtimeChannel,
  type SupabaseClient,
} from '@supabase/supabase-js';
import { authApi } from './api';
import { useAuthStore } from './auth';

interface MessagingRealtimeConnection {
  client: SupabaseClient;
  createPrivateChannel: (topic: string) => Promise<RealtimeChannel>;
  refreshAuth: (force?: boolean) => Promise<void>;
}

let connectionPromise: Promise<MessagingRealtimeConnection | null> | null = null;
let connectionUserId: string | null = null;

export function resetMessagingRealtime() {
  if (connectionPromise) {
    void connectionPromise
      .then((connection) => connection?.client.removeAllChannels())
      .catch(() => undefined);
  }
  connectionPromise = null;
  connectionUserId = null;
}

export function getMessagingRealtime() {
  const userId = useAuthStore.getState().user?.id ?? null;
  if (connectionUserId !== userId) {
    resetMessagingRealtime();
    connectionUserId = userId;
  }
  if (!connectionPromise) connectionPromise = createMessagingRealtime();
  return connectionPromise.catch((error) => {
    connectionPromise = null;
    throw error;
  });
}

async function createMessagingRealtime(): Promise<MessagingRealtimeConnection | null> {
  const config = await authApi.getConfig();
  if (
    !config.messagingRealtimeEnabled ||
    !config.supabaseUrl ||
    !config.supabasePublishableKey
  ) return null;

  const client = createClient(
    config.supabaseUrl,
    config.supabasePublishableKey,
    {
      auth: { persistSession: false, autoRefreshToken: false },
      realtime: { params: { eventsPerSecond: 10 } },
    },
  );
  let tokenExpiresAt = 0;
  let refreshPromise: Promise<void> | null = null;

  const refreshAuth = async (force = false) => {
    if (!force && tokenExpiresAt - Date.now() > 90_000) return;
    if (refreshPromise) return refreshPromise;

    refreshPromise = (async () => {
      const token = await authApi.createSupabaseToken();
      await client.realtime.setAuth(token.accessToken);
      tokenExpiresAt = token.expiresAt;
    })();
    try {
      await refreshPromise;
    } finally {
      refreshPromise = null;
    }
  };

  await refreshAuth(true);
  return {
    client,
    refreshAuth,
    createPrivateChannel: async (topic: string) => {
      await refreshAuth();
      return client.channel(topic, {
        config: {
          private: true,
          broadcast: { self: false },
        },
      });
    },
  };
}
