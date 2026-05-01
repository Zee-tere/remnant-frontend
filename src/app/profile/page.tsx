'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/auth';
import { userApi } from '@/lib/api';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { User, Mail, MapPin, Star, Shield, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';

const trustTierColors: Record<string, string> = {
  NEW: 'bg-neutral-100 text-neutral-600',
  VERIFIED: 'bg-blue-100 text-blue-700',
  TRUSTED: 'bg-emerald-100 text-emerald-700',
  POWER: 'bg-amber-100 text-amber-700',
};

export default function ProfilePage() {
  const { user, isAuthenticated } = useAuthStore();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [form, setForm] = useState({ name: '', bio: '', city: '' });

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    } else if (user) {
      setForm({ name: user.name || '', bio: user.bio || '', city: user.city || '' });
    }
  }, [isAuthenticated, user, router]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await userApi.updateProfile(form);
      toast.success('Profile updated!');
      setIsEditing(false);
      // Refresh user data
      const updated = await userApi.getMe();
      useAuthStore.getState().setUser(updated);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Update failed';
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 size={28} className="animate-spin text-[#4a7c6f]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f0f7f4] via-white to-[#e8f0ec] py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-sm border border-neutral-100 overflow-hidden"
        >
          {/* Header */}
          <div className="bg-[#4a7c6f] px-8 py-10 text-white relative">
            <div className="flex items-center gap-5">
              <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center text-3xl font-bold">
                {user.avatarUrl ? (
                  <img src={user.avatarUrl} alt={user.name} className="w-full h-full rounded-full object-cover" />
                ) : (
                  user.name.charAt(0).toUpperCase()
                )}
              </div>
              <div>
                <h1 className="text-2xl font-bold">{user.name}</h1>
                <p className="text-white/70 text-sm mt-1">{user.email}</p>
                <span className={`inline-block mt-2 px-2.5 py-0.5 rounded-full text-xs font-medium ${trustTierColors[user.trustTier]} bg-white/90`}>
                  <Shield size={11} className="inline mr-1" />
                  {user.trustTier}
                </span>
              </div>
            </div>
            <div className="absolute top-4 right-4 flex items-center gap-2">
              <div className="bg-white/20 px-3 py-1.5 rounded-full text-sm">
                <Star size={14} className="inline mr-1" />
                {user.points} pts
              </div>
            </div>
          </div>

          {/* Body */}
          <div className="p-8">
            {isEditing ? (
              <form onSubmit={handleSave} className="space-y-5">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-neutral-700 flex items-center gap-1.5">
                    <User size={14} /> Display Name
                  </label>
                  <Input
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    required
                    className="border-neutral-200 focus:border-[#4a7c6f]"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-neutral-700 flex items-center gap-1.5">
                    <Mail size={14} /> Bio
                  </label>
                  <textarea
                    value={form.bio}
                    onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
                    rows={3}
                    placeholder="Tell buyers a bit about yourself..."
                    className="w-full px-3 py-2.5 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4a7c6f]/20 focus:border-[#4a7c6f] resize-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-neutral-700 flex items-center gap-1.5">
                    <MapPin size={14} /> City
                  </label>
                  <Input
                    value={form.city}
                    onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
                    placeholder="e.g. Lagos"
                    className="border-neutral-200 focus:border-[#4a7c6f]"
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <Button type="submit" disabled={isLoading} className="bg-[#4a7c6f] hover:bg-[#3d6b5f] text-white">
                    {isLoading ? 'Saving...' : 'Save changes'}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            ) : (
              <div className="space-y-5">
                {user.bio && (
                  <p className="text-neutral-600 text-sm leading-relaxed">{user.bio}</p>
                )}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2 text-neutral-500">
                    <Mail size={14} />
                    <span>{user.email}</span>
                  </div>
                  {user.city && (
                    <div className="flex items-center gap-2 text-neutral-500">
                      <MapPin size={14} />
                      <span>{user.city}</span>
                    </div>
                  )}
                </div>
                <div className="flex flex-wrap gap-3 pt-2">
                  <Button
                    onClick={() => setIsEditing(true)}
                    className="bg-[#4a7c6f] hover:bg-[#3d6b5f] text-white"
                  >
                    Edit profile
                  </Button>
                  <Link href="/user/dashboard">
                    <Button variant="outline">Go to dashboard</Button>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
