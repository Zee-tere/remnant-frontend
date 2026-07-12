'use client';

import { useEffect, useState } from 'react';
import { Edit, Loader2, Mail, MapPin, Save, Shield, Star, User, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { userApi } from '@/lib/api';
import { useAuthStore } from '@/lib/auth';

const trustTierLabels: Record<string, string> = {
  NEW: 'New',
  VERIFIED: 'Verified',
  TRUSTED: 'Trusted',
  POWER: 'Power',
};

export default function ProfileSection() {
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: '', bio: '', city: '', avatarUrl: '' });

  useEffect(() => {
    if (!user) return;
    setForm({
      name: user.name ?? '',
      bio: user.bio ?? '',
      city: user.city ?? '',
      avatarUrl: user.avatarUrl ?? '',
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
        avatarUrl: form.avatarUrl || undefined,
      });
      const updatedUser = await userApi.getMe();
      setUser(updatedUser);
      setIsEditing(false);
      toast.success('Profile updated');
    } catch {
      toast.error('Could not update profile');
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

  const initials = user.name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('');

  return (
    <div className="space-y-8">
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="surface-card rounded-[2rem] p-6 md:p-8"
      >
        <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
          <div className="relative shrink-0 self-center lg:self-start">
            <div className="flex h-40 w-40 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-[var(--brand-soft)] text-4xl font-bold text-[var(--brand)] soft-shadow">
              {user.avatarUrl ? (
                <img src={user.avatarUrl} alt={user.name} className="h-full w-full object-cover" />
              ) : (
                initials
              )}
            </div>
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="absolute bottom-2 right-2 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--brand)] text-white soft-shadow"
              aria-label="Edit profile"
            >
              <Edit size={19} aria-hidden="true" />
            </button>
          </div>

          <div className="min-w-0 flex-1 text-center lg:text-left">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <h1 className="text-4xl font-bold text-[var(--foreground)] md:text-5xl">{user.name}</h1>
                <p className="mt-2 text-lg font-semibold text-[var(--muted-foreground)]">{user.email}</p>
              </div>
              <Button
                type="button"
                onClick={() => setIsEditing(true)}
                className="rounded-full bg-[var(--brand)] px-6 font-bold text-white hover:bg-[var(--brand-dark)]"
              >
                <Edit size={17} aria-hidden="true" />
                Edit Profile
              </Button>
            </div>

            <p className="mt-5 max-w-3xl text-base font-medium leading-8 text-[var(--ink-soft)]">
              {user.bio || 'Profile bio has not been added yet. Add a short note to help buyers and sellers understand your collection style.'}
            </p>

            <div className="mt-6 flex flex-wrap justify-center gap-3 lg:justify-start">
              <span className="rounded-full bg-[#e2f7ff] px-4 py-2 text-sm font-bold text-[var(--secondary-blue)]">
                {trustTierLabels[user.trustTier] ?? user.trustTier} curator
              </span>
              <span className="rounded-full bg-[var(--brand-soft)] px-4 py-2 text-sm font-bold text-[var(--brand)]">
                {user.points} points
              </span>
              <span className="rounded-full bg-[#fff6cf] px-4 py-2 text-sm font-bold text-[var(--tertiary-gold)]">
                {user.city || 'City not set'}
              </span>
            </div>
          </div>
        </div>
      </motion.section>

      <div className="grid gap-6 md:grid-cols-3">
        {[
          { label: 'Trust Tier', value: trustTierLabels[user.trustTier] ?? user.trustTier, icon: Shield },
          { label: 'Impact Points', value: user.points.toLocaleString(), icon: Star },
          { label: 'Location', value: user.city || 'Not set', icon: MapPin },
        ].map((stat) => (
          <div key={stat.label} className="surface-card rounded-[2rem] p-6">
            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--brand-soft)] text-[var(--brand)]">
              <stat.icon size={23} aria-hidden="true" />
            </div>
            <p className="text-sm font-bold uppercase text-[var(--muted-foreground)]">{stat.label}</p>
            <p className="mt-2 text-2xl font-bold text-[var(--foreground)]">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-8 lg:grid-cols-12">
        <div className="surface-card rounded-[2rem] p-6 lg:col-span-5">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--brand-soft)] text-[var(--brand)]">
              <User size={21} aria-hidden="true" />
            </div>
            <h2 className="text-2xl font-bold">Profile Details</h2>
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

        <div className="surface-card rounded-[2rem] p-6 lg:col-span-7">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#e2f7ff] text-[var(--secondary-blue)]">
              <Shield size={21} aria-hidden="true" />
            </div>
            <h2 className="text-2xl font-bold">Curator Standing</h2>
          </div>
          <p className="font-medium leading-8 text-[var(--ink-soft)]">
            Your profile is used across listings, messages, and protected transactions. A complete
            profile helps other members understand who they are buying from, trading with, or donating to.
          </p>
          <div className="mt-6 h-2 overflow-hidden rounded-full bg-[var(--sand)]">
            <div className="h-full w-[70%] rounded-full bg-[var(--brand)]" />
          </div>
          <p className="mt-2 text-right text-sm font-bold text-[var(--muted-foreground)]">Profile strength: 70%</p>
        </div>
      </div>

      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-end bg-black/35 p-0 sm:items-center sm:justify-center sm:p-4">
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            onSubmit={handleSave}
            className="max-h-[90vh] w-full overflow-y-auto rounded-t-[2rem] bg-white p-6 soft-shadow sm:max-w-2xl sm:rounded-[2rem]"
          >
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Edit Profile</h2>
                <p className="text-sm font-medium text-[var(--muted-foreground)]">Update what other members see.</p>
              </div>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--sand)] text-[var(--ink-soft)]"
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
                  className="rounded-full"
                />
              </label>
              <label className="space-y-2">
                <span className="text-sm font-bold">City</span>
                <Input
                  value={form.city}
                  onChange={(event) => setForm((current) => ({ ...current, city: event.target.value }))}
                  className="rounded-full"
                />
              </label>
              <label className="space-y-2">
                <span className="text-sm font-bold">Avatar URL</span>
                <Input
                  value={form.avatarUrl}
                  onChange={(event) => setForm((current) => ({ ...current, avatarUrl: event.target.value }))}
                  className="rounded-full"
                />
              </label>
              <label className="space-y-2 sm:col-span-2">
                <span className="text-sm font-bold">Bio</span>
                <textarea
                  value={form.bio}
                  onChange={(event) => setForm((current) => ({ ...current, bio: event.target.value }))}
                  rows={5}
                  className="w-full rounded-[1.5rem] border border-[var(--border)] bg-white px-4 py-3 text-base font-medium outline-none focus:border-[var(--brand)] focus:ring-2 focus:ring-[var(--brand)]/15"
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
