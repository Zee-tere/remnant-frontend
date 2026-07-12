"use client";

import { useAuthStore } from "@/lib/auth";

export default function DashboardHeader() {
  const user = useAuthStore((state) => state.user);
  const initial = user?.name?.charAt(0).toUpperCase() ?? "R";

  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <h1 className="text-3xl font-bold text-foreground">My Dashboard</h1>
        <p className="text-sm text-muted-foreground">Manage listings, messages, matches, and account activity.</p>
      </div>
      <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-full bg-[var(--brand)] text-sm font-bold text-[var(--navy)]">
        {user?.avatarUrl ? <img src={user.avatarUrl} alt="" className="h-full w-full object-cover" /> : initial}
      </div>
    </div>
  );
}
