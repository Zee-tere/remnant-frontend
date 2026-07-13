"use client";

import { Suspense, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAuthStore } from "@/lib/auth";
import { getApiUrl } from "@/lib/api-url";
import {
  clearExpectedAuthState,
  decodeAuthState,
  exchangeHostedAuthCode,
  type HostedTokens,
  readCodeVerifier,
  readExpectedAuthState,
} from "@/lib/hosted-auth";

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<AuthCallbackShell />}>
      <AuthCallbackContent />
    </Suspense>
  );
}

function AuthCallbackContent() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);
  const logout = useAuthStore((state) => state.logout);

  useEffect(() => {
    const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
    const query = new URLSearchParams(window.location.search);
    const authError = query.get("error") || hash.get("error");
    const authErrorDescription = query.get("error_description") || hash.get("error_description");
    const code = query.get("code");
    const accessTokenFromHash = hash.get("access_token");
    const idTokenFromHash = hash.get("id_token");
    const state = hash.get("state") || query.get("state");
    const expectedState = readExpectedAuthState();
    const { returnTo } = decodeAuthState(state);

    if (authError) {
      clearExpectedAuthState();
      logout();
      const message = authErrorDescription || authError;
      toast.error(message);
      router.replace(`/login?error=${encodeURIComponent(message)}`);
      return;
    }

    if ((!code && !accessTokenFromHash) || !state || state !== expectedState) {
      clearExpectedAuthState();
      logout();
      const message = "Sign-in could not be completed. Please try again.";
      toast.error(message);
      router.replace(`/login?error=${encodeURIComponent(message)}`);
      return;
    }

    async function finishSignIn() {
      try {
        let hostedTokens: HostedTokens | null = accessTokenFromHash
          ? { accessToken: accessTokenFromHash, idToken: idTokenFromHash || undefined }
          : null;

        if (code) {
          const verifier = readCodeVerifier();
          if (!verifier) throw new Error("Missing sign-in verifier");
          hostedTokens = await exchangeHostedAuthCode(code, verifier);
        }

        if (!hostedTokens?.accessToken) throw new Error("Missing access token");

        const res = hostedTokens.idToken
          ? await fetch(`${getApiUrl()}/auth/hosted-session`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                accessToken: hostedTokens.accessToken,
                idToken: hostedTokens.idToken,
                refreshToken: hostedTokens.refreshToken,
              }),
            })
          : await fetch(`${getApiUrl()}/auth/me`, {
              headers: { Authorization: `Bearer ${hostedTokens.accessToken}` },
            });
        if (!res.ok) {
          const data = await res.json().catch(() => null) as { message?: string | string[] } | null;
          const message = Array.isArray(data?.message) ? data?.message[0] : data?.message;
          throw new Error(message || "Your sign-in worked, but your Remnant profile could not be loaded.");
        }

        const data = await res.json();
        const user = data.user ?? data;
        const accessToken = data.accessToken ?? hostedTokens.accessToken;
        const refreshToken = data.refreshToken ?? hostedTokens.refreshToken;
        clearExpectedAuthState();
        setAuth(user, accessToken, refreshToken);
        toast.success("Welcome to Remnant!");
        router.replace(returnTo);
      } catch (error) {
        clearExpectedAuthState();
        logout();
        const message = error instanceof Error ? error.message : "Sign-in could not be completed. Please try again.";
        toast.error(message);
        router.replace(`/login?error=${encodeURIComponent(message)}`);
      }
    }

    finishSignIn();
  }, [logout, router, setAuth]);

  return <AuthCallbackShell />;
}

function AuthCallbackShell() {
  return (
    <main className="flex min-h-[70vh] items-center justify-center bg-[var(--background)] px-5">
      <div className="rounded-[2rem] bg-white p-8 text-center shadow-[0_20px_50px_-30px_rgba(0,108,82,0.45)]">
        <Loader2 className="mx-auto mb-4 h-8 w-8 animate-spin text-[var(--brand)]" aria-hidden="true" />
        <h1 className="text-2xl font-bold text-[var(--foreground)]">Finishing sign-in</h1>
        <p className="mt-2 text-sm font-semibold text-[var(--muted-foreground)]">
          You will be redirected in a moment.
        </p>
        <Link href="/login" className="mt-5 inline-flex text-sm font-bold text-[var(--brand)] hover:underline">
          Back to login
        </Link>
      </div>
    </main>
  );
}
