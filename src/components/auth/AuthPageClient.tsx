"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, ArrowRight, Eye, EyeOff, Fingerprint, Loader2, Mail, ShieldCheck, UserRound } from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import { toast } from "sonner";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { Button } from "@/components/ui/button";
import { authApi } from "@/lib/api";
import { useAuthStore } from "@/lib/auth";
import { getApiErrorMessage } from "@/lib/errors";
import { safeInternalPath, startHostedAuth } from "@/lib/hosted-auth";

type AuthMode = "login" | "signup";

export default function AuthPageClient({ mode }: { mode: AuthMode }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setAuth = useAuthStore((state) => state.setAuth);
  const redirectTo = safeInternalPath(searchParams.get("redirect"));
  const authError = searchParams.get("error");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmationCode, setConfirmationCode] = useState("");
  const [needsConfirmation, setNeedsConfirmation] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState<"form" | "google" | null>(null);

  const loginPath = `/login?redirect=${encodeURIComponent(redirectTo)}`;
  const signupPath = `/signup?redirect=${encodeURIComponent(redirectTo)}`;

  useEffect(() => {
    router.prefetch(mode === "login" ? signupPath : loginPath);
  }, [loginPath, mode, router, signupPath]);

  useEffect(() => {
    if (mode !== "login" || !authError) return;
    toast.error(authError);
    const params = new URLSearchParams(searchParams.toString());
    params.delete("error");
    router.replace(`/login${params.size ? `?${params.toString()}` : ""}`, { scroll: false });
  }, [authError, mode, router, searchParams]);

  const beginAuth = async (provider?: "Google") => {
    setLoading(provider ? "google" : "form");
    try {
      await startHostedAuth({
        returnTo: redirectTo,
        provider,
        screen: mode,
        loginHint: email.trim() || undefined,
      });
    } catch (error) {
      setLoading(null);
      toast.error(error instanceof Error ? error.message : "Authentication could not start");
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

  const submitSignup = async () => {
    setLoading("form");
    try {
      const result = await authApi.register({ name, email, password });
      if (result.requiresConfirmation) {
        toast.success(result.message || "Check your email for the confirmation code.");
        setNeedsConfirmation(true);
        setLoading(null);
        return;
      }
      setAuth(result.user, result.accessToken, result.refreshToken);
      toast.success("Welcome to Remnant");
      router.push(redirectTo);
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Account could not be created."));
      setLoading(null);
    }
  };

  const submitConfirmation = async () => {
    setLoading("form");
    try {
      await authApi.confirmSignup({ email, code: confirmationCode });
      const result = await authApi.login({ email, password });
      setAuth(result.user, result.accessToken, result.refreshToken);
      toast.success("Your account is ready");
      router.push(redirectTo);
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Confirmation code could not be verified."));
      setLoading(null);
    }
  };

  const submit = () => {
    if (mode === "login") return submitLogin();
    return needsConfirmation ? submitConfirmation() : submitSignup();
  };

  return (
    <main className="min-h-screen bg-[var(--warm-white)] px-5 py-3 md:px-8 md:py-10">
      <section className="mx-auto grid min-h-[calc(100dvh-1.5rem)] max-w-6xl grid-cols-[minmax(0,1fr)] items-start gap-8 lg:min-h-[74vh] lg:grid-cols-[0.95fr_1fr] lg:items-center">
        <div className="auth-story-panel relative hidden overflow-hidden rounded-2xl border border-[var(--line-soft)] bg-white p-10 text-[var(--foreground)] lg:block">
          <Link href="/" className="inline-flex text-[var(--brand)]" aria-label="Remnant home">
            <BrandLogo size="auth" />
          </Link>
          <div className="relative mt-12 flex h-36 w-36 items-center justify-center text-[var(--lavender)]" aria-hidden="true">
            <Fingerprint size={118} strokeWidth={1.15} />
            <span className="absolute bottom-4 right-2 h-4 w-4 rounded-full bg-[var(--amber)]" />
          </div>
          <h1 className="mt-6 max-w-md text-5xl font-bold leading-tight">Your useful pieces, in one place.</h1>
          <p className="mt-5 max-w-sm text-base font-medium leading-7 text-[var(--ink-soft)]">
            Manage listings, messages, matches, and every useful next step from one account.
          </p>
        </div>

        <div className="mx-auto w-full min-w-0 max-w-[22rem] md:max-w-md">
          <Link href="/" className="mb-2 flex w-fit text-[var(--brand)] lg:hidden" aria-label="Remnant home">
            <BrandLogo size="default" />
          </Link>
          <Link href="/marketplace" className="mb-3 inline-flex items-center gap-2 text-sm font-bold text-[var(--brand)] hover:text-[var(--brand-dark)] md:mb-5">
            <ArrowLeft size={16} aria-hidden="true" />
            Back to market
          </Link>

          <div className="relative mx-auto mb-1 flex h-12 w-12 items-center justify-center text-[var(--lavender)] lg:hidden" aria-hidden="true">
            <Fingerprint size={36} strokeWidth={1.7} />
            <span className="absolute bottom-1 right-0 h-2 w-2 rounded-full bg-[var(--amber)]" />
          </div>

          <div className="mb-4 text-center lg:mb-6 lg:text-left">
            <h1 className="text-[1.75rem] font-bold text-[var(--foreground)] md:text-4xl">
              {needsConfirmation ? "Confirm account" : mode === "login" ? "Welcome back" : "Join Remnant"}
            </h1>
            <p className="mt-2 text-sm font-semibold text-[var(--muted-foreground)]">
              {needsConfirmation ? `Enter the code sent to ${email}.` : mode === "login" ? "Pick up where you left off." : "Create your account in a minute."}
            </p>
          </div>

          {!needsConfirmation && (
            <nav className="mb-4 grid grid-cols-2 rounded-full border border-[var(--border)] bg-white p-1" aria-label="Account access">
              <Link href={loginPath} replace scroll={false} aria-current={mode === "login" ? "page" : undefined} className={`flex h-10 items-center justify-center rounded-full text-sm font-bold transition-colors ${mode === "login" ? "bg-[var(--brand)] text-white" : "text-[var(--ink-soft)] hover:text-[var(--brand)]"}`}>Log in</Link>
              <Link href={signupPath} replace scroll={false} aria-current={mode === "signup" ? "page" : undefined} className={`flex h-10 items-center justify-center rounded-full text-sm font-bold transition-colors ${mode === "signup" ? "bg-[var(--brand)] text-white" : "text-[var(--ink-soft)] hover:text-[var(--brand)]"}`}>Create account</Link>
            </nav>
          )}

          <form className="bg-white md:rounded-[1.5rem] md:border md:border-[var(--border)]/55 md:p-7" onSubmit={(event) => { event.preventDefault(); void submit(); }}>
            {needsConfirmation ? (
              <>
                <label htmlFor="auth-code" className="mb-2 block text-sm font-bold text-[var(--foreground)]">Confirmation code</label>
                <input id="auth-code" type="text" value={confirmationCode} onChange={(event) => setConfirmationCode(event.target.value)} placeholder="Code from email" autoComplete="one-time-code" required className="mb-4 h-12 w-full rounded-full border border-[var(--border)] bg-white px-5 py-3 text-base font-semibold outline-none focus:border-[var(--brand)] md:h-[52px]" />
              </>
            ) : (
              <>
                {mode === "signup" && (
                  <>
                    <label htmlFor="auth-name" className="mb-2 block text-sm font-bold text-[var(--foreground)]">Name</label>
                    <div className="relative mb-4">
                      <UserRound size={17} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]" aria-hidden="true" />
                      <input id="auth-name" type="text" value={name} onChange={(event) => setName(event.target.value)} placeholder="Your name" autoComplete="name" required className="h-12 w-full rounded-full border border-[var(--border)] bg-white px-11 py-3 text-base font-semibold outline-none focus:border-[var(--brand)] md:h-[52px]" />
                    </div>
                  </>
                )}

                <label htmlFor="auth-email" className="mb-2 block text-sm font-bold text-[var(--foreground)]">Email address</label>
                <div className="relative mb-4">
                  <Mail size={17} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]" aria-hidden="true" />
                  <input id="auth-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" autoComplete="email" required className="h-12 w-full rounded-full border border-[var(--border)] bg-white px-11 py-3 text-base font-semibold outline-none focus:border-[var(--brand)] md:h-[52px]" />
                </div>

                <label htmlFor="auth-password" className="mb-2 block text-sm font-bold text-[var(--foreground)]">Password</label>
                <div className="relative mb-3">
                  <ShieldCheck size={17} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]" aria-hidden="true" />
                  <input id="auth-password" type={showPassword ? "text" : "password"} value={password} onChange={(event) => setPassword(event.target.value)} placeholder={mode === "signup" ? "At least 8 characters" : "Your password"} autoComplete={mode === "signup" ? "new-password" : "current-password"} required minLength={mode === "signup" ? 8 : undefined} className="h-12 w-full rounded-full border border-[var(--border)] bg-white px-11 py-3 pr-12 text-base font-semibold outline-none focus:border-[var(--brand)] md:h-[52px]" />
                  <button type="button" onClick={() => setShowPassword((value) => !value)} className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full text-[var(--muted-foreground)] hover:bg-[var(--sand)] hover:text-[var(--brand)]" aria-label={showPassword ? "Hide password" : "Show password"}>
                    {showPassword ? <EyeOff size={17} aria-hidden="true" /> : <Eye size={17} aria-hidden="true" />}
                  </button>
                </div>
                {mode === "signup" ? (
                  <p className="mb-4 text-xs font-semibold leading-5 text-[var(--muted-foreground)]">Use 8+ characters with uppercase, lowercase, and a number.</p>
                ) : (
                  <Link href="/forgot-password" className="mb-4 inline-flex text-sm font-bold text-[var(--brand)] hover:underline">Forgot password?</Link>
                )}
              </>
            )}

            <div className="space-y-3">
              {!needsConfirmation && (
                <Button type="button" onClick={() => void beginAuth("Google")} disabled={loading !== null} variant="outline" className="h-12 w-full rounded-full border-[var(--border)] bg-white text-[0.92rem] font-bold md:h-14 md:text-base">
                  {loading === "google" ? <Loader2 className="animate-spin" size={18} /> : <FcGoogle size={20} />}
                  {mode === "login" ? "Continue with Google" : "Join with Google"}
                </Button>
              )}
              <Button type="submit" disabled={loading !== null} className="h-12 w-full rounded-full bg-[var(--brand)] text-[0.92rem] font-bold text-white hover:bg-[var(--brand-dark)] md:h-14 md:text-base">
                {loading === "form" ? <Loader2 className="animate-spin" size={18} /> : <ShieldCheck size={18} />}
                {needsConfirmation ? "Confirm account" : mode === "login" ? "Log in" : "Create account"}
                <ArrowRight size={17} />
              </Button>
            </div>

            {mode === "signup" && !needsConfirmation && (
              <p className="mt-5 text-center text-xs font-semibold leading-5 text-[var(--muted-foreground)]">By continuing, you agree to Remnant&apos;s Terms and Privacy Policy.</p>
            )}
          </form>
        </div>
      </section>
    </main>
  );
}
