"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Mail, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { authApi } from "@/lib/api";
import { getApiErrorMessage } from "@/lib/errors";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    try {
      if (!codeSent) {
        const result = await authApi.forgotPassword(email);
        setCodeSent(true);
        toast.success(result.message);
      } else {
        const result = await authApi.resetPassword({ email, code, password });
        toast.success(result.message);
        router.push(`/login?email=${encodeURIComponent(email)}`);
      }
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Password reset could not be completed."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[var(--background)] px-5 py-12">
      <section className="w-full max-w-md">
        <Link href="/login" className="mb-5 inline-flex items-center gap-2 text-sm font-bold text-[var(--brand)] hover:underline">
          <ArrowLeft size={16} aria-hidden="true" />
          Back to login
        </Link>
        <form onSubmit={submit} className="surface-card rounded-[1.5rem] bg-white p-6 md:p-8">
          <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--brand-soft)] text-[var(--brand)]">
            <ShieldCheck size={23} aria-hidden="true" />
          </div>
          <h1 className="text-3xl font-bold text-[var(--foreground)]">Reset password</h1>
          <p className="mt-2 text-sm font-semibold leading-6 text-[var(--ink-soft)]">
            {codeSent ? "Enter the code from your email and choose a new password." : "We will email you a secure reset code."}
          </p>

          <label className="mt-6 block space-y-2">
            <span className="text-sm font-bold">Email address</span>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]" size={17} aria-hidden="true" />
              <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} disabled={codeSent} required autoComplete="email" className="h-[52px] w-full rounded-full border border-[var(--border)] bg-white pl-11 pr-4 text-base font-semibold outline-none focus:border-[var(--brand)] disabled:bg-[var(--sand)]" />
            </div>
          </label>

          {codeSent && (
            <>
              <label className="mt-4 block space-y-2">
                <span className="text-sm font-bold">Reset code</span>
                <input value={code} onChange={(event) => setCode(event.target.value)} required autoComplete="one-time-code" className="h-[52px] w-full rounded-full border border-[var(--border)] bg-white px-4 text-base font-semibold outline-none focus:border-[var(--brand)]" />
              </label>
              <label className="mt-4 block space-y-2">
                <span className="text-sm font-bold">New password</span>
                <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} required minLength={8} autoComplete="new-password" className="h-[52px] w-full rounded-full border border-[var(--border)] bg-white px-4 text-base font-semibold outline-none focus:border-[var(--brand)]" />
              </label>
              <p className="mt-3 text-xs font-semibold leading-5 text-[var(--muted-foreground)]">
                Use 8+ characters with uppercase, lowercase, and a number.
              </p>
            </>
          )}

          <Button type="submit" disabled={loading} className="mt-6 h-13 w-full rounded-full bg-[var(--brand)] font-bold text-white hover:bg-[var(--brand-dark)]">
            {loading && <Loader2 className="animate-spin" size={18} />}
            {codeSent ? "Update password" : "Send reset code"}
          </Button>
        </form>
      </section>
    </main>
  );
}
