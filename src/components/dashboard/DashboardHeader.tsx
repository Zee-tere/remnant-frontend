"use client";

import { useAuthStore } from "@/lib/auth";
import { NameAvatar } from "@/components/ui/name-avatar";

export default function DashboardHeader() {
  const user = useAuthStore((state) => state.user);
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <h1 className="text-3xl font-bold text-foreground">My Dashboard</h1>
        <p className="text-sm text-muted-foreground">Manage listings, messages, matches, and account activity.</p>
      </div>
      <NameAvatar name={user?.name ?? "Remnant"} className="h-11 w-11 text-sm" />
    </div>
  );
}
