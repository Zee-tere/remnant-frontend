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
    <div className="mx-auto max-w-5xl space-y-3 md:space-y-6">
      <section className="overflow-hidden rounded-card border border-[var(--border)] bg-white md:rounded-surface">
        <div className="p-4 md:p-7">
          <div className="flex min-w-0 items-start gap-3 md:gap-5">
            <NameAvatar name={user.name} className="h-14 w-14 shrink-0 border border-[var(--border)] text-base md:h-24 md:w-24 md:text-2xl" />
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h1 className="truncate text-xl font-bold tracking-[-0.025em] text-[var(--foreground)] md:text-3xl">{user.name}</h1>
                  <p className="mt-0.5 truncate text-xs text-[var(--muted-foreground)] md:text-sm">{user.email}</p>
                </div>
                <Button type="button" onClick={() => setIsEditing(true)} variant="outline" size="sm" className="shrink-0 border-[var(--border)] bg-white">
                  <Edit size={16} aria-hidden="true" />
                  <span className="hidden sm:inline">Edit profile</span>
                </Button>
              </div>
              <div className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-[var(--ink-soft)] md:text-sm">
                <MapPin size={14} className="shrink-0 text-[var(--brand)]" aria-hidden="true" />
                <span className="truncate">{user.city || 'Location not set'}</span>
              </div>
              <p className="mt-3 line-clamp-3 max-w-3xl text-sm leading-6 text-[var(--ink-soft)] md:text-base md:leading-7">
                {user.bio || 'Add a short bio so buyers and sellers know who they are speaking with.'}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 divide-x divide-[var(--border)] border-t border-[var(--border)]">
          {[
            { label: 'Trust level', value: trustTierLabels[user.trustTier] ?? user.trustTier, icon: Shield },
            { label: 'Impact points', value: user.points.toLocaleString(), icon: Star },
            { label: 'Profile', value: `${profileStrength}%`, icon: CheckCircle2 },
          ].map((stat) => (
            <div key={stat.label} className="min-w-0 px-2 py-3 text-center md:flex md:items-center md:gap-3 md:px-6 md:py-4 md:text-left">
              <stat.icon size={16} className="mx-auto mb-1 text-[var(--brand)] md:m-0 md:h-5 md:w-5 md:shrink-0" aria-hidden="true" />
              <div className="min-w-0">
                <p className="truncate text-xs font-bold text-[var(--foreground)] md:text-sm">{stat.value}</p>
                <p className="mt-0.5 truncate text-xs text-[var(--muted-foreground)]">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="grid gap-3 md:grid-cols-[0.9fr_1.1fr] md:gap-6">
        <section className="rounded-card border border-[var(--border)] bg-white p-4 md:p-6">
          <h2 className="text-base font-bold text-[var(--foreground)] md:text-xl">Profile details</h2>
          <div className="mt-4 divide-y divide-[var(--line-soft)] border-y border-[var(--line-soft)]">
            <div className="flex min-w-0 items-center gap-3 py-3 text-sm text-[var(--ink-soft)]">
              <Mail size={16} className="shrink-0 text-[var(--brand)]" aria-hidden="true" />
              <span className="min-w-20 text-xs font-bold text-[var(--muted-foreground)]">Email</span>
              <span className="min-w-0 flex-1 truncate text-right font-semibold">{user.email}</span>
            </div>
            <div className="flex min-w-0 items-center gap-3 py-3 text-sm text-[var(--ink-soft)]">
              <MapPin size={16} className="shrink-0 text-[var(--brand)]" aria-hidden="true" />
              <span className="min-w-20 text-xs font-bold text-[var(--muted-foreground)]">Location</span>
              <span className="min-w-0 flex-1 truncate text-right font-semibold">{user.city || 'Not set'}</span>
            </div>
          </div>
        </section>

        <section className="rounded-card border border-[var(--border)] bg-white p-4 md:p-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.08em] text-[var(--brand)]">Profile status</p>
              <h2 className="mt-1 text-base font-bold text-[var(--foreground)] md:text-xl">{profileReady ? 'Your profile is ready' : 'A few details will improve your profile'}</h2>
            </div>
            <span className="shrink-0 rounded-pill border border-[var(--border)] px-2.5 py-1 text-xs font-bold text-[var(--ink-soft)]">
              {completedProfileFields} of {profileFields.length}
            </span>
          </div>
          <p className="mt-2 text-sm leading-6 text-[var(--ink-soft)]">
            {profileReady
              ? 'Buyers and sellers can see enough context to recognise who they are dealing with.'
              : 'Add your location and a short bio so people have useful context before they message you.'}
          </p>
          <div className="mt-4 h-2 overflow-hidden rounded-pill bg-[var(--sand)]" aria-label={`Profile ${profileStrength}% complete`}>
            <motion.div initial={{ scaleX: 0 }} animate={{ scaleX: profileStrength / 100 }} transition={{ duration: 0.4, ease: 'easeOut' }} className="h-full origin-left rounded-pill bg-[var(--brand)]" />
          </div>
          {!profileReady && (
            <Button type="button" onClick={() => setIsEditing(true)} variant="outline" size="sm" className="mt-4 border-[var(--border)]">
              Complete profile
            </Button>
          )}
        </section>
      </div>

      <div className="overflow-hidden rounded-card border border-[var(--border)] bg-white md:hidden">
        <Link href="/user/dashboard?section=settings" className="flex min-h-12 items-center gap-3 px-4 text-sm font-semibold text-[var(--foreground)]">
          <Settings size={18} className="text-[var(--brand)]" aria-hidden="true" />
          <span className="flex-1">Settings</span>
          <ChevronRight size={17} className="text-[var(--muted-foreground)]" aria-hidden="true" />
        </Link>
        <button type="button" onClick={() => { logout(); window.location.href = '/'; }} className="flex min-h-12 w-full items-center gap-3 border-t border-[var(--border)] px-4 text-left text-sm font-semibold text-red-600">
          <LogOut size={18} aria-hidden="true" />
          <span className="flex-1">Log out</span>
          <ChevronRight size={17} className="text-red-300" aria-hidden="true" />
        </button>
      </div>

      {isEditing && (
        <div className="fixed inset-0 z-[70] flex items-end bg-black/35 p-0 sm:items-center sm:justify-center sm:p-4">
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            onSubmit={handleSave}
            className="max-h-[90vh] w-full overflow-y-auto rounded-t-card border border-[var(--border)] bg-white p-4 pb-[calc(1rem+var(--safe-area-bottom))] sm:max-w-2xl sm:rounded-surface sm:p-6"
          >
            <div className="mb-5 flex items-center justify-between sm:mb-6">
              <div>
                <h2 className="text-xl font-bold sm:text-2xl">Edit Profile</h2>
                <p className="text-sm font-medium text-[var(--muted-foreground)]">Update what other members see.</p>
              </div>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="flex h-10 w-10 items-center justify-center rounded-control border border-[var(--border)] bg-white text-[var(--ink-soft)] sm:h-11 sm:w-11"
                aria-label="Close profile editor"
              >
                <X size={19} aria-hidden="true" />
              </button>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <label className="space-y-2 sm:col-span-2">
                <span className="text-sm font-bold">Display name</span>
                <Input
                  value={form.name}
                  onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                  required
                  className="text-base"
                />
              </label>
              <label className="space-y-2">
                <span className="text-sm font-bold">State</span>
                <select
                  value={form.city}
                  onChange={(event) => setForm((current) => ({ ...current, city: event.target.value }))}
                  className="h-11 w-full rounded-control border border-[var(--border)] bg-white px-4 text-base font-semibold sm:text-sm"
                >
                  <option value="">Choose a state</option>
                  {nigerianStates.map((state) => <option key={state} value={state}>{state}</option>)}
                </select>
              </label>
              <label className="space-y-2 sm:col-span-2">
                <span className="text-sm font-bold">Bio</span>
                <textarea
                  value={form.bio}
                  onChange={(event) => setForm((current) => ({ ...current, bio: event.target.value }))}
                  rows={5}
                  className="w-full rounded-control border border-[var(--border)] bg-white px-4 py-3 text-base font-medium outline-none focus:border-[var(--brand)] focus:ring-2 focus:ring-[var(--brand)]/15"
                />
              </label>
            </div>

            <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <Button type="button" variant="outline" onClick={() => setIsEditing(false)} className="border-[var(--border)] font-bold">
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={saving}
                className="bg-[var(--brand)] px-7 font-bold text-white hover:bg-[var(--brand-dark)]"
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
