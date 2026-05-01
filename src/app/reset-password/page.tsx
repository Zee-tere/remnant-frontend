'use client';

import { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import { Eye, EyeOff, ArrowRight, CheckCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!token) {
    return (
      <div className="text-center space-y-4">
        <div className="text-4xl">⚠️</div>
        <p className="text-neutral-700 font-medium">Invalid reset link</p>
        <p className="text-neutral-400 text-sm">
          This link is missing a token. Please request a new one.
        </p>
        <Link href="/forgot-password">
          <Button className="bg-[#4a7c6f] text-white hover:bg-[#3d6b5f]">
            Request new link
          </Button>
        </Link>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    if (!/[A-Z]/.test(password)) {
      toast.error('Password must contain at least one uppercase letter');
      return;
    }
    if (!/[0-9]/.test(password)) {
      toast.error('Password must contain at least one number');
      return;
    }
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch(`${API_URL}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword: password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Reset failed');

      setSuccess(true);
      toast.success('Password reset successfully!');
      setTimeout(() => router.push('/login'), 2500);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Password reset failed';
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="text-center space-y-4">
        <CheckCircle className="mx-auto text-[#4a7c6f]" size={48} />
        <p className="text-neutral-700 font-semibold text-lg">Password updated!</p>
        <p className="text-neutral-400 text-sm">Redirecting you to login...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-2">
        <label htmlFor="new-password" className="text-sm font-medium text-neutral-700">
          New Password
        </label>
        <div className="relative">
          <Input
            id="new-password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Min 8 chars, 1 uppercase, 1 number"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="pr-10"
          />
          <button
            type="button"
            onClick={() => setShowPassword((p) => !p)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="confirm-password" className="text-sm font-medium text-neutral-700">
          Confirm Password
        </label>
        <Input
          id="confirm-password"
          type="password"
          placeholder="Repeat your password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />
      </div>

      <Button
        type="submit"
        disabled={isLoading}
        className="w-full bg-[#4a7c6f] hover:bg-[#3d6b5f] text-white font-semibold flex items-center justify-center gap-2"
      >
        {isLoading ? 'Resetting...' : (
          <>
            Set new password
            <ArrowRight size={16} />
          </>
        )}
      </Button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-16 bg-gradient-to-br from-[#f0f7f4] via-white to-[#e8f0ec]">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="bg-[#4a7c6f] text-white rounded-xl h-10 w-10 flex items-center justify-center text-lg font-bold">
              R
            </div>
            <span className="text-xl font-bold text-neutral-900">Remnant</span>
          </Link>
          <h1 className="text-2xl font-bold text-neutral-900 mb-1">Set a new password</h1>
          <p className="text-neutral-500 text-sm">Choose a strong password for your account.</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-8">
          <Suspense fallback={<div className="text-center text-neutral-400">Loading...</div>}>
            <ResetPasswordForm />
          </Suspense>
        </div>

        <p className="mt-6 text-center text-neutral-500 text-sm">
          Remembered it?{' '}
          <Link href="/login" className="text-[#4a7c6f] hover:underline font-medium">
            Back to login
          </Link>
        </p>
      </div>
    </div>
  );
}
