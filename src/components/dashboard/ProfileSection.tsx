'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ChevronRight, Edit, Loader2, LogOut, Mail, MapPin, Save, Settings, Shield, Star, User, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { NameAvatar } from '@/components/ui/name-avatar';
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
    return (
      <div className="flex min-h-[360px] items-center justify-center">
        <Loader2 className="animate-spin text-[var(--brand)]" size={30} />
      </div>
    );
  }

  const profileFields = [user.name, user.email, user.city, user.bio];
  const profileStrength = Math.round((profileFields.filter((value) => Boolean(value?.trim())).length / profileFields.length) * 100);

  return (
    <div className="space-y-3 md:space-y-8">
      <section className="overflow-hidden rounded-lg border border-[var(--border)]/70 bg-white md:hidden">
        <div className="p-4">
          <div className="flex min-w-0 items-center gap-3">
            <NameAvatar
              name={user.name}
              className="h-14 w-14 shrink-0 border-2 border-white text-base soft-shadow"
            />
            <div className="min-w-0 flex-1">
              <h1 className="truncate text-lg font-bold text-[var(--foreground)]">{user.name}</h1>
              <p className="truncate text-xs text-[var(--muted-foreground)]">{user.email}</p>
              <div className="mt-1 flex items-center gap-1 text-xs font-semibold text-[var(--ink-soft)]">
                <MapPin size={13} className="shrink-0 text-[var(--brand)]" aria-hidden="true" />
                <span className="truncate">{user.city || 'Location not set'}</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md border border-[var(--border)] bg-white text-[var(--brand)]"
              aria-label="Edit profile"
            >
              <Edit size={17} aria-hidden="true" />
            </button>
          </div>

          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="mt-3 block w-full text-left text-xs leading-5 text-[var(--ink-soft)]"
          >
            {user.bio || 'Add a short bio so buyers and sellers know who they are speaking with.'}
          </button>
        </div>

        <div className="grid grid-cols-3 divide-x divide-[var(--border)]/70 border-y border-[var(--border)]/70 bg-[var(--background)]/45">
          <div className="min-w-0 px-2 py-2.5 text-center">
            <p className="truncate text-xs font-bold text-[var(--foreground)]">
              {trustTierLabels[user.trustTier] ?? user.trustTier}
            </p>
            <p className="mt-0.5 text-[0.62rem] font-semibold text-[var(--muted-foreground)]">Trust</p>
          </div>
          <div className="min-w-0 px-2 py-2.5 text-center">
            <p className="truncate text-xs font-bold text-[var(--foreground)]">{user.points.toLocaleString()}</p>
            <p className="mt-0.5 text-[0.62rem] font-semibold text-[var(--muted-foreground)]">Points</p>
          </div>
          <div className="min-w-0 px-2 py-2.5 text-center">
            <p className="truncate text-xs font-bold text-[var(--foreground)]">{profileStrength}%</p>
            <p className="mt-0.5 text-[0.62rem] font-semibold text-[var(--muted-foreground)]">Profile</p>
          </div>
        </div>

        <div className="px-4 py-3">
          <div className="mb-1.5 flex items-center justify-between text-[0.66rem] font-semibold text-[var(--muted-foreground)]">
            <span>Profile strength</span>
            <span>{profileStrength}%</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-[var(--sand)]">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${profileStrength}%` }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              className="h-full rounded-full bg-[var(--brand)]"
            />
          </div>
        </div>
      </section>

      <div className="overflow-hidden rounded-lg border border-[var(--border)]/70 bg-white md:hidden">
        <Link
          href="/user/dashboard?section=settings"
          className="flex min-h-12 items-center gap-3 px-4 text-sm font-semibold text-[var(--foreground)]"
        >
          <Settings size={18} className="text-[var(--brand)]" aria-hidden="true" />
          <span className="flex-1">Settings</span>
          <ChevronRight size={17} className="text-[var(--muted-foreground)]" aria-hidden="true" />
        </Link>
        <button
          type="button"
          onClick={() => {
            logout();
            window.location.href = '/';
          }}
          className="flex min-h-12 w-full items-center gap-3 border-t border-[var(--border)]/70 px-4 text-left text-sm font-semibold text-red-600"
        >
          <LogOut size={18} aria-hidden="true" />
          <span className="flex-1">Log out</span>
          <ChevronRight size={17} className="text-red-300" aria-hidden="true" />
        </button>
      </div>

      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="surface-card relative hidden rounded-lg p-4 md:block md:rounded-[2rem] md:p-8"
      >
        <div className="flex items-start gap-4 md:flex-col md:gap-8 lg:flex-row lg:items-start">
          <div className="shrink-0 self-start md:self-center lg:self-start">
            <NameAvatar name={user.name} className="h-20 w-20 border-2 border-white text-xl soft-shadow md:h-40 md:w-40 md:border-4 md:text-4xl" />
          </div>

          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-md bg-[var(--brand-soft)] text-[var(--brand)] md:hidden"
            aria-label="Edit profile"
          >
            <Edit size={15} aria-hidden="true" />
          </button>

          <div className="min-w-0 flex-1 text-left md:text-center lg:text-left">
            <div className="flex flex-col gap-2 md:gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <h1 className="truncate text-xl font-bold text-[var(--foreground)] md:text-5xl">{user.name}</h1>
                <p className="mt-1 truncate text-xs font-semibold text-[var(--muted-foreground)] md:mt-2 md:text-lg">{user.email}</p>
              </div>
              <Button
                type="button"
                onClick={() => setIsEditing(true)}
                className="hidden rounded-full bg-[var(--brand)] px-6 font-bold text-white hover:bg-[var(--brand-dark)] md:inline-flex"
              >
                <Edit size={17} aria-hidden="true" />
                Edit Profile
              </Button>
            </div>

            <p className="mt-3 line-clamp-2 max-w-3xl text-xs font-medium leading-5 text-[var(--ink-soft)] md:mt-5 md:block md:text-base md:leading-8">
              {user.bio || 'Profile bio has not been added yet. Add a short note to help buyers and sellers understand your collection style.'}
            </p>

            <div className="mt-3 flex flex-wrap justify-start gap-1.5 md:mt-6 md:justify-center md:gap-3 lg:justify-start">
              <span className="rounded-full bg-[var(--brand-soft)] px-2 py-1 text-[0.65rem] font-bold text-[var(--brand)] md:px-4 md:py-2 md:text-sm">
                {user.points} points
              </span>
              <span className="rounded-full bg-[#fff6cf] px-2 py-1 text-[0.65rem] font-bold text-[var(--tertiary-gold)] md:px-4 md:py-2 md:text-sm">
                {user.city || 'City not set'}
              </span>
            </div>
          </div>
        </div>
      </motion.section>

      <div className="hidden grid-cols-3 gap-6 md:grid">
        {[
          { label: 'Trust Tier', value: trustTierLabels[user.trustTier] ?? user.trustTier, icon: Shield },
          { label: 'Impact Points', value: user.points.toLocaleString(), icon: Star },
          { label: 'Location', value: user.city || 'Not set', icon: MapPin },
        ].map((stat) => (
          <div key={stat.label} className="surface-card min-w-0 rounded-lg p-2.5 md:rounded-[2rem] md:p-6">
            <div className="mb-2 flex h-7 w-7 items-center justify-center rounded-full bg-[var(--brand-soft)] text-[var(--brand)] md:mb-5 md:h-12 md:w-12">
              <stat.icon size={15} className="md:h-[23px] md:w-[23px]" aria-hidden="true" />
            </div>
            <p className="truncate text-[0.58rem] font-bold uppercase text-[var(--muted-foreground)] md:text-sm">{stat.label}</p>
            <p className="mt-1 truncate text-xs font-bold text-[var(--foreground)] md:mt-2 md:text-2xl">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="hidden gap-8 md:grid lg:grid-cols-12">
        <div className="surface-card rounded-lg p-4 md:rounded-[2rem] md:p-6 lg:col-span-5">
          <div className="mb-3 flex items-center gap-2 md:mb-5 md:gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--brand-soft)] text-[var(--brand)] md:h-11 md:w-11">
              <User size={21} aria-hidden="true" />
            </div>
            <h2 className="text-base font-bold md:text-2xl">Profile Details</h2>
          </div>
          <div className="space-y-3 text-sm font-semibold text-[var(--ink-soft)]">
            <div className="flex min-w-0 items-center gap-3 rounded-[1.25rem] bg-[var(--sand)] px-4 py-3">
              <Mail size={16} className="shrink-0 text-[var(--brand)]" aria-hidden="true" />
              <span className="truncate">{user.email}</span>
            </div>
            <div className="flex min-w-0 items-center gap-3 rounded-[1.25rem] bg-[var(--sand)] px-4 py-3">
              <MapPin size={16} className="shrink-0 text-[var(--brand)]" aria-hidden="true" />
              <span className="truncate">{user.city || 'City not set'}</span>
            </div>
          </div>
        </div>

        <div className="surface-card rounded-lg p-4 md:rounded-[2rem] md:p-6 lg:col-span-7">
          <div className="mb-3 flex items-center gap-2 md:mb-5 md:gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#e2f7ff] text-[var(--secondary-blue)] md:h-11 md:w-11">
              <Shield size={21} aria-hidden="true" />
            </div>
            <h2 className="text-base font-bold md:text-2xl">Curator Standing</h2>
          </div>
          <p className="text-xs font-medium leading-5 text-[var(--ink-soft)] md:text-base md:leading-8">
            Your profile is used across listings and messages. A complete profile helps other members
            know who they are speaking with.
          </p>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-[var(--sand)] md:mt-6">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${profileStrength}%` }}
              transition={{ duration: 0.55, ease: 'easeOut' }}
              className="h-full rounded-full bg-[var(--brand)]"
            />
          </div>
          <p className="mt-2 text-right text-xs font-bold text-[var(--muted-foreground)] md:text-sm">Profile strength: {profileStrength}%</p>
        </div>
      </div>

      {isEditing && (
        <div className="fixed inset-0 z-[70] flex items-end bg-black/35 p-0 sm:items-center sm:justify-center sm:p-4">
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            onSubmit={handleSave}
            className="max-h-[90vh] w-full overflow-y-auto rounded-t-xl bg-white p-4 pb-[calc(1rem+var(--safe-area-bottom))] soft-shadow sm:max-w-2xl sm:rounded-[2rem] sm:p-6"
          >
            <div className="mb-5 flex items-center justify-between sm:mb-6">
              <div>
                <h2 className="text-xl font-bold sm:text-2xl">Edit Profile</h2>
                <p className="text-sm font-medium text-[var(--muted-foreground)]">Update what other members see.</p>
              </div>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="flex h-10 w-10 items-center justify-center rounded-md bg-[var(--sand)] text-[var(--ink-soft)] sm:h-11 sm:w-11 sm:rounded-full"
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
                  className="rounded-md text-base sm:rounded-full"
                />
              </label>
              <label className="space-y-2">
                <span className="text-sm font-bold">State</span>
                <select
                  value={form.city}
                  onChange={(event) => setForm((current) => ({ ...current, city: event.target.value }))}
                  className="h-11 w-full rounded-md border border-[var(--border)] bg-white px-4 text-base font-semibold sm:h-10 sm:rounded-full sm:text-sm"
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
                  className="w-full rounded-md border border-[var(--border)] bg-white px-4 py-3 text-base font-medium outline-none focus:border-[var(--brand)] focus:ring-2 focus:ring-[var(--brand)]/15 sm:rounded-[1.5rem]"
                />
              </label>
            </div>

            <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <Button type="button" variant="outline" onClick={() => setIsEditing(false)} className="rounded-full border-[var(--border)] font-bold">
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={saving}
                className="rounded-full bg-[var(--brand)] px-7 font-bold text-white hover:bg-[var(--brand-dark)]"
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
