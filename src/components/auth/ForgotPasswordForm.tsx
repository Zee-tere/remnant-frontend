'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetch(`${API_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      // Always show the same message — prevents email enumeration on frontend too
      setSubmitted(true);
      toast.success(data.message || 'Check your email for a reset link.');
    } catch {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="text-center space-y-3 w-full max-w-sm mx-auto">
        <div className="text-4xl">📬</div>
        <p className="text-neutral-700 font-medium">Check your inbox</p>
        <p className="text-neutral-400 text-sm">
          If that email is registered, you&apos;ll receive a reset link shortly.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 w-full max-w-sm mx-auto">
      <Input
        type="email"
        placeholder="Enter your email address"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <Button
        type="submit"
        disabled={isLoading}
        className="w-full bg-[#4a7c6f] text-white hover:bg-[#3d6b5f]"
      >
        {isLoading ? 'Sending...' : 'Send Reset Link'}
      </Button>
    </form>
  );
}
