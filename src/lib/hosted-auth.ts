import { getApiUrl } from "./api-url";

const AUTH_STATE_KEY = "remnant-auth-state";
const AUTH_VERIFIER_KEY = "remnant-auth-code-verifier";
const AUTH_ATTEMPT_TTL_MS = 10 * 60 * 1000;

interface AuthConfig {
  clientId: string | null;
  hostedUiDomain: string | null;
}

export interface HostedTokens {
  accessToken: string;
  idToken?: string;
  refreshToken?: string;
}

function normalizeHostedUiDomain(domain: string) {
  return /^https?:\/\//i.test(domain) ? domain : `https://${domain}`;
}

function callbackUrl() {
  return `${window.location.origin}/auth/callback`;
}

function authAttemptStores() {
  return [window.sessionStorage, window.localStorage];
}

function storeAuthAttemptValue(key: string, value: string) {
  const payload = JSON.stringify({ value, createdAt: Date.now() });
  for (const storage of authAttemptStores()) {
    try {
      storage.setItem(key, payload);
    } catch {
      // Private browsing modes can disable one storage implementation.
    }
  }
}

function readAuthAttemptValue(key: string) {
  for (const storage of authAttemptStores()) {
    try {
      const raw = storage.getItem(key);
      if (!raw) continue;
      const parsed = JSON.parse(raw) as { value?: string; createdAt?: number };
      if (parsed.value && parsed.createdAt && Date.now() - parsed.createdAt <= AUTH_ATTEMPT_TTL_MS) {
        return parsed.value;
      }
      storage.removeItem(key);
    } catch {
      // Try the next storage implementation.
    }
  }
  return null;
}

function clearAuthAttemptValue(key: string) {
  for (const storage of authAttemptStores()) {
    try {
      storage.removeItem(key);
    } catch {
      // Clearing the available store is sufficient.
    }
  }
}

function base64UrlEncode(value: ArrayBuffer | Uint8Array | string) {
  let binary = "";

  if (typeof value === "string") {
    binary = value;
  } else {
    const bytes = value instanceof Uint8Array ? value : new Uint8Array(value);
    bytes.forEach((byte) => {
      binary += String.fromCharCode(byte);
    });
  }

  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function randomBase64Url(bytes = 32) {
  const random = new Uint8Array(bytes);
  crypto.getRandomValues(random);
  return base64UrlEncode(random);
}

async function createCodeChallenge(verifier: string) {
  const encoded = new TextEncoder().encode(verifier);
  const digest = await crypto.subtle.digest("SHA-256", encoded);
  return base64UrlEncode(digest);
}

function createState(returnTo: string) {
  const nonce =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const state = base64UrlEncode(JSON.stringify({ nonce, returnTo }));
  storeAuthAttemptValue(AUTH_STATE_KEY, state);
  return state;
}

export function readExpectedAuthState() {
  return readAuthAttemptValue(AUTH_STATE_KEY);
}

export function clearExpectedAuthState() {
  clearAuthAttemptValue(AUTH_STATE_KEY);
  clearAuthAttemptValue(AUTH_VERIFIER_KEY);
}

export function readCodeVerifier() {
  return readAuthAttemptValue(AUTH_VERIFIER_KEY);
}

export function decodeAuthState(value: string | null) {
  if (!value) return { returnTo: "/" };

  try {
    const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
    const parsed = JSON.parse(atob(padded)) as { returnTo?: string };
    return { returnTo: safeInternalPath(parsed.returnTo) };
  } catch {
    return { returnTo: "/" };
  }
}

export function safeInternalPath(value: string | null | undefined) {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.startsWith("/\\")) return "/";
  return value;
}

export async function startHostedAuth(options: {
  returnTo?: string;
  provider?: "Google";
  screen?: "login" | "signup";
  loginHint?: string;
}) {
  const res = await fetch(`${getApiUrl()}/auth/config`, { cache: "no-store" });
  if (!res.ok) throw new Error("Sign-in is not configured yet.");

  const config = (await res.json()) as AuthConfig;
  if (!config.hostedUiDomain || !config.clientId) {
    throw new Error("Sign-in is not configured yet.");
  }

  const verifier = randomBase64Url(64);
  const challenge = await createCodeChallenge(verifier);
  storeAuthAttemptValue(AUTH_VERIFIER_KEY, verifier);

  const authorizeUrl = new URL("/oauth2/authorize", normalizeHostedUiDomain(config.hostedUiDomain));
  authorizeUrl.searchParams.set("client_id", config.clientId);
  authorizeUrl.searchParams.set("redirect_uri", callbackUrl());
  authorizeUrl.searchParams.set("response_type", "code");
  authorizeUrl.searchParams.set("scope", "openid email profile");
  authorizeUrl.searchParams.set("state", createState(safeInternalPath(options.returnTo)));
  authorizeUrl.searchParams.set("code_challenge_method", "S256");
  authorizeUrl.searchParams.set("code_challenge", challenge);

  if (options.provider) {
    authorizeUrl.searchParams.set("identity_provider", options.provider);
    authorizeUrl.searchParams.set("prompt", "select_account");
  }
  if (options.screen === "signup") authorizeUrl.searchParams.set("screen_hint", "signup");
  if (options.loginHint) authorizeUrl.searchParams.set("login_hint", options.loginHint);

  window.location.assign(authorizeUrl.toString());
}

export async function exchangeHostedAuthCode(code: string, verifier: string): Promise<HostedTokens> {
  const tokenRes = await fetch(`${getApiUrl()}/auth/exchange-code`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code, codeVerifier: verifier, redirectUri: callbackUrl() }),
  });

  if (!tokenRes.ok) {
    const error = await tokenRes.json().catch(() => null) as { message?: string | string[] } | null;
    const message = Array.isArray(error?.message) ? error.message[0] : error?.message;
    throw new Error(message || "Google sign-in could not be completed. Please try again.");
  }
  return tokenRes.json() as Promise<HostedTokens>;
}
