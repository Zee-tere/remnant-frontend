"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowRight, Home, Loader2, Mail, ShieldCheck, ShoppingBag } from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { startHostedAuth } from "@/lib/hosted-auth";

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[var(--warm-white)]" />}>
      <LoginPageContent />
    </Suspense>
  );
}

function LoginPageContent() {
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/";
  const authError = searchParams.get("error");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState<"hosted" | "google" | null>(null);

  useEffect(() => {
    if (authError) toast.error(authError);
  }, [authError]);

  const beginAuth = async (provider?: "Google") => {
    setLoading(provider ? "google" : "hosted");
    try {
      await startHostedAuth({
        returnTo: redirectTo,
        provider,
        screen: "login",
        loginHint: email.trim() || undefined,
      });
    } catch (error) {
      setLoading(null);
      toast.error(error instanceof Error ? error.message : "Sign-in could not start");
    }
  };

  return (
    <main className="min-h-screen bg-[var(--warm-white)] px-5 py-10 md:px-8">
      <nav className="mx-auto mb-6 flex max-w-6xl items-center justify-between lg:hidden" aria-label="Login navigation">
        <Link href="/" className="text-xl font-bold text-[var(--brand)]">
          Remnant
        </Link>
        <div className="flex items-center gap-2">
          <Link
            href="/"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--sand)] text-[var(--ink-soft)]"
            aria-label="Home"
          >
            <Home size={18} aria-hidden="true" />
          </Link>
          <Link
            href="/marketplace"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--sand)] text-[var(--ink-soft)]"
            aria-label="Marketplace"
          >
            <ShoppingBag size={18} aria-hidden="true" />
          </Link>
        </div>
      </nav>
      <section className="mx-auto grid min-h-[74vh] max-w-6xl gap-8 lg:grid-cols-[0.95fr_1fr] lg:items-center">
        <div className="hidden rounded-[2rem] bg-[var(--navy)] p-10 text-white lg:block">
          <Link href="/" className="text-3xl font-extrabold">Remnant</Link>
          <h1 className="mt-16 max-w-md text-5xl font-bold leading-tight">
            Welcome back to useful pieces.
          </h1>
          <p className="mt-5 max-w-sm text-base font-medium leading-7 text-white/65">
            Sign in securely to manage listings, messages, matches, and your account.
          </p>
        </div>

        <div className="mx-auto w-full max-w-md">
          <div className="mb-7 text-center lg:text-left">
            <h1 className="text-3xl font-bold text-[var(--foreground)] md:text-4xl">Log in</h1>
            <p className="mt-2 text-sm font-semibold text-[var(--muted-foreground)]">
              Pick up where you left off.
            </p>
          </div>

          <form
            className="surface-card rounded-[1.5rem] bg-white p-5 md:p-7"
            onSubmit={(event) => {
              event.preventDefault();
              beginAuth();
            }}
          >
            <label htmlFor="login-email" className="mb-2 block text-sm font-bold text-[var(--foreground)]">
              Email address
            </label>
            <div className="relative mb-4">
              <Mail
                size={17}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]"
                aria-hidden="true"
              />
              <input
                id="login-email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
                className="h-[52px] w-full rounded-full border border-[var(--border)] bg-white px-11 py-3 text-base font-semibold text-[var(--foreground)] outline-none transition focus:border-[var(--brand)] focus:shadow-[0_0_0_3px_rgba(0,108,82,0.12)]"
              />
            </div>

            <div className="space-y-3">
              <Button
                type="button"
                onClick={() => beginAuth("Google")}
                disabled={loading !== null}
                variant="outline"
                className="h-14 w-full rounded-full border-[var(--border)] bg-white text-base font-bold"
              >
                {loading === "google" ? <Loader2 className="animate-spin" size={18} /> : <FcGoogle size={20} />}
                Continue with Google
              </Button>

              <Button
                type="submit"
                disabled={loading !== null}
                className="h-14 w-full rounded-full bg-[var(--brand)] text-base font-bold text-white hover:bg-[var(--brand-dark)]"
              >
                {loading === "hosted" ? <Loader2 className="animate-spin" size={18} /> : <ShieldCheck size={18} />}
                Log in
                <ArrowRight size={17} />
              </Button>
            </div>

            <p className="mt-5 rounded-[1.1rem] bg-[var(--sand)] px-4 py-3 text-sm font-semibold leading-6 text-[var(--ink-soft)]">
              Your password stays with the secure sign-in provider.
            </p>
          </form>

          <p className="mt-6 text-center text-sm font-semibold text-[var(--muted-foreground)]">
            New to Remnant?{" "}
            <Link href={`/signup?redirect=${encodeURIComponent(redirectTo)}`} className="text-[var(--brand)] hover:underline">
              Create an account
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
