import { getApiUrl } from "./api-url";

const AUTH_STATE_KEY = "remnant-auth-state";
const AUTH_VERIFIER_KEY = "remnant-auth-code-verifier";

interface AuthConfig {
  clientId: string | null;
  hostedUiDomain: string | null;
}

interface OAuthErrorResponse {
  error?: string;
  error_description?: string;
}

function normalizeHostedUiDomain(domain: string) {
  return /^https?:\/\//i.test(domain) ? domain : `https://${domain}`;
}

function callbackUrl() {
  return `${window.location.origin}/auth/callback`;
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
  sessionStorage.setItem(AUTH_STATE_KEY, state);
  return state;
}

export function readExpectedAuthState() {
  return sessionStorage.getItem(AUTH_STATE_KEY);
}

export function clearExpectedAuthState() {
  sessionStorage.removeItem(AUTH_STATE_KEY);
  sessionStorage.removeItem(AUTH_VERIFIER_KEY);
}

export function readCodeVerifier() {
  return sessionStorage.getItem(AUTH_VERIFIER_KEY);
}

export function decodeAuthState(value: string | null) {
  if (!value) return { returnTo: "/" };

  try {
    const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
    const parsed = JSON.parse(atob(padded)) as { returnTo?: string };
    return { returnTo: parsed.returnTo?.startsWith("/") ? parsed.returnTo : "/" };
  } catch {
    return { returnTo: "/" };
  }
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
  sessionStorage.setItem(AUTH_VERIFIER_KEY, verifier);

  const authorizeUrl = new URL("/oauth2/authorize", normalizeHostedUiDomain(config.hostedUiDomain));
  authorizeUrl.searchParams.set("client_id", config.clientId);
  authorizeUrl.searchParams.set("redirect_uri", callbackUrl());
  authorizeUrl.searchParams.set("response_type", "code");
  authorizeUrl.searchParams.set("scope", "openid email profile");
  authorizeUrl.searchParams.set("state", createState(options.returnTo || "/"));
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

export async function exchangeHostedAuthCode(code: string, verifier: string) {
  const res = await fetch(`${getApiUrl()}/auth/config`, { cache: "no-store" });
  if (!res.ok) throw new Error("Sign-in is not configured yet.");

  const config = (await res.json()) as AuthConfig;
  if (!config.hostedUiDomain || !config.clientId) {
    throw new Error("Sign-in is not configured yet.");
  }

  const body = new URLSearchParams();
  body.set("grant_type", "authorization_code");
  body.set("client_id", config.clientId);
  body.set("code", code);
  body.set("redirect_uri", callbackUrl());
  body.set("code_verifier", verifier);

  const tokenRes = await fetch(new URL("/oauth2/token", normalizeHostedUiDomain(config.hostedUiDomain)), {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });

  if (!tokenRes.ok) {
    const errorText = await tokenRes.text().catch(() => "");
    let message = "Google sign-in could not be completed. Please try again.";

    try {
      const parsed = JSON.parse(errorText) as OAuthErrorResponse;
      const description = parsed.error_description || parsed.error;
      if (description) message = description;
    } catch {
      if (errorText && errorText.length < 180) message = errorText;
    }

    if (/client_secret|secret_hash|invalid_client/i.test(message)) {
      message = "Google sign-in is using the wrong Cognito app client. Please update the production Cognito client id and use a public client without a client secret.";
    }

    throw new Error(message);
  }
  const tokens = (await tokenRes.json()) as { access_token?: string };
  if (!tokens.access_token) throw new Error("Missing access token");
  return tokens.access_token;
}
