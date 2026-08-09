'use client';

import { useEffect, useState } from 'react';
import { Bell, Download, Loader2, Lock, Mail, Save, Shield, Trash2, User } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { DashboardSectionLoading } from '@/components/feedback/LoadingState';
import { userApi } from '@/lib/api';
import { useAuthStore } from '@/lib/auth';
import { getApiErrorMessage } from '@/lib/errors';
import { nigerianStates } from '@/lib/nigeria-locations';

interface LocalSettings {
  emailAlerts: boolean;
  matchAlerts: boolean;
  messageAlerts: boolean;
  profilePublic: boolean;
  showCity: boolean;
}

const defaultSettings: LocalSettings = {
  emailAlerts: true,
  matchAlerts: true,
  messageAlerts: true,
  profilePublic: false,
  showCity: false,
};

const storageKey = 'remnant-dashboard-settings';

export default function SettingsSection() {
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);
  const [settings, setSettings] = useState<LocalSettings>(defaultSettings);
  const [profileForm, setProfileForm] = useState({ name: '', city: '', bio: '' });
  const [saving, setSaving] = useState(false);
  const [accountAction, setAccountAction] = useState<'export' | 'delete' | null>(null);
  const logout = useAuthStore((state) => state.logout);

  useEffect(() => {
    if (!user) return;
    setProfileForm({
      name: user.name ?? '',
      city: user.city ?? '',
      bio: user.bio ?? '',
    });
    setSettings((current) => ({
      ...current,
      profilePublic: user.isPublicProfile,
      showCity: user.showStateOnProfile,
    }));
  }, [user]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const saved = window.localStorage.getItem(storageKey);
    if (!saved) return;

    try {
      const parsed = JSON.parse(saved) as Partial<LocalSettings>;
      setSettings((current) => ({
        ...current,
        emailAlerts: parsed.emailAlerts ?? current.emailAlerts,
        matchAlerts: parsed.matchAlerts ?? current.matchAlerts,
        messageAlerts: parsed.messageAlerts ?? current.messageAlerts,
      }));
    } catch {
      setSettings(defaultSettings);
    }
  }, []);

  const updateSetting = (key: keyof LocalSettings, value: boolean) => {
    setSettings((current) => ({ ...current, [key]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await userApi.updateProfile({
        name: profileForm.name,
        city: profileForm.city || undefined,
        bio: profileForm.bio || undefined,
        isPublicProfile: settings.profilePublic,
        showStateOnProfile: settings.showCity,
      });
      const updatedUser = await userApi.getMe();
      setUser(updatedUser);

      if (typeof window !== 'undefined') {
        window.localStorage.setItem(storageKey, JSON.stringify({
          emailAlerts: settings.emailAlerts,
          matchAlerts: settings.matchAlerts,
          messageAlerts: settings.messageAlerts,
        }));
      }

      toast.success('Settings saved');
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Could not save settings'));
    } finally {
      setSaving(false);
    }
  };

  const handleExport = async () => {
    setAccountAction('export');
    try {
      const data = await userApi.exportMyData();
      const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }));
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = `remnant-data-${new Date().toISOString().slice(0, 10)}.json`;
      anchor.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Could not export your data'));
    } finally {
      setAccountAction(null);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Permanently deactivate your account and schedule its personal data for anonymization in 30 days? Download your data first if you need a copy.')) return;
    setAccountAction('delete');
    try {
      await userApi.requestDeletion();
      logout();
      window.location.assign('/');
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Could not schedule account deletion'));
      setAccountAction(null);
    }
  };

  if (!user) {
    return <DashboardSectionLoading label="Loading your settings" />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground md:text-3xl">Settings</h1>
          <p className="text-sm text-muted-foreground">Account, notification, and privacy preferences.</p>
        </div>
        <Button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="bg-[var(--brand)] text-white hover:bg-[var(--brand-dark)]"
        >
          {saving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
          Save changes
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
        <Card className="border-[var(--border)] bg-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <User size={18} />
              Account
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <label className="block space-y-2">
              <span className="text-sm font-medium">Display name</span>
              <Input
                value={profileForm.name}
                onChange={(event) => setProfileForm((current) => ({ ...current, name: event.target.value }))}
              />
            </label>
            <label className="block space-y-2">
              <span className="text-sm font-medium">Email</span>
              <Input value={user.email} disabled />
            </label>
            <label className="block space-y-2">
              <span className="text-sm font-medium">State</span>
              <select
                value={profileForm.city}
                onChange={(event) => setProfileForm((current) => ({ ...current, city: event.target.value }))}
                className="h-10 w-full rounded-md border border-[var(--border)] bg-background px-3 text-sm"
              >
                <option value="">Choose a state</option>
                {nigerianStates.map((state) => <option key={state} value={state}>{state}</option>)}
              </select>
            </label>
            <label className="block space-y-2">
              <span className="text-sm font-medium">Bio</span>
              <textarea
                value={profileForm.bio}
                onChange={(event) => setProfileForm((current) => ({ ...current, bio: event.target.value }))}
                rows={4}
                className="w-full rounded-lg border border-[var(--border)] bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--brand)]/20"
              />
            </label>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="border-[var(--border)] bg-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Bell size={18} />
                Notifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { key: 'emailAlerts', label: 'Email alerts', icon: Mail },
                { key: 'matchAlerts', label: 'Pair match alerts', icon: Bell },
                { key: 'messageAlerts', label: 'Message alerts', icon: Bell },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.key} className="flex items-center justify-between gap-4 rounded-lg bg-muted px-3 py-3">
                    <span className="flex items-center gap-2 text-sm font-medium">
                      <Icon size={16} className="text-muted-foreground" />
                      {item.label}
                    </span>
                    <Switch
                      checked={settings[item.key as keyof LocalSettings]}
                      onCheckedChange={(checked) => updateSetting(item.key as keyof LocalSettings, checked)}
                    />
                  </div>
                );
              })}
            </CardContent>
          </Card>

          <Card className="border-[var(--border)] bg-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Shield size={18} />
                Privacy
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { key: 'profilePublic', label: 'Public profile' },
                { key: 'showCity', label: 'Show city on profile' },
              ].map((item) => (
                <div key={item.key} className="flex items-center justify-between gap-4 rounded-lg bg-muted px-3 py-3">
                  <span className="flex items-center gap-2 text-sm font-medium">
                    <Lock size={16} className="text-muted-foreground" />
                    {item.label}
                  </span>
                  <Switch
                    checked={settings[item.key as keyof LocalSettings]}
                    onCheckedChange={(checked) => updateSetting(item.key as keyof LocalSettings, checked)}
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
      <Card className="border-red-200 bg-card">
        <CardHeader><CardTitle className="text-lg">Your data</CardTitle></CardHeader>
        <CardContent className="flex flex-col gap-3 sm:flex-row">
          <Button type="button" variant="outline" onClick={() => void handleExport()} disabled={accountAction !== null}>
            {accountAction === 'export' ? <Loader2 className="animate-spin" size={16} /> : <Download size={16} />}
            Download my data
          </Button>
          <Button type="button" variant="outline" onClick={() => void handleDelete()} disabled={accountAction !== null} className="border-red-200 text-red-700">
            {accountAction === 'delete' ? <Loader2 className="animate-spin" size={16} /> : <Trash2 size={16} />}
            Delete my account
          </Button>
          <p className="text-xs leading-5 text-muted-foreground sm:ml-auto sm:max-w-md">Deletion deactivates access immediately and permanently anonymizes personal data after a 30-day retention window.</p>
        </CardContent>
      </Card>
    </div>
  );
}
