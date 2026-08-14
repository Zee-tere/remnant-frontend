"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowRight, Eye, EyeOff, Fingerprint, Loader2, Mail, ShieldCheck, UserRound } from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import { toast } from "sonner";
import { ActionArtwork, type ActionArtworkName } from "@/components/brand/ActionArtwork";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { Button } from "@/components/ui/button";
import { authApi } from "@/lib/api";
import { useAuthStore } from "@/lib/auth";
import { getApiErrorMessage } from "@/lib/errors";
import { safeInternalPath, startHostedAuth } from "@/lib/hosted-auth";

type AuthMode = "login" | "signup";

const floatingItems: Array<{
  name: ActionArtworkName;
  className: string;
  duration: number;
  delay: number;
}> = [
  { name: "sell", className: "left-[4%] top-[5%] h-28 w-28", duration: 8.2, delay: 0 },
  { name: "find", className: "right-[7%] top-[10%] h-20 w-20", duration: 7.4, delay: 0.8 },
  { name: "trade", className: "left-[34%] top-[29%] h-24 w-24", duration: 9, delay: 0.3 },
  { name: "repair", className: "left-[3%] bottom-[28%] h-20 w-20", duration: 7.8, delay: 1.2 },
  { name: "recycle", className: "right-[9%] bottom-[24%] h-24 w-24", duration: 8.7, delay: 0.55 },
  { name: "donate", className: "left-[40%] bottom-[9%] h-16 w-16", duration: 7.1, delay: 1.5 },
];

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
      toast.error(getApiErrorMessage(error, "Authentication could not start. Please try again."));
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
    <main className="auth-canvas min-h-screen bg-[var(--warm-white)] p-3 md:p-6 lg:p-8">
      <section className="relative mx-auto min-h-[calc(100dvh-1.5rem)] max-w-7xl overflow-hidden rounded-surface border border-[var(--line-soft)] bg-white md:min-h-[calc(100dvh-3rem)]">
        <header className="relative z-20 flex items-center justify-between px-5 py-5 md:px-8 md:py-7">
          <Link href="/" className="inline-flex text-[var(--brand)]" aria-label="Remnant home"><BrandLogo size="default" /></Link>
          <Link href="/marketplace" className="text-sm font-bold text-[var(--ink-soft)] transition-colors hover:text-[var(--brand)]">Browse marketplace</Link>
        </header>

        <div className="auth-orbit hidden lg:block" aria-hidden="true">
          <span className="auth-orbit__line" />
          <span className="auth-dot auth-dot--one" />
          <span className="auth-dot auth-dot--two" />
          <span className="auth-dot auth-dot--three" />
          <span className="auth-dot auth-dot--four" />
        </div>

        <div className="relative z-10 grid min-h-[calc(100dvh-7.5rem)] items-center gap-6 px-5 pb-10 pt-1 md:px-10 lg:grid-cols-[0.82fr_1.18fr] lg:gap-12 lg:px-16 lg:pb-14">
          <aside className="relative hidden h-full min-h-[34rem] lg:flex lg:flex-col lg:justify-end lg:pb-12">
            <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
              {floatingItems.map((item, index) => (
                <motion.div
                  key={item.name}
                  className={`absolute ${item.className}`}
                  animate={{
                    y: [0, index % 2 === 0 ? -14 : 12, index % 2 === 0 ? 6 : -5, 0],
                    rotate: [index % 2 === 0 ? -3 : 3, index % 2 === 0 ? 3 : -2, 0],
                    scale: [1, 0.96, 1.025, 1],
                  }}
                  transition={{ duration: item.duration, delay: item.delay, repeat: Infinity, ease: "easeInOut" }}
                >
                  <ActionArtwork name={item.name} className="h-full w-full" imageClassName="opacity-40 grayscale" />
                </motion.div>
              ))}
            </div>
            <h2 className="relative z-10 max-w-sm text-2xl font-bold tracking-tight text-foreground">Find the missing piece. Pass on what still works.</h2>
            <p className="relative z-10 mt-3 max-w-sm text-sm leading-6 text-[var(--ink-soft)]">Keep your listings, messages, and likely matches in one place.</p>
          </aside>

          <div className="mx-auto w-full max-w-[27rem] lg:border-l lg:border-[var(--line-soft)] lg:pl-14 xl:pl-20">
            <div className="relative mx-auto mb-3 flex h-14 w-14 items-center justify-center text-[var(--lavender)] lg:mb-5 lg:h-20 lg:w-20" aria-hidden="true">
              <Fingerprint className="h-11 w-11 lg:h-16 lg:w-16" strokeWidth={1.35} />
              <span className="auth-dot auth-dot--mobile-one" />
              <span className="auth-dot auth-dot--mobile-two" />
            </div>

            <div className="mb-6 text-center">
            <h1 className="text-[1.75rem] font-bold text-[var(--foreground)] md:text-4xl">
              {needsConfirmation ? "Confirm account" : mode === "login" ? "Welcome back" : "Join Remnant"}
            </h1>
            <p className="mt-2 text-sm text-[var(--muted-foreground)]">
              {needsConfirmation ? `Enter the code we sent to ${email}.` : mode === "login" ? "Log in to manage your listings and messages." : "Create an account to list, search, and message."}
            </p>
          </div>

          {!needsConfirmation && (
            <nav className="mb-5 flex justify-center gap-7 border-b border-[var(--line-soft)]" aria-label="Account access">
              <Link href={loginPath} replace scroll={false} aria-current={mode === "login" ? "page" : undefined} className={`border-b-2 px-1 pb-3 text-sm font-bold transition-colors ${mode === "login" ? "border-[var(--brand)] text-[var(--brand)]" : "border-transparent text-[var(--muted-foreground)] hover:text-[var(--brand)]"}`}>Log in</Link>
              <Link href={signupPath} replace scroll={false} aria-current={mode === "signup" ? "page" : undefined} className={`border-b-2 px-1 pb-3 text-sm font-bold transition-colors ${mode === "signup" ? "border-[var(--brand)] text-[var(--brand)]" : "border-transparent text-[var(--muted-foreground)] hover:text-[var(--brand)]"}`}>Create account</Link>
            </nav>
          )}

          <form onSubmit={(event) => { event.preventDefault(); void submit(); }}>
            {needsConfirmation ? (
              <>
                <label htmlFor="auth-code" className="mb-2 block text-sm font-bold text-[var(--foreground)]">Confirmation code</label>
                <input id="auth-code" type="text" value={confirmationCode} onChange={(event) => setConfirmationCode(event.target.value)} placeholder="Code from email" autoComplete="one-time-code" required className="mb-4 h-12 w-full rounded-control border border-[var(--border)] bg-white px-5 py-3 text-base font-semibold outline-none focus:border-[var(--brand)] md:h-[52px]" />
              </>
            ) : (
              <>
                {mode === "signup" && (
                  <>
                    <label htmlFor="auth-name" className="mb-2 block text-sm font-bold text-[var(--foreground)]">Name</label>
                    <div className="relative mb-4">
                      <UserRound size={17} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]" aria-hidden="true" />
                      <input id="auth-name" type="text" value={name} onChange={(event) => setName(event.target.value)} placeholder="Your name" autoComplete="name" required className="h-12 w-full rounded-control border border-[var(--border)] bg-white px-11 py-3 text-base font-semibold outline-none focus:border-[var(--brand)] md:h-[52px]" />
                    </div>
                  </>
                )}

                <label htmlFor="auth-email" className="mb-2 block text-sm font-bold text-[var(--foreground)]">Email address</label>
                <div className="relative mb-4">
                  <Mail size={17} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]" aria-hidden="true" />
                  <input id="auth-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" autoComplete="email" required className="h-12 w-full rounded-control border border-[var(--border)] bg-white px-11 py-3 text-base font-semibold outline-none focus:border-[var(--brand)] md:h-[52px]" />
                </div>

                <label htmlFor="auth-password" className="mb-2 block text-sm font-bold text-[var(--foreground)]">Password</label>
                <div className="relative mb-3">
                  <ShieldCheck size={17} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]" aria-hidden="true" />
                  <input id="auth-password" type={showPassword ? "text" : "password"} value={password} onChange={(event) => setPassword(event.target.value)} placeholder={mode === "signup" ? "At least 8 characters" : "Your password"} autoComplete={mode === "signup" ? "new-password" : "current-password"} required minLength={mode === "signup" ? 8 : undefined} className="h-12 w-full rounded-control border border-[var(--border)] bg-white px-11 py-3 pr-12 text-base font-semibold outline-none focus:border-[var(--brand)] md:h-[52px]" />
                  <button type="button" onClick={() => setShowPassword((value) => !value)} className="absolute right-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-control text-[var(--muted-foreground)] hover:bg-[var(--sand)] hover:text-[var(--brand)]" aria-label={showPassword ? "Hide password" : "Show password"}>
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
                <Button type="button" onClick={() => void beginAuth("Google")} disabled={loading !== null} variant="outline" className="h-12 w-full border-[var(--border)] bg-white text-sm font-bold md:h-[52px]">
                  {loading === "google" ? <Loader2 className="animate-spin" size={18} /> : <FcGoogle size={20} />}
                  {mode === "login" ? "Continue with Google" : "Join with Google"}
                </Button>
              )}
              <Button type="submit" disabled={loading !== null} className="h-12 w-full bg-[var(--foreground)] text-sm font-bold text-white hover:bg-[var(--ink-soft)] md:h-[52px]">
                {loading === "form" ? <Loader2 className="animate-spin" size={18} /> : <ShieldCheck size={18} />}
                {needsConfirmation ? "Confirm account" : mode === "login" ? "Log in" : "Create account"}
                <ArrowRight size={17} />
              </Button>
            </div>

            {mode === "signup" && !needsConfirmation && (
              <p className="mt-5 text-center text-xs font-semibold leading-5 text-[var(--muted-foreground)]">By continuing, you agree to Remnant&apos;s Terms and Privacy Policy.</p>
            )}
          </form>

          {!needsConfirmation && (
            <p className="mt-6 text-center text-sm text-[var(--muted-foreground)]">
              {mode === "login" ? "New to Remnant? " : "Already have an account? "}
              <Link href={mode === "login" ? signupPath : loginPath} className="font-bold text-[var(--brand)] hover:underline">
                {mode === "login" ? "Create an account" : "Log in"}
              </Link>
            </p>
          )}
        </div>
        </div>
      </section>
    </main>
  );
}
