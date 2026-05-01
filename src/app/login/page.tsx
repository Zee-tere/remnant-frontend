"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/auth";
import { toast } from "sonner";
import { Eye, EyeOff, ArrowRight } from "lucide-react";

export default function LoginPage() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const { login, isLoading } = useAuthStore();
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(form.email, form.password);
      toast.success("Welcome back!");
      router.push("/");
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Login failed";
      toast.error(msg);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-16 bg-gradient-to-br from-[#f0f7f4] via-white to-[#e8f0ec]">
      <div className="w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {/* Logo */}
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-2 mb-6">
              <div className="bg-[#4a7c6f] text-white rounded-xl h-10 w-10 flex items-center justify-center text-lg font-bold">
                R
              </div>
              <span className="text-xl font-bold text-neutral-900">Remnant</span>
            </Link>
            <h1 className="text-2xl font-bold text-neutral-900 mb-1">Welcome back</h1>
            <p className="text-neutral-500 text-sm">Log in to your account</p>
          </div>

          {/* Form */}
          <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-neutral-700">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  id="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  placeholder="your@email.com"
                  className="w-full px-4 py-3 text-sm border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4a7c6f]/20 focus:border-[#4a7c6f] text-neutral-900"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label htmlFor="password" className="text-sm font-medium text-neutral-700">
                    Password
                  </label>
                  <Link href="/forgot-password" className="text-xs text-[#4a7c6f] hover:underline">
                    Forgot?
                  </Link>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    id="password"
                    value={form.password}
                    onChange={handleChange}
                    required
                    placeholder="Enter your password"
                    className="w-full px-4 py-3 pr-12 text-sm border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4a7c6f]/20 focus:border-[#4a7c6f] text-neutral-900"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-[#4a7c6f] hover:bg-[#3d6b5f] text-white text-sm font-semibold rounded-xl transition-colors duration-200 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isLoading ? "Signing in..." : (
                  <>
                    Log in
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>
          </div>

          <p className="mt-6 text-center text-neutral-500 text-sm">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="text-[#4a7c6f] hover:underline font-medium">
              Sign up
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
