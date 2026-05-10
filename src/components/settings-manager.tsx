"use client";

import { useState, useTransition } from "react";
import { Mail, Plus, ShieldCheck, UserCheck, Users } from "lucide-react";

type AllowedUser = {
  id: string;
  email: string;
  isActive: boolean;
};

export function SettingsManager({
  totalUsers,
  activeUsers,
  initialAllowedUsers,
}: {
  totalUsers: number;
  activeUsers: number;
  initialAllowedUsers: AllowedUser[];
}) {
  const [allowedUsers, setAllowedUsers] = useState(initialAllowedUsers);
  const [newEmail, setNewEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function addEmail() {
    if (!newEmail.trim()) {
      setError("Email is required.");
      return;
    }

    setError(null);
    startTransition(async () => {
      const response = await fetch("/api/allowed-users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: newEmail }),
      });
      const payload = (await response.json()) as {
        users?: AllowedUser[];
        error?: string;
      };

      if (!response.ok) {
        setError(payload.error ?? "Failed to add allowed email.");
        return;
      }

      setAllowedUsers(payload.users ?? []);
      setNewEmail("");
    });
  }

  function setActive(id: string, isActive: boolean) {
    setError(null);
    startTransition(async () => {
      const response = await fetch("/api/allowed-users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, isActive }),
      });
      const payload = (await response.json()) as {
        users?: AllowedUser[];
        error?: string;
      };

      if (!response.ok) {
        setError(payload.error ?? "Failed to update allowed email.");
        return;
      }

      setAllowedUsers(payload.users ?? []);
    });
  }

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-3">
        <article className="rounded-[20px] border border-outline/70 bg-white p-5">
          <div className="flex items-center gap-2 text-primary">
            <Users className="h-4 w-4" />
            <span className="text-xs font-semibold uppercase tracking-[0.18em]">Users</span>
          </div>
          <p className="mt-3 text-3xl font-bold text-foreground">{totalUsers}</p>
          <p className="text-sm text-muted">registered users in database</p>
        </article>

        <article className="rounded-[20px] border border-outline/70 bg-white p-5">
          <div className="flex items-center gap-2 text-primary">
            <UserCheck className="h-4 w-4" />
            <span className="text-xs font-semibold uppercase tracking-[0.18em]">Active</span>
          </div>
          <p className="mt-3 text-3xl font-bold text-foreground">{activeUsers}</p>
          <p className="text-sm text-muted">active users in last 7 days</p>
        </article>

        <article className="rounded-[20px] border border-outline/70 bg-white p-5">
          <div className="flex items-center gap-2 text-primary">
            <ShieldCheck className="h-4 w-4" />
            <span className="text-xs font-semibold uppercase tracking-[0.18em]">Auth</span>
          </div>
          <p className="mt-3 text-base font-semibold text-foreground">Google SSO Allowlist</p>
          <p className="text-sm text-muted">multi-email access control</p>
        </article>
      </section>

      <section className="rounded-[24px] border border-outline/70 bg-white p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted">
          Allowed Emails
        </p>
        <div className="mt-4 flex flex-col gap-3 md:flex-row">
          <input
            value={newEmail}
            onChange={(event) => setNewEmail(event.target.value)}
            placeholder="name@company.com"
            className="flex-1 rounded-[12px] border border-outline bg-white px-3 py-2.5 text-sm outline-none focus:border-primary"
          />
          <button
            type="button"
            onClick={addEmail}
            disabled={isPending}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Plus className="h-4 w-4" />
            Add Allowed Email
          </button>
        </div>
        {error ? (
          <div className="mt-3 rounded-[12px] border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        <div className="mt-4 space-y-2">
          {allowedUsers.map((user) => (
            <article
              key={user.id}
              className="flex items-center justify-between rounded-[12px] border border-outline/60 bg-surface-soft px-3 py-2.5"
            >
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-foreground">{user.email}</span>
              </div>
              <button
                type="button"
                onClick={() => setActive(user.id, !user.isActive)}
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  user.isActive
                    ? "bg-[#d7ece0] text-[#295941]"
                    : "bg-[#f3dfdf] text-[#7f3434]"
                }`}
              >
                {user.isActive ? "Active" : "Blocked"}
              </button>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
