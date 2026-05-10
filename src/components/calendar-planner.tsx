"use client";

import { useEffect, useState, useTransition } from "react";
import { CalendarPlus, Trash2 } from "lucide-react";

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

const blankDraft: Draft = {
  title: "",
  description: "",
  category: "Scheduled",
  window: "Scheduled",
};

function todayString() {
  return new Date().toISOString().slice(0, 10);
}

export function CalendarPlanner({
  initialDate,
  initialTasks,
}: {
  initialDate: string;
  initialTasks: ScheduledTask[];
}) {
  const [selectedDate, setSelectedDate] = useState(initialDate);
  const [tasks, setTasks] = useState(initialTasks);
  const [draft, setDraft] = useState<Draft>(blankDraft);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    startTransition(async () => {
      const response = await fetch(`/api/scheduled-tasks?date=${selectedDate}`);
      const payload = (await response.json()) as { tasks?: ScheduledTask[] };
      setTasks(payload.tasks ?? []);
    });
  }, [selectedDate]);

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

      setTasks(payload.tasks ?? []);
      setDraft(blankDraft);
    });
  }

  function removeTask(taskId: string) {
    setError(null);

    startTransition(async () => {
      await fetch(`/api/scheduled-tasks?id=${taskId}`, {
        method: "DELETE",
      });

      setTasks((current) => current.filter((task) => task.id !== taskId));
    });
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_1.3fr]">
      <section className="rounded-[24px] border border-outline/70 bg-white p-6 shadow-[0_4px_12px_rgba(137,168,178,0.08)]">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted">
          Schedule Task by Date
        </p>
        <h2 className="mt-2 text-2xl font-semibold text-primary">Calendar Task Planner</h2>
        <input
          type="date"
          value={selectedDate}
          min={todayString()}
          onChange={(event) => setSelectedDate(event.target.value)}
          className="mt-5 w-full rounded-[12px] border border-outline bg-white px-3 py-3 text-base text-foreground outline-none focus:border-primary"
        />

        <div className="mt-5 grid gap-3">
          <input
            value={draft.title}
            onChange={(event) => setDraft((current) => ({ ...current, title: event.target.value }))}
            placeholder="Task title"
            className="rounded-[12px] border border-outline bg-white px-3 py-3 text-base text-foreground outline-none focus:border-primary"
          />
          <textarea
            value={draft.description}
            onChange={(event) =>
              setDraft((current) => ({ ...current, description: event.target.value }))
            }
            placeholder="Description"
            className="min-h-24 rounded-[12px] border border-outline bg-white px-3 py-3 text-sm text-muted outline-none focus:border-primary"
          />
          <div className="grid gap-3 md:grid-cols-2">
            <input
              value={draft.category}
              onChange={(event) =>
                setDraft((current) => ({ ...current, category: event.target.value }))
              }
              placeholder="Category"
              className="rounded-[12px] border border-outline bg-white px-3 py-3 text-sm text-foreground outline-none focus:border-primary"
            />
            <input
              value={draft.window}
              onChange={(event) =>
                setDraft((current) => ({ ...current, window: event.target.value }))
              }
              placeholder="Time window"
              className="rounded-[12px] border border-outline bg-white px-3 py-3 text-sm text-foreground outline-none focus:border-primary"
            />
          </div>
          {error ? (
            <div className="rounded-[12px] border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          ) : null}
          <button
            type="button"
            onClick={createTask}
            disabled={isPending}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <CalendarPlus className="h-4 w-4" />
            Save to Date
          </button>
        </div>
      </section>

      <section className="rounded-[24px] border border-outline/70 bg-white p-6 shadow-[0_4px_12px_rgba(137,168,178,0.08)]">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted">
          Scheduled for {selectedDate}
        </p>
        <div className="mt-4 space-y-3">
          {tasks.length === 0 ? (
            <article className="rounded-[14px] border border-dashed border-outline p-4 text-sm text-muted">
              No tasks scheduled for this date yet.
            </article>
          ) : (
            tasks.map((task) => (
              <article
                key={task.id}
                className="rounded-[14px] border border-outline/70 bg-surface-soft/70 p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">{task.title}</h3>
                    <p className="mt-1 text-sm text-muted">{task.description}</p>
                    <div className="mt-2 flex gap-2">
                      <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-primary">
                        {task.category}
                      </span>
                      <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-muted">
                        {task.window}
                      </span>
                    </div>
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
      </section>
    </div>
  );
}
