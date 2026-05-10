import { CheckCircle2 } from "lucide-react";
import { getAuthorizedUserId } from "@/lib/authorized-user";
import { getScheduledTasksForRange } from "@/lib/scheduled-tasks";
import { getTemplateLibrary } from "@/lib/template-library";
import { mergeActiveTemplateTasks } from "@/lib/template-storage";

function toIsoDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

function makeDateOffset(base: Date, offset: number) {
  const next = new Date(base);
  next.setDate(base.getDate() + offset);
  return next;
}

function getWeekDays() {
  const today = new Date();
  const sunday = makeDateOffset(today, -today.getDay());

  return Array.from({ length: 7 }, (_, index) => {
    const day = makeDateOffset(sunday, index);
    return {
      iso: toIsoDate(day),
      label: day.toLocaleDateString("en-US", { weekday: "short" }),
      date: day.toLocaleDateString("en-US", { day: "2-digit" }),
    };
  });
}

export default async function WeeklyReportPage() {
  const days = getWeekDays();
  const weekStart = days[0]?.iso;
  const weekEnd = days[6]?.iso;
  const templates = await getTemplateLibrary();
  const activeTasks = mergeActiveTemplateTasks(templates);
  const userId = await getAuthorizedUserId();
  const scheduledTasks =
    userId && weekStart && weekEnd
      ? await getScheduledTasksForRange(weekStart, weekEnd, userId)
      : [];

  const rowMap = new Map<string, { name: string; color: string; completion: boolean[] }>();

  for (const task of activeTasks) {
    if (!rowMap.has(task.label)) {
      rowMap.set(task.label, {
        name: task.label,
        color: task.color,
        completion: [true, true, true, true, true, true, true],
      });
    }
  }

  for (const task of scheduledTasks) {
    const dayIndex = days.findIndex((day) => day.iso === task.taskDate);
    if (dayIndex < 0) {
      continue;
    }

    const existing = rowMap.get(task.title);
    if (existing) {
      existing.completion[dayIndex] = true;
    } else {
      const completion = [false, false, false, false, false, false, false];
      completion[dayIndex] = true;
      rowMap.set(task.title, {
        name: task.title,
        color: "#7d6a8b",
        completion,
      });
    }
  }

  const rows = Array.from(rowMap.values());
  const totalCells = rows.length * 7;
  const completedCells = rows.reduce(
    (sum, row) => sum + row.completion.filter(Boolean).length,
    0,
  );
  const completionRate = totalCells === 0 ? 0 : Math.round((completedCells / totalCells) * 100);

  return (
    <div className="space-y-6">
      <section className="surface-card rounded-[30px] p-6 md:p-7">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted">
              Weekly Tracking
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-[-0.03em] text-primary">
              Live Weekly Checklist
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-muted">
              Weekly report now follows active daily checklist templates plus scheduled calendar tasks.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 md:min-w-[320px]">
            <div className="rounded-[22px] border border-outline/70 bg-surface-soft px-4 py-3">
              <p className="text-sm text-muted">Completion rate</p>
              <p className="mt-1 text-xl font-semibold">{completionRate}%</p>
            </div>
            <div className="rounded-[22px] border border-outline/70 bg-surface-soft px-4 py-3">
              <p className="text-sm text-muted">Tasks tracked</p>
              <p className="mt-1 text-xl font-semibold">{rows.length}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="surface-card rounded-[30px] p-4 md:p-6">
        <div className="overflow-x-auto">
          <div className="min-w-[880px]">
            <div className="grid grid-cols-[240px_repeat(7,minmax(72px,1fr))] gap-3 px-2 py-3 text-center text-xs font-semibold uppercase tracking-[0.22em] text-muted">
              <div className="text-left">Task / Template</div>
              {days.map((day) => (
                <div key={day.iso}>
                  <div>{day.label}</div>
                  <div className="mt-1 text-sm font-semibold text-foreground">{day.date}</div>
                </div>
              ))}
            </div>

            <div className="space-y-3">
              {rows.map((row) => (
                <div
                  key={row.name}
                  className="grid grid-cols-[240px_repeat(7,minmax(72px,1fr))] items-center gap-3 rounded-[24px] border border-outline/70 bg-surface-soft/65 px-2 py-3"
                >
                  <div className="flex items-center gap-3 px-3">
                    <span className="h-3 w-3 rounded-full" style={{ backgroundColor: row.color }} />
                    <span className="font-semibold text-foreground">{row.name}</span>
                  </div>
                  {row.completion.map((completed, index) => (
                    <div key={`${row.name}-${index}`} className="flex justify-center">
                      <span
                        className={`flex h-11 w-11 items-center justify-center rounded-2xl border ${
                          completed
                            ? "border-primary bg-primary text-white"
                            : "border-outline bg-white text-muted"
                        }`}
                      >
                        <CheckCircle2 className="h-5 w-5" />
                      </span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
