'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { CheckCircle2, ChevronRight, Edit, Loader2, LogOut, Mail, MapPin, Save, Settings, Shield, Star, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { NameAvatar } from '@/components/ui/name-avatar';
import { DashboardSectionLoading } from '@/components/feedback/LoadingState';
import { userApi } from '@/lib/api';
import { useAuthStore } from '@/lib/auth';
import { getApiErrorMessage } from '@/lib/errors';
import { nigerianStates } from '@/lib/nigeria-locations';

const trustTierLabels: Record<string, string> = {
  NEW: 'New',
  VERIFIED: 'Verified',
  TRUSTED: 'Trusted',
  POWER: 'Power',
};

export default function ProfileSection() {
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);
  const logout = useAuthStore((state) => state.logout);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: '', bio: '', city: '' });

  useEffect(() => {
    if (!user) return;
    setForm({
      name: user.name ?? '',
      bio: user.bio ?? '',
      city: user.city ?? '',
    });
  }, [user]);

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    try {
      await userApi.updateProfile({
        name: form.name,
        bio: form.bio || undefined,
        city: form.city || undefined,
      });
      const updatedUser = await userApi.getMe();
      setUser(updatedUser);
      setIsEditing(false);
      toast.success('Profile updated');
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Could not update profile'));
    } finally {
      setSaving(false);
    }
  };

  if (!user) {
    return <DashboardSectionLoading label="Loading your profile" />;
  }

  const profileFields = [user.name, user.email, user.city, user.bio];
  const completedProfileFields = profileFields.filter((value) => Boolean(value?.trim())).length;
  const profileStrength = Math.round((completedProfileFields / profileFields.length) * 100);
  const profileReady = profileStrength === 100;

  return (
    <div className="mx-auto max-w-4xl space-y-4 md:space-y-6">
      <section className="overflow-hidden rounded-feature border border-black/10 bg-white shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
        <div className="p-5 md:p-8">
          <div className="flex min-w-0 items-start justify-between gap-4">
            <div className="flex min-w-0 items-center gap-4 md:gap-5">
              <NameAvatar name={user.name} className="h-16 w-16 shrink-0 border border-black/5 text-lg md:h-24 md:w-24 md:text-2xl" />
              <div className="min-w-0">
                <h1 className="truncate text-2xl font-bold tracking-[-0.03em] text-black md:text-4xl">{user.name}</h1>
                <p className="mt-0.5 truncate text-sm text-[#666]">{user.email}</p>
                <div className="mt-1.5 flex items-center gap-1.5 text-sm font-medium text-[#333]">
                  <MapPin size={14} className="shrink-0 text-[var(--brand)]" aria-hidden="true" />
                  <span className="truncate">{user.city || 'Location not set'}</span>
                </div>
              </div>
            </div>
            <button type="button" data-keep-round onClick={() => setIsEditing(true)} className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-black text-white transition-transform active:scale-95" aria-label="Edit profile">
              <Edit size={18} aria-hidden="true" />
            </button>
          </div>
          <p className="mt-5 max-w-3xl text-[0.95rem] leading-7 text-[#333] md:text-base">
            {user.bio || 'Add a short bio so buyers and sellers know who they are speaking with.'}
          </p>
        </div>

        <div className="grid grid-cols-3 gap-px border-t border-black/10 bg-black/10">
          {[
            { label: 'Trust', value: trustTierLabels[user.trustTier] ?? user.trustTier, icon: Shield },
            { label: 'Impact', value: user.points.toLocaleString(), icon: Star },
            { label: 'Complete', value: `${profileStrength}%`, icon: CheckCircle2 },
          ].map((stat) => (
            <div key={stat.label} className="min-w-0 bg-[#f7f7f7] px-2 py-4 text-center md:flex md:items-center md:justify-center md:gap-3 md:px-5 md:py-5 md:text-left">
              <stat.icon size={17} className="mx-auto mb-1.5 text-[var(--brand)] md:m-0 md:h-5 md:w-5 md:shrink-0" aria-hidden="true" />
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-black">{stat.value}</p>
                <p className="mt-0.5 truncate text-xs text-[#666]">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-[0.92fr_1.08fr] md:gap-6">
        <section className="rounded-feature bg-[#f4f4f4] p-4 md:p-6">
          <h2 className="px-1 text-lg font-bold tracking-[-0.02em] text-black md:text-xl">Profile details</h2>
          <div className="mt-4 space-y-2.5">
            <div className="flex min-w-0 items-center gap-3 rounded-surface bg-white px-4 py-4 text-sm text-[#333]">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#f2f2f2]" data-preserve-icon-frame><Mail size={16} aria-hidden="true" /></span>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-[#777]">Email</p>
                <p className="mt-0.5 truncate font-semibold">{user.email}</p>
              </div>
            </div>
            <div className="flex min-w-0 items-center gap-3 rounded-surface bg-white px-4 py-4 text-sm text-[#333]">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#f2f2f2] text-[var(--brand)]" data-preserve-icon-frame><MapPin size={16} aria-hidden="true" /></span>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-[#777]">Location</p>
                <p className="mt-0.5 truncate font-semibold">{user.city || 'Not set'}</p>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-feature border border-black/10 bg-white p-5 md:p-7">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.1em] text-[var(--brand)]">Profile status</p>
              <h2 className="mt-1.5 text-lg font-bold tracking-[-0.02em] text-black md:text-xl">{profileReady ? 'Your profile is ready' : 'A few details will improve your profile'}</h2>
            </div>
            <span className="shrink-0 rounded-full bg-[#f3f3f3] px-3 py-1.5 text-xs font-bold text-[#333]">
              {completedProfileFields} of {profileFields.length}
            </span>
          </div>
          <p className="mt-3 text-sm leading-6 text-[#555]">
            {profileReady
              ? 'Buyers and sellers can see enough context to recognise who they are dealing with.'
              : 'Add your location and a short bio so people have useful context before they message you.'}
          </p>
          <div className="mt-5 h-2 overflow-hidden rounded-full bg-[#ededed]" aria-label={`Profile ${profileStrength}% complete`}>
            <motion.div initial={{ scaleX: 0 }} animate={{ scaleX: profileStrength / 100 }} transition={{ duration: 0.4, ease: 'easeOut' }} className="h-full origin-left rounded-full bg-[var(--brand)]" />
          </div>
          {!profileReady && (
            <button type="button" data-keep-round onClick={() => setIsEditing(true)} className="mt-5 min-h-11 rounded-full bg-black px-5 text-sm font-bold text-white">
              Complete profile
            </button>
          )}
        </section>
      </div>

      <div className="overflow-hidden rounded-feature border border-black/10 bg-white md:hidden">
        <Link href="/user/dashboard?section=settings" className="flex min-h-14 items-center gap-3 px-5 text-sm font-semibold text-black">
          <Settings size={18} aria-hidden="true" />
          <span className="flex-1">Settings</span>
          <ChevronRight size={17} className="text-[#777]" aria-hidden="true" />
        </Link>
        <button type="button" onClick={() => { logout(); window.location.href = '/'; }} className="flex min-h-14 w-full items-center gap-3 border-t border-black/10 px-5 text-left text-sm font-semibold text-red-600">
          <LogOut size={18} aria-hidden="true" />
          <span className="flex-1">Log out</span>
          <ChevronRight size={17} className="text-red-300" aria-hidden="true" />
        </button>
      </div>

      {isEditing && (
        <div className="fixed inset-0 z-[70] flex items-end bg-black/30 p-0 backdrop-blur-[2px] sm:items-center sm:justify-center sm:p-4">
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            onSubmit={handleSave}
            className="max-h-[90vh] w-full overflow-y-auto rounded-t-feature bg-white p-5 pb-[calc(1.25rem+var(--safe-area-bottom))] shadow-[0_-8px_30px_rgba(0,0,0,0.12)] sm:max-w-2xl sm:rounded-feature sm:p-7"
          >
            <div className="mb-5 flex items-center justify-between sm:mb-6">
              <div>
                <h2 className="text-xl font-bold tracking-[-0.025em] sm:text-2xl">Edit profile</h2>
                <p className="mt-0.5 text-sm font-medium text-[#666]">Update what other members see.</p>
              </div>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                data-keep-round
                className="flex h-11 w-11 items-center justify-center rounded-full bg-[#f2f2f2] text-black"
                aria-label="Close profile editor"
              >
                <X size={19} aria-hidden="true" />
              </button>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <label className="space-y-2 sm:col-span-2">
                <span className="text-sm font-bold">Display name</span>
                <Input
                  data-keep-round
                  value={form.name}
                  onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                  required
                  className="h-13 rounded-card border-transparent bg-[#f3f3f3] px-4 text-base focus-visible:border-black/15 focus-visible:ring-black/5"
                />
              </label>
              <label className="space-y-2 sm:col-span-2">
                <span className="text-sm font-bold">State</span>
                <select
                  data-keep-round
                  value={form.city}
                  onChange={(event) => setForm((current) => ({ ...current, city: event.target.value }))}
                  className="h-13 w-full rounded-card border border-transparent bg-[#f3f3f3] px-4 text-base font-semibold outline-none focus:border-black/15 sm:text-sm"
                >
                  <option value="">Choose a state</option>
                  {nigerianStates.map((state) => <option key={state} value={state}>{state}</option>)}
                </select>
              </label>
              <label className="space-y-2 sm:col-span-2">
                <span className="text-sm font-bold">Bio</span>
                <textarea
                  data-keep-round
                  value={form.bio}
                  onChange={(event) => setForm((current) => ({ ...current, bio: event.target.value }))}
                  rows={5}
                  className="w-full rounded-surface border border-transparent bg-[#f3f3f3] px-4 py-3 text-base font-medium outline-none focus:border-black/15 focus:ring-2 focus:ring-black/5"
                />
              </label>
            </div>

            <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <Button type="button" variant="outline" onClick={() => setIsEditing(false)} className="border-black/10 font-bold">
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={saving}
                className="bg-black px-7 font-bold text-white hover:bg-[#222]"
              >
                {saving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                Save profile
              </Button>
            </div>
          </motion.form>
        </div>
      )}
    </div>
  );
}
