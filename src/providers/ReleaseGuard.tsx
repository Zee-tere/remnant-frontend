'use client';

import { useEffect } from 'react';

const currentReleaseId = process.env.NEXT_PUBLIC_RELEASE_ID || 'local';
const releaseCheckInterval = 60_000;

export function ReleaseGuard() {
  useEffect(() => {
    let lastCheckedAt = 0;

    const checkRelease = async () => {
      if (currentReleaseId === 'local') return;
      const now = Date.now();
      if (now - lastCheckedAt < releaseCheckInterval) return;
      lastCheckedAt = now;

      try {
        const response = await fetch(`/api/release?t=${now}`, { cache: 'no-store' });
        if (!response.ok) return;
        const { releaseId } = (await response.json()) as { releaseId?: string };
        if (!releaseId || releaseId === currentReleaseId) return;

        const reloadKey = `remnant-release-reload:${releaseId}`;
        if (sessionStorage.getItem(reloadKey)) return;
        sessionStorage.setItem(reloadKey, '1');

        const nextUrl = new URL(window.location.href);
        nextUrl.searchParams.set('_release', releaseId.slice(0, 12));
        window.location.replace(nextUrl.toString());
      } catch {
        // A release check must never interrupt the user's current page.
      }
    };

    void checkRelease();
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') void checkRelease();
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, []);

  return null;
}
