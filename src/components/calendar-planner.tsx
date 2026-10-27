"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { ChevronLeft, ChevronRight, Plus, Trash2, X } from "lucide-react";

type ScheduledTask = {
  id: string;
  title: string;
  description: string;
  category: string;
  taskDate: string;
  window: string;
};

const weekLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function formatIsoDate(date: Date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function monthLabel(date: Date) {
  return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

function getMonthGrid(monthDate: Date) {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const startOffset = firstDay.getDay();
  const startDate = new Date(year, month, 1 - startOffset);

  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + index);
    return {
      iso: formatIsoDate(date),
      day: date.getDate(),
      isCurrentMonth: date.getMonth() === month,
      isToday: formatIsoDate(date) === formatIsoDate(new Date()),
    };
  });
}

export function CalendarPlanner({
  initialDate,
  initialTasks,
}: {
  initialDate: string;
  initialTasks: ScheduledTask[];
}) {
  const parsedInitialDate = new Date(`${initialDate}T00:00:00`);
  const [viewMonth, setViewMonth] = useState(
    new Date(parsedInitialDate.getFullYear(), parsedInitialDate.getMonth(), 1),
  );
  const [selectedDate, setSelectedDate] = useState(initialDate);
  const [tasksByDate, setTasksByDate] = useState<Record<string, ScheduledTask[]>>({
    [initialDate]: initialTasks,
  });
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [draft, setDraft] = useState({
    title: "",
    description: "",
    category: "Scheduled",
    window: "Scheduled",
  });
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const grid = useMemo(() => getMonthGrid(viewMonth), [viewMonth]);
  const monthStart = grid[0]?.iso ?? initialDate;
  const monthEnd = grid[grid.length - 1]?.iso ?? initialDate;
  const selectedTasks = tasksByDate[selectedDate] ?? [];

  useEffect(() => {
    startTransition(async () => {
      const response = await fetch(
        `/api/scheduled-tasks?startDate=${monthStart}&endDate=${monthEnd}`,
      );
      const payload = (await response.json()) as { tasks?: ScheduledTask[] };
      const grouped: Record<string, ScheduledTask[]> = {};

      for (const task of payload.tasks ?? []) {
        grouped[task.taskDate] = [...(grouped[task.taskDate] ?? []), task];
      }

      setTasksByDate(grouped);
    });
  }, [monthEnd, monthStart]);

  function addTask() {
    if (!draft.title.trim()) {
      setError("Task title is required.");
      return;
    }
    setError(null);
    startTransition(async () => {
      const response = await fetch("/api/scheduled-tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...draft,
          taskDate: selectedDate,
        }),
      });
      const payload = (await response.json()) as { tasks?: ScheduledTask[]; error?: string };
      if (!response.ok) {
        setError(payload.error ?? "Failed to add task.");
        return;
      }
      setTasksByDate((current) => ({ ...current, [selectedDate]: payload.tasks ?? [] }));
      setDraft({
        title: "",
        description: "",
        category: "Scheduled",
        window: "Scheduled",
      });
      setIsComposerOpen(false);
    });
  }

  function removeTask(taskId: string) {
    startTransition(async () => {
      const response = await fetch(`/api/scheduled-tasks?id=${taskId}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        setError("Unable to remove scheduled task.");
        return;
      }
      setTasksByDate((current) => ({
        ...current,
        [selectedDate]: (current[selectedDate] ?? []).filter((task) => task.id !== taskId),
      }));
    });
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1.55fr_1fr]">
      <section className="overflow-hidden rounded-[24px] border border-outline/70 bg-white shadow-[0_4px_12px_rgba(137,168,178,0.08)]">
        <div className="flex items-center justify-between border-b border-outline/50 bg-[#f5f7fa] px-5 py-4">
          <button
            type="button"
            onClick={() =>
              setViewMonth(
                (current) => new Date(current.getFullYear(), current.getMonth() - 1, 1),
              )
            }
            className="rounded-full border border-outline/70 bg-white p-1.5 text-muted transition-colors hover:text-primary"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <p className="text-xl font-semibold text-primary">{monthLabel(viewMonth)}</p>
          <button
            type="button"
            onClick={() =>
              setViewMonth(
                (current) => new Date(current.getFullYear(), current.getMonth() + 1, 1),
              )
            }
            className="rounded-full border border-outline/70 bg-white p-1.5 text-muted transition-colors hover:text-primary"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        <div className="grid grid-cols-7 border-b border-outline/40 bg-[#fafbfc]">
          {weekLabels.map((label) => (
            <div
              key={label}
              className="border-r border-outline/20 px-3 py-2 text-center text-xs font-semibold uppercase tracking-[0.18em] text-muted last:border-r-0"
            >
              {label}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7">
          {grid.map((day) => {
            const taskCount = tasksByDate[day.iso]?.length ?? 0;
            const isSelected = day.iso === selectedDate;

            return (
              <button
                key={day.iso}
                type="button"
                onClick={() => setSelectedDate(day.iso)}
                className={`relative min-h-[102px] border-r border-t border-outline/20 px-3 py-2 text-left transition-colors ${
                  day.isCurrentMonth ? "bg-white" : "bg-[#f7f8fa]"
                } ${isSelected ? "bg-[#eef5ff]" : "hover:bg-[#f3f6fb]"}`}
              >
                <span
                  className={`inline-flex h-7 w-7 items-center justify-center rounded-full text-sm font-medium ${
                    day.isToday
                      ? "bg-primary text-white"
                      : day.isCurrentMonth
                        ? "text-foreground"
                        : "text-muted"
                  }`}
                >
                  {day.day}
                </span>
                {taskCount > 0 ? (
                  <div className="mt-2 rounded-[8px] bg-secondary/60 px-2 py-1 text-[11px] font-semibold text-primary">
                    {taskCount} task{taskCount > 1 ? "s" : ""}
                  </div>
                ) : null}
              </button>
            );
          })}
        </div>
      </section>

      <aside className="rounded-[24px] border border-outline/70 bg-white p-5 shadow-[0_4px_12px_rgba(137,168,178,0.08)]">
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted">
            Daily Agenda
          </p>
          <button
            type="button"
            onClick={() => setIsComposerOpen((current) => !current)}
            className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-outline/70 bg-white text-primary transition-all hover:-translate-y-0.5 hover:bg-surface-soft"
          >
            {isComposerOpen ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          </button>
        </div>
        <h3 className="mt-2 text-2xl font-semibold text-primary">{selectedDate}</h3>
        <p className="mt-1 text-sm text-muted">
          View-only tasks for this date. Checklist completion stays on the main dashboard.
        </p>

        {isComposerOpen ? (
          <div className="mt-4 rounded-[12px] border border-outline/70 bg-surface-soft p-3">
            <div className="grid gap-2">
              <input
                value={draft.title}
                onChange={(event) =>
                  setDraft((current) => ({ ...current, title: event.target.value }))
                }
                placeholder="Task title"
                className="rounded-[10px] border border-outline bg-white px-3 py-2 text-sm outline-none focus:border-primary"
              />
              <textarea
                value={draft.description}
                onChange={(event) =>
                  setDraft((current) => ({ ...current, description: event.target.value }))
                }
                placeholder="Task description"
                className="min-h-20 rounded-[10px] border border-outline bg-white px-3 py-2 text-sm outline-none focus:border-primary"
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  value={draft.category}
                  onChange={(event) =>
                    setDraft((current) => ({ ...current, category: event.target.value }))
                  }
                  placeholder="Category"
                  className="rounded-[10px] border border-outline bg-white px-3 py-2 text-sm outline-none focus:border-primary"
                />
                <input
                  value={draft.window}
                  onChange={(event) =>
                    setDraft((current) => ({ ...current, window: event.target.value }))
                  }
                  placeholder="Time"
                  className="rounded-[10px] border border-outline bg-white px-3 py-2 text-sm outline-none focus:border-primary"
                />
              </div>
              {error ? (
                <div className="rounded-[10px] border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  {error}
                </div>
              ) : null}
              <button
                type="button"
                onClick={addTask}
                disabled={isPending}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary/90 disabled:cursor-wait disabled:opacity-70"
              >
                <Plus className="h-4 w-4" />
                Add Task
              </button>
            </div>
          </div>
        ) : null}

        <div className="mt-5 space-y-3">
          {isPending ? (
            <article className="rounded-[12px] border border-outline/60 bg-surface-soft px-3 py-3 text-sm text-muted">
              Loading tasks...
            </article>
          ) : selectedTasks.length === 0 ? (
            <article className="rounded-[12px] border border-dashed border-outline px-3 py-3 text-sm text-muted">
              No tasks scheduled for this date.
            </article>
          ) : (
            selectedTasks.map((task) => (
              <article
                key={task.id}
                className="rounded-[12px] border border-outline/60 bg-surface-soft px-3 py-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-base font-semibold text-foreground">{task.title}</p>
                    <p className="mt-1 text-sm text-muted">{task.description}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeTask(task.id)}
                    aria-label={`Remove ${task.title}`}
                    className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-muted hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
                <div className="mt-2 flex gap-2">
                  <span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-semibold text-primary">
                    {task.category}
                  </span>
                  <span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-semibold text-muted">
                    {task.window}
                  </span>
                </div>
              </article>
            ))
          )}
        </div>
      </aside>
    </div>
  );
}
