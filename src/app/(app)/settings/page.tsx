import { ShieldCheck, Users, UserCheck, Mail } from "lucide-react";
import { getSettingsOverview } from "@/lib/settings-overview";

export default async function SettingsPage() {
  const overview = await getSettingsOverview();

  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-[32px] font-bold tracking-[-0.02em] text-foreground">
          Settings
        </h2>
        <p className="mt-2 text-base text-muted">
          Manage user access, active users, and workspace configuration.
        </p>
      </header>

      <section className="grid gap-4 md:grid-cols-3">
        <article className="rounded-[20px] border border-outline/70 bg-white p-5">
          <div className="flex items-center gap-2 text-primary">
            <Users className="h-4 w-4" />
            <span className="text-xs font-semibold uppercase tracking-[0.18em]">
              Users
            </span>
          </div>
          <p className="mt-3 text-3xl font-bold text-foreground">{overview.totalUsers}</p>
          <p className="text-sm text-muted">registered users in database</p>
        </article>

        <article className="rounded-[20px] border border-outline/70 bg-white p-5">
          <div className="flex items-center gap-2 text-primary">
            <UserCheck className="h-4 w-4" />
            <span className="text-xs font-semibold uppercase tracking-[0.18em]">
              Active
            </span>
          </div>
          <p className="mt-3 text-3xl font-bold text-foreground">{overview.activeUsers}</p>
          <p className="text-sm text-muted">active users in last 7 days</p>
        </article>

        <article className="rounded-[20px] border border-outline/70 bg-white p-5">
          <div className="flex items-center gap-2 text-primary">
            <ShieldCheck className="h-4 w-4" />
            <span className="text-xs font-semibold uppercase tracking-[0.18em]">
              Auth
            </span>
          </div>
          <p className="mt-3 text-base font-semibold text-foreground">Google SSO Allowlist</p>
          <p className="text-sm text-muted">restricted workspace access</p>
        </article>
      </section>

      <section className="rounded-[24px] border border-outline/70 bg-white p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted">
          Access Configuration
        </p>
        <div className="mt-4 rounded-[16px] bg-surface-soft p-4">
          <div className="flex items-center gap-2 text-primary">
            <Mail className="h-4 w-4" />
            <span className="text-sm font-semibold">Allowed Email</span>
          </div>
          <p className="mt-2 text-base text-foreground">{overview.allowedEmail || "-"}</p>
        </div>
      </section>
    </div>
  );
}
