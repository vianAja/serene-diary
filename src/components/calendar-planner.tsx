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

type Draft = {
  title: string;
  description: string;
  category: string;
  window: string;
};

const weekLabels = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const blankDraft: Draft = {
  title: "",
  description: "",
  category: "Scheduled",
  window: "Scheduled",
};

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
      date,
      iso: formatIsoDate(date),
      day: date.getDate(),
      isCurrentMonth: date.getMonth() === month,
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
  const [modalOpen, setModalOpen] = useState(false);
  const [tasksByDate, setTasksByDate] = useState<Record<string, ScheduledTask[]>>({
    [initialDate]: initialTasks,
  });
  const [draft, setDraft] = useState<Draft>(blankDraft);
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

  function openDay(iso: string) {
    setSelectedDate(iso);
    setError(null);
    setModalOpen(true);
  }

  function createTask() {
    if (!draft.title.trim()) {
      setError("Task title is required.");
      return;
    }

    setError(null);
    startTransition(async () => {
      const response = await fetch("/api/scheduled-tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...draft,
          taskDate: selectedDate,
        }),
      });
      const payload = (await response.json()) as { tasks?: ScheduledTask[]; error?: string };

      if (!response.ok) {
        setError(payload.error ?? "Unable to save scheduled task.");
        return;
      }

      setTasksByDate((current) => ({ ...current, [selectedDate]: payload.tasks ?? [] }));
      setDraft(blankDraft);
    });
  }

  function removeTask(taskId: string) {
    startTransition(async () => {
      await fetch(`/api/scheduled-tasks?id=${taskId}`, { method: "DELETE" });
      setTasksByDate((current) => ({
        ...current,
        [selectedDate]: (current[selectedDate] ?? []).filter((task) => task.id !== taskId),
      }));
    });
  }

  return (
    <>
      <section className="overflow-hidden rounded-[16px] border border-outline/70 bg-white shadow-[0_4px_12px_rgba(137,168,178,0.08)]">
        <div className="flex items-center justify-between bg-gradient-to-b from-[#1d7ccc] to-[#165f9f] px-4 py-2 text-white">
          <button
            type="button"
            onClick={() =>
              setViewMonth(
                (current) => new Date(current.getFullYear(), current.getMonth() - 1, 1),
              )
            }
            className="rounded-full p-1 hover:bg-white/20"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <p className="text-[28px] font-bold tracking-[-0.02em]">{monthLabel(viewMonth)}</p>
          <button
            type="button"
            onClick={() =>
              setViewMonth(
                (current) => new Date(current.getFullYear(), current.getMonth() + 1, 1),
              )
            }
            className="rounded-full p-1 hover:bg-white/20"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        <div className="grid grid-cols-8 border-t border-outline/50">
          <div className="border-r border-outline/40 bg-surface-soft px-2 py-2 text-center text-xs font-semibold text-muted">
            No.
          </div>
          {weekLabels.map((label) => (
            <div
              key={label}
              className="bg-surface-soft px-2 py-2 text-center text-sm font-semibold text-muted"
            >
              {label}
            </div>
          ))}
        </div>

        {Array.from({ length: 6 }, (_, weekIndex) => {
          const week = grid.slice(weekIndex * 7, weekIndex * 7 + 7);
          return (
            <div key={`week-${weekIndex}`} className="grid grid-cols-8 border-t border-outline/30">
              <div className="border-r border-outline/30 bg-surface-soft px-2 py-3 text-center text-sm italic text-muted">
                {40 + weekIndex}
              </div>
              {week.map((day) => {
                const isSelected = day.iso === selectedDate;
                const taskCount = tasksByDate[day.iso]?.length ?? 0;

                return (
                  <button
                    key={day.iso}
                    type="button"
                    onClick={() => openDay(day.iso)}
                    className={`relative min-h-16 border-l border-outline/20 px-2 py-2 text-left transition-colors ${
                      day.isCurrentMonth
                        ? "bg-white hover:bg-[#f0f7fc]"
                        : "bg-[#f8f8f8] text-muted/70 hover:bg-[#eef1f3]"
                    } ${isSelected ? "bg-[#e9f4ff]" : ""}`}
                  >
                    <span className="text-[20px] leading-none">{day.day}</span>
                    {taskCount > 0 ? (
                      <span className="absolute bottom-2 right-2 rounded-full bg-[#1d7ccc] px-2 py-0.5 text-[11px] font-semibold text-white">
                        {taskCount}
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </div>
          );
        })}
      </section>

      {modalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4">
          <div className="w-full max-w-2xl rounded-[18px] border border-outline/60 bg-white p-5 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">
                  Selected Date
                </p>
                <h3 className="text-2xl font-semibold text-primary">{selectedDate}</h3>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="rounded-full bg-surface-soft p-2 text-muted hover:text-primary"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mb-4 space-y-3">
              {selectedTasks.length === 0 ? (
                <article className="rounded-[12px] border border-dashed border-outline px-3 py-3 text-sm text-muted">
                  No scheduled tasks yet for this date.
                </article>
              ) : (
                selectedTasks.map((task) => (
                  <article
                    key={task.id}
                    className="rounded-[12px] border border-outline/60 bg-surface-soft/70 px-3 py-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-base font-semibold text-foreground">{task.title}</p>
                        <p className="mt-1 text-sm text-muted">{task.description}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeTask(task.id)}
                        className="rounded-full bg-white p-2 text-muted hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </article>
                ))
              )}
            </div>

            <div className="rounded-[14px] border border-outline/60 p-4">
              <p className="text-sm font-semibold text-primary">Add Task (Outside Template)</p>
              <div className="mt-3 grid gap-3">
                <input
                  value={draft.title}
                  onChange={(event) =>
                    setDraft((current) => ({ ...current, title: event.target.value }))
                  }
                  placeholder="Task title"
                  className="rounded-[10px] border border-outline px-3 py-2.5 outline-none focus:border-primary"
                />
                <textarea
                  value={draft.description}
                  onChange={(event) =>
                    setDraft((current) => ({ ...current, description: event.target.value }))
                  }
                  placeholder="Description"
                  className="min-h-20 rounded-[10px] border border-outline px-3 py-2.5 outline-none focus:border-primary"
                />
                <div className="grid gap-3 md:grid-cols-2">
                  <input
                    value={draft.category}
                    onChange={(event) =>
                      setDraft((current) => ({ ...current, category: event.target.value }))
                    }
                    placeholder="Category"
                    className="rounded-[10px] border border-outline px-3 py-2.5 outline-none focus:border-primary"
                  />
                  <input
                    value={draft.window}
                    onChange={(event) =>
                      setDraft((current) => ({ ...current, window: event.target.value }))
                    }
                    placeholder="Time window"
                    className="rounded-[10px] border border-outline px-3 py-2.5 outline-none focus:border-primary"
                  />
                </div>
                {error ? (
                  <div className="rounded-[10px] border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                    {error}
                  </div>
                ) : null}
                <button
                  type="button"
                  onClick={createTask}
                  disabled={isPending}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Plus className="h-4 w-4" />
                  Add Task to This Date
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
