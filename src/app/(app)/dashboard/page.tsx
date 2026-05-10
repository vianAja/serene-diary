import Link from "next/link";
import {
  Flame,
  Sparkles,
} from "lucide-react";
import { DashboardChecklist } from "@/components/dashboard-checklist";
import {
  getDailyDashboardSnapshot,
} from "@/lib/mock-data";
import { getTemplateLibrary } from "@/lib/template-library";
import { getAuthorizedUserId } from "@/lib/authorized-user";
import { getScheduledTasksByDate } from "@/lib/scheduled-tasks";

export default async function DashboardPage() {
  const dashboard = getDailyDashboardSnapshot();
  const templateLibrary = await getTemplateLibrary();
  const userId = await getAuthorizedUserId();
  const today = new Date().toISOString().slice(0, 10);
  const scheduledTasks = userId ? await getScheduledTasksByDate(today, userId) : [];
  const todayScheduledChecklist = scheduledTasks.map((task) => ({
    id: task.id,
    label: task.title,
    category: task.category,
    description: task.description,
    completed: false,
    color: "#47626c",
    window: task.window,
  }));

  const todayChecklist = [...dashboard.checklist, ...todayScheduledChecklist];

  return (
    <div className="space-y-8">
      <section className="space-y-4 md:hidden">
        <div className="space-y-2 pt-1">
          <h1 className="text-[28px] font-bold tracking-[-0.03em] text-foreground">
            {dashboard.heading.replace(" Checklist", "")}
          </h1>
          <p className="text-base italic text-muted">{dashboard.quote}</p>
        </div>

        <article className="overflow-hidden rounded-[20px] bg-white p-5 shadow-[0px_4px_12px_rgba(137,168,178,0.08)]">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
                Daily Intentions
              </p>
              <p className="mt-2 text-2xl font-semibold text-primary">
                {dashboard.progressLabel} Completed
              </p>
            </div>
            <p className="text-base font-medium text-muted">
              {dashboard.checklist.filter((task) => task.completed).length} of{" "}
              {dashboard.checklist.length}
            </p>
          </div>
          <div className="mt-4 h-3 overflow-hidden rounded-full bg-surface-strong">
            <div
              className="h-full rounded-full bg-primary"
              style={{ width: `${dashboard.progress}%` }}
            />
          </div>
        </article>

        <div className="grid grid-cols-2 gap-4">
          <article className="rounded-[20px] bg-white p-4 text-center shadow-[0px_4px_12px_rgba(137,168,178,0.08)]">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
              Today&apos;s Mood
            </p>
            <div className="mt-3 flex items-center justify-center gap-2">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-xl">
                😊
              </span>
              <span className="font-medium text-primary">Calm</span>
            </div>
          </article>

          <article className="rounded-[20px] bg-white p-4 text-center shadow-[0px_4px_12px_rgba(137,168,178,0.08)]">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
              Current Streak
            </p>
            <div className="mt-3 flex items-center justify-center gap-2 text-[#795740]">
              <Flame className="h-5 w-5 fill-current" />
              <span className="text-xl font-bold">{dashboard.streakDays} Days</span>
            </div>
          </article>
        </div>
      </section>

      <section className="fade-up hidden flex-col gap-5 rounded-[30px] border border-white/40 bg-white/65 p-6 shadow-[0_24px_60px_rgba(71,98,108,0.12)] md:flex md:flex-row md:items-end md:justify-between md:p-8">
        <div className="max-w-2xl space-y-3">
          <div className="inline-flex w-fit items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-primary">
            <Sparkles className="h-4 w-4" />
            Today&apos;s Focus
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-[-0.03em] text-foreground md:text-5xl">
              {dashboard.heading}
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-7 text-muted md:text-base">
              {dashboard.quote}
            </p>
          </div>
        </div>

        <div className="grid gap-4 md:min-w-[320px]">
          <div className="surface-card rounded-[26px] p-5">
            <div className="flex items-center justify-between text-sm text-muted">
              <span>Checklist Progress</span>
              <span className="font-semibold text-primary">
                {dashboard.progressLabel}
              </span>
            </div>
            <div className="mt-3 h-3 overflow-hidden rounded-full bg-secondary/60">
              <div
                className="h-full rounded-full bg-gradient-to-r from-primary-soft to-primary"
                style={{ width: `${dashboard.progress}%` }}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="surface-card rounded-[24px] p-4">
              <div className="flex items-center gap-2 text-primary">
                <Flame className="h-4 w-4" />
                <span className="text-xs font-semibold uppercase tracking-[0.22em]">
                  Streak
                </span>
              </div>
              <p className="mt-3 text-3xl font-bold">{dashboard.streakDays}</p>
              <p className="text-sm text-muted">days in a row</p>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.7fr_1fr]">
        <section className="surface-card fade-up rounded-[24px] p-4 md:rounded-[30px] md:p-7">
          <DashboardChecklist
            initialTasks={todayChecklist}
            initialTemplates={templateLibrary}
            scheduledTasks={todayScheduledChecklist}
          />
        </section>

        <aside className="grid gap-6">
          <section className="surface-card fade-up rounded-[30px] p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted">
                  Quick Summary
                </p>
                <h3 className="mt-2 text-xl font-semibold text-primary">
                  This Week
                </h3>
              </div>
              <Link
                href="/reports/weekly"
                className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white hover:-translate-y-0.5"
              >
                Open Report
              </Link>
            </div>
            <div className="mt-5 grid gap-3">
              {dashboard.highlights.map((highlight) => (
                <div
                  key={highlight.label}
                  className="rounded-[22px] border border-outline/70 bg-surface-soft px-4 py-3"
                >
                  <p className="text-sm text-muted">{highlight.label}</p>
                  <p className="mt-1 text-xl font-semibold">{highlight.value}</p>
                </div>
              ))}
            </div>
          </section>

        </aside>
      </div>
    </div>
  );
}
