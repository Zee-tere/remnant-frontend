"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowRight, CheckCircle2, Home, Loader2, Mail, ShieldCheck, ShoppingBag } from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { startHostedAuth } from "@/lib/hosted-auth";

const benefits = ["Free to list", "Better match visibility", "Safer message history"];

export default function SignUpPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[var(--warm-white)]" />}>
      <SignUpPageContent />
    </Suspense>
  );
}

function SignUpPageContent() {
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/";
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState<"hosted" | "google" | null>(null);

  const beginAuth = async (provider?: "Google") => {
    setLoading(provider ? "google" : "hosted");
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

  return (
    <main className="min-h-screen bg-[var(--warm-white)] px-5 py-10 md:px-8">
      <nav className="mx-auto mb-6 flex max-w-6xl items-center justify-between lg:hidden" aria-label="Signup navigation">
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
          <div className="mb-7 text-center lg:text-left">
            <h1 className="text-3xl font-bold text-[var(--foreground)] md:text-4xl">Create account</h1>
            <p className="mt-2 text-sm font-semibold text-[var(--muted-foreground)]">
              Join Remnant in a few secure steps.
            </p>
          </div>

          <form
            className="surface-card rounded-[1.5rem] bg-white p-5 md:p-7"
            onSubmit={(event) => {
              event.preventDefault();
              beginAuth();
            }}
          >
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
                Join with Google
              </Button>

              <Button
                type="submit"
                disabled={loading !== null}
                className="h-14 w-full rounded-full bg-[var(--brand)] text-base font-bold text-white hover:bg-[var(--brand-dark)]"
              >
                {loading === "hosted" ? <Loader2 className="animate-spin" size={18} /> : <ShieldCheck size={18} />}
                Join now
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
