import { getSettingsOverview } from "@/lib/settings-overview";
import { SettingsManager } from "@/components/settings-manager";

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

      <SettingsManager
        totalUsers={overview.totalUsers}
        activeUsers={overview.activeUsers}
        initialAllowedUsers={overview.allowedUsers}
      />
    </div>
  );
}
