import Link from "next/link";
import type { ReactNode } from "react";
import { CalendarDays, Settings } from "lucide-react";
import { SidebarNav } from "@/components/sidebar-nav";
import { getHeaderDateLabel } from "@/lib/mock-data";
import { getViewerProfile } from "@/lib/viewer-profile";
import { ProfileMenu } from "@/components/profile-menu";
import { MobileBottomNav } from "@/components/mobile-bottom-nav";

export async function AppShell({ children }: { children: ReactNode }) {
  const profile = await getViewerProfile();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="fixed left-0 top-0 z-40 h-16 w-full border-b border-outline/70 bg-surface/95 shadow-[0_4px_16px_rgba(17,45,78,0.05)] backdrop-blur">
        <div className="mx-auto hidden h-full max-w-[1600px] items-center justify-between px-4 md:flex md:px-6">
          <div className="flex items-center gap-3">
            <Link href="/checkin" className="text-[20px] font-bold tracking-[-0.02em] text-primary">
              SereneDiary
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/calendar"
              aria-label="Open calendar"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-outline bg-surface text-primary hover:bg-surface-soft"
            >
              <CalendarDays className="h-4 w-4" />
            </Link>
            <Link
              href="/settings"
              aria-label="Open settings"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-outline bg-surface text-primary hover:bg-surface-soft"
            >
              <Settings className="h-4 w-4" />
            </Link>
            <ProfileMenu profile={profile} />
          </div>
        </div>

        <div className="relative flex h-full items-center justify-between px-4 md:hidden">
          <ProfileMenu profile={profile} />
          <Link
            href="/checkin"
            className="absolute left-1/2 -translate-x-1/2 text-[24px] font-bold tracking-[-0.03em] text-primary"
          >
            SereneDiary
          </Link>
          <div className="flex items-center gap-2">
            <Link
              href="/calendar"
              aria-label="Open calendar"
              className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-outline bg-surface text-primary"
            >
              <CalendarDays className="h-4 w-4" />
            </Link>
            <Link
              href="/settings"
              aria-label="Open settings"
              className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-outline bg-surface text-primary"
            >
              <Settings className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </header>

      <aside className="fixed left-0 top-0 hidden h-screen w-64 overflow-y-auto border-r border-outline/70 bg-surface pt-20 md:flex md:flex-col">
        <div className="px-5 pb-6">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">Workspace</p>
          <h2 className="mt-2 text-[20px] font-bold tracking-[-0.02em] text-foreground">SereneDiary</h2>
        </div>

        <SidebarNav />
      </aside>

      <div className="md:ml-64">
        <main className="px-4 pb-28 pt-20 md:px-8 md:pb-12">
          <div className="mx-auto max-w-[1200px]">
            <div className="mb-8 hidden md:block">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">
                Today
              </p>
              <p className="mt-1 text-[18px] font-semibold text-primary">
                {getHeaderDateLabel()}
              </p>
            </div>
            {children}
          </div>
        </main>
      </div>

      <MobileBottomNav />
    </div>
  );
}
