"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, ArrowRight, Eye, EyeOff, Loader2, Mail, ShieldCheck } from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { authApi } from "@/lib/api";
import { useAuthStore } from "@/lib/auth";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { getApiErrorMessage } from "@/lib/errors";
import { safeInternalPath, startHostedAuth } from "@/lib/hosted-auth";

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[var(--warm-white)]" />}>
      <LoginPageContent />
    </Suspense>
  );
}

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setAuth = useAuthStore((state) => state.setAuth);
  const redirectTo = safeInternalPath(searchParams.get("redirect"));
  const authError = searchParams.get("error");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState<"form" | "google" | null>(null);

  useEffect(() => {
    if (!authError) return;
    toast.error(authError);
    const params = new URLSearchParams(searchParams.toString());
    params.delete("error");
    router.replace(`/login${params.size ? `?${params.toString()}` : ""}`, { scroll: false });
  }, [authError, router, searchParams]);

  const beginAuth = async (provider?: "Google") => {
    setLoading(provider ? "google" : "form");
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

  const submitLogin = async () => {
    setLoading("form");
    try {
      const result = await authApi.login({ email, password });
      setAuth(result.user, result.accessToken, result.refreshToken);
      toast.success("Welcome back");
      router.push(redirectTo);
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Email or password is not correct."));
      setLoading(null);
    }
  };

  return (
    <main className="min-h-screen bg-[var(--warm-white)] px-4 py-5 md:px-8 md:py-10">
      <section className="mx-auto grid min-h-[calc(100dvh-2.5rem)] max-w-6xl grid-cols-[minmax(0,1fr)] items-center gap-8 lg:min-h-[74vh] lg:grid-cols-[0.95fr_1fr]">
        <div className="hidden rounded-[2rem] bg-[var(--navy)] p-10 text-white lg:block">
          <Link href="/" className="inline-flex text-[var(--brand-light)]" aria-label="Remnant home">
            <BrandLogo size="auth" />
          </Link>
          <h1 className="mt-16 max-w-md text-5xl font-bold leading-tight">
            Welcome back to useful pieces.
          </h1>
          <p className="mt-5 max-w-sm text-base font-medium leading-7 text-white/65">
            Sign in securely to manage listings, messages, matches, and your account.
          </p>
        </div>

        <div className="mx-auto min-w-0 w-full max-w-md">
          <Link href="/" className="mb-5 flex w-fit text-[var(--brand)] lg:hidden" aria-label="Remnant home">
            <BrandLogo size="default" />
          </Link>
          <Link
            href="/marketplace"
            className="mb-4 inline-flex items-center gap-2 text-sm font-bold text-[var(--brand)] hover:text-[var(--brand-dark)] md:mb-5"
          >
            <ArrowLeft size={16} aria-hidden="true" />
            Back to market
          </Link>

          <div className="mb-5 text-center lg:mb-7 lg:text-left">
            <h1 className="text-[1.75rem] font-bold text-[var(--foreground)] md:text-4xl">Log in</h1>
            <p className="mt-2 text-sm font-semibold text-[var(--muted-foreground)]">
              Pick up where you left off.
            </p>
          </div>

          <form
            className="surface-card rounded-xl bg-white p-4 md:rounded-[1.5rem] md:p-7"
            onSubmit={(event) => {
              event.preventDefault();
              submitLogin();
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
                required
                className="h-[52px] w-full rounded-full border border-[var(--border)] bg-white px-11 py-3 text-base font-semibold text-[var(--foreground)] outline-none transition focus:border-[var(--brand)] focus:shadow-[0_0_0_3px_rgba(0,108,82,0.12)]"
              />
            </div>

            <label htmlFor="login-password" className="mb-2 block text-sm font-bold text-[var(--foreground)]">
              Password
            </label>
            <div className="relative mb-4">
              <ShieldCheck
                size={17}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]"
                aria-hidden="true"
              />
              <input
                id="login-password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Your password"
                autoComplete="current-password"
                required
                className="h-[52px] w-full rounded-full border border-[var(--border)] bg-white px-11 py-3 pr-12 text-base font-semibold text-[var(--foreground)] outline-none transition focus:border-[var(--brand)] focus:shadow-[0_0_0_3px_rgba(0,108,82,0.12)]"
              />
              <button
                type="button"
                onClick={() => setShowPassword((value) => !value)}
                className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full text-[var(--muted-foreground)] hover:bg-[var(--sand)] hover:text-[var(--brand)]"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={17} aria-hidden="true" /> : <Eye size={17} aria-hidden="true" />}
              </button>
            </div>
            <p className="mb-4 text-xs font-semibold leading-5 text-[var(--muted-foreground)]">
              Use the password you created. It should be 8+ characters with uppercase, lowercase, and a number.
            </p>
            <Link href="/forgot-password" className="mb-4 inline-flex text-sm font-bold text-[var(--brand)] hover:underline">
              Forgot password?
            </Link>

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
                {loading === "form" ? <Loader2 className="animate-spin" size={18} /> : <ShieldCheck size={18} />}
                Log in
                <ArrowRight size={17} />
              </Button>
            </div>

            <p className="fun-fact-marquee mt-5 overflow-hidden rounded-[1.1rem] bg-[var(--sand)] px-4 py-3 text-sm font-semibold leading-6 text-[var(--ink-soft)]">
              <span>Fun fact: one reused part can keep a useful item in someone&apos;s home for years.</span>
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
