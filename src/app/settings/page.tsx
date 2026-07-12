import { redirect } from 'next/navigation';

export default function SettingsPage() {
  redirect('/user/dashboard?section=settings');
}
