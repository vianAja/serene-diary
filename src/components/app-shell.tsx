import Link from "next/link";
import type { ReactNode } from "react";
import {
  Bell,
  CalendarDays,
  CircleHelp,
  Settings,
} from "lucide-react";
import { SidebarNav } from "@/components/sidebar-nav";
import { getHeaderDateLabel } from "@/lib/mock-data";
import { getViewerProfile } from "@/lib/viewer-profile";
import { ProfileMenu } from "@/components/profile-menu";
import { MobileBottomNav } from "@/components/mobile-bottom-nav";

export async function AppShell({ children }: { children: ReactNode }) {
  const profile = await getViewerProfile();

  return (
    <div className="min-h-screen bg-[#faf9f9] text-[#1a1c1c]">
      <header className="fixed left-0 top-0 z-40 h-16 w-full border-b border-outline/30 bg-white shadow-[0px_4px_12px_rgba(137,168,178,0.08)]">
        <div className="mx-auto hidden h-full max-w-[1600px] items-center justify-between px-4 md:flex md:px-6">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="text-[20px] font-bold text-primary">
              SereneDiary
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <button className="rounded-full p-2 text-muted hover:bg-surface-soft">
              <CalendarDays className="h-4 w-4" />
            </button>
            <button className="rounded-full p-2 text-muted hover:bg-surface-soft">
              <Bell className="h-4 w-4" />
            </button>
            <ProfileMenu profile={profile} />
          </div>
        </div>

        <div className="relative flex h-full items-center justify-between px-4 md:hidden">
          <ProfileMenu profile={profile} />
          <Link
            href="/dashboard"
            className="absolute left-1/2 -translate-x-1/2 text-[24px] font-bold text-primary"
          >
            SereneDiary
          </Link>
          <button className="rounded-full p-2 text-muted hover:bg-surface-soft">
            <Settings className="h-5 w-5" />
          </button>
        </div>
      </header>

      <aside className="fixed left-0 top-0 hidden h-screen w-64 overflow-y-auto border-r border-outline/40 bg-white pt-20 shadow-md md:flex md:flex-col">
        <div className="px-4 pb-6">
          <h2 className="text-[20px] font-bold text-primary">Welcome back</h2>
          <p className="text-sm text-muted">Stay mindful today</p>
        </div>

        <div className="px-4 pb-6">
          <button className="flex w-full items-center gap-3 rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-white hover:bg-primary/90">
            <span className="text-lg">+</span>
            <span>New Entry</span>
          </button>
        </div>

        <SidebarNav />

        <div className="mt-auto border-t border-outline/40 px-4 py-4">
          <div className="space-y-2">
            <button className="flex w-full items-center gap-3 rounded-lg px-4 py-2 text-sm text-muted hover:bg-surface-soft">
              <Settings className="h-4 w-4" />
              <span>Settings</span>
            </button>
            <button className="flex w-full items-center gap-3 rounded-lg px-4 py-2 text-sm text-muted hover:bg-surface-soft">
              <CircleHelp className="h-4 w-4" />
              <span>Help</span>
            </button>
          </div>
        </div>
      </aside>

      <div className="md:ml-64">
        <main className="px-4 pb-28 pt-20 md:px-8 md:pb-12">
          <div className="mx-auto max-w-[1200px]">
            <div className="mb-8 hidden md:block">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted">
                SereneDiary Workspace
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
