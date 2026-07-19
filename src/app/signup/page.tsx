"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, ArrowRight, CheckCircle2, Eye, EyeOff, Loader2, Mail, ShieldCheck, UserRound } from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { authApi } from "@/lib/api";
import { useAuthStore } from "@/lib/auth";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { getApiErrorMessage } from "@/lib/errors";
import { safeInternalPath, startHostedAuth } from "@/lib/hosted-auth";

const benefits = ["Free to list", "Better match visibility", "Safer message history"];

export default function SignUpPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[var(--warm-white)]" />}>
      <SignUpPageContent />
    </Suspense>
  );
}

function SignUpPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setAuth = useAuthStore((state) => state.setAuth);
  const redirectTo = safeInternalPath(searchParams.get("redirect"));
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmationCode, setConfirmationCode] = useState("");
  const [needsConfirmation, setNeedsConfirmation] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState<"form" | "google" | null>(null);

  const beginAuth = async (provider?: "Google") => {
    setLoading(provider ? "google" : "form");
    try {
      await startHostedAuth({
        returnTo: redirectTo,
        provider,
        screen: "signup",
        loginHint: email.trim() || undefined,
      });
    } catch (error) {
      setLoading(null);
      toast.error(error instanceof Error ? error.message : "Sign-up could not start");
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

  return (
    <main className="min-h-screen bg-[var(--warm-white)] px-4 py-5 md:px-8 md:py-10">
      <section className="mx-auto grid min-h-[74vh] max-w-6xl gap-8 lg:grid-cols-[0.95fr_1fr] lg:items-center">
        <div className="hidden rounded-[2rem] bg-[var(--navy)] p-10 text-white lg:block">
          <Link href="/" className="inline-flex text-[var(--brand-light)]" aria-label="Remnant home">
            <BrandLogo size="auth" />
          </Link>
          <h1 className="mt-16 max-w-md text-5xl font-bold leading-tight">
            Give every useful piece a place.
          </h1>
          <div className="mt-7 space-y-3">
            {benefits.map((benefit) => (
              <div key={benefit} className="flex items-center gap-3 text-sm font-bold text-white/75">
                <CheckCircle2 size={18} className="text-[var(--brand-light)]" />
                {benefit}
              </div>
            ))}
          </div>
        </div>

        <div className="mx-auto w-full max-w-md">
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
            <h1 className="text-[1.75rem] font-bold text-[var(--foreground)] md:text-4xl">Create account</h1>
            <p className="mt-2 text-sm font-semibold text-[var(--muted-foreground)]">
              Join Remnant in a few secure steps.
            </p>
          </div>

          <form
            className="surface-card rounded-xl bg-white p-4 md:rounded-[1.5rem] md:p-7"
            onSubmit={(event) => {
              event.preventDefault();
              if (needsConfirmation) {
                submitConfirmation();
              } else {
                submitSignup();
              }
            }}
          >
            {needsConfirmation ? (
              <>
                <div className="mb-5 rounded-[1.1rem] bg-[var(--brand-soft)] px-4 py-3 text-sm font-semibold leading-6 text-[var(--brand)]">
                  Enter the code sent to {email}.
                </div>
                <label htmlFor="signup-code" className="mb-2 block text-sm font-bold text-[var(--foreground)]">
                  Confirmation code
                </label>
                <input
                  id="signup-code"
                  type="text"
                  value={confirmationCode}
                  onChange={(event) => setConfirmationCode(event.target.value)}
                  placeholder="Code from email"
                  autoComplete="one-time-code"
                  required
                  className="mb-4 h-[52px] w-full rounded-full border border-[var(--border)] bg-white px-5 py-3 text-base font-semibold text-[var(--foreground)] outline-none transition focus:border-[var(--brand)] focus:shadow-[0_0_0_3px_rgba(0,108,82,0.12)]"
                />
              </>
            ) : (
              <>
            <label htmlFor="signup-name" className="mb-2 block text-sm font-bold text-[var(--foreground)]">
              Name
            </label>
            <div className="relative mb-4">
              <UserRound
                size={17}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]"
                aria-hidden="true"
              />
              <input
                id="signup-name"
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Your name"
                autoComplete="name"
                required
                className="h-[52px] w-full rounded-full border border-[var(--border)] bg-white px-11 py-3 text-base font-semibold text-[var(--foreground)] outline-none transition focus:border-[var(--brand)] focus:shadow-[0_0_0_3px_rgba(0,108,82,0.12)]"
              />
            </div>

            <label htmlFor="signup-email" className="mb-2 block text-sm font-bold text-[var(--foreground)]">
              Email address
            </label>
            <div className="relative mb-4">
              <Mail
                size={17}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]"
                aria-hidden="true"
              />
              <input
                id="signup-email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
                required
                className="h-[52px] w-full rounded-full border border-[var(--border)] bg-white px-11 py-3 text-base font-semibold text-[var(--foreground)] outline-none transition focus:border-[var(--brand)] focus:shadow-[0_0_0_3px_rgba(0,108,82,0.12)]"
              />
            </div>

            <label htmlFor="signup-password" className="mb-2 block text-sm font-bold text-[var(--foreground)]">
              Password
            </label>
            <div className="relative mb-4">
              <ShieldCheck
                size={17}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]"
                aria-hidden="true"
              />
              <input
                id="signup-password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="At least 8 characters"
                autoComplete="new-password"
                required
                minLength={8}
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
            <div className="mb-4 rounded-[1rem] bg-[var(--sand)] px-4 py-3 text-xs font-semibold leading-5 text-[var(--ink-soft)]">
              Password must be at least 8 characters and include uppercase, lowercase, and a number.
            </div>
              </>
            )}

            <div className="space-y-3">
              {!needsConfirmation && (
                <Button
                  type="button"
                  onClick={() => beginAuth("Google")}
                  disabled={loading !== null}
                  variant="outline"
                  className="h-14 w-full rounded-full border-[var(--border)] bg-white text-base font-bold"
                >
                  {loading === "google" ? <Loader2 className="animate-spin" size={18} /> : <FcGoogle size={20} />}
                  Join with Google
                </Button>
              )}

              <Button
                type="submit"
                disabled={loading !== null}
                className="h-14 w-full rounded-full bg-[var(--brand)] text-base font-bold text-white hover:bg-[var(--brand-dark)]"
              >
                {loading === "form" ? <Loader2 className="animate-spin" size={18} /> : <ShieldCheck size={18} />}
                {needsConfirmation ? "Confirm account" : "Join now"}
                <ArrowRight size={17} />
              </Button>
            </div>

            <p className="mt-5 text-center text-xs font-semibold leading-5 text-[var(--muted-foreground)]">
              By continuing, you agree to Remnant&apos;s Terms and Privacy Policy.
            </p>
          </form>

          <p className="mt-6 text-center text-sm font-semibold text-[var(--muted-foreground)]">
            Already have an account?{" "}
            <Link href={`/login?redirect=${encodeURIComponent(redirectTo)}`} className="text-[var(--brand)] hover:underline">
              Log in
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
