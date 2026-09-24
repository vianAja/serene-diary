"use client";

import { startTransition, useCallback, useState } from "react";
import { CheckCheck, Loader2 } from "lucide-react";
import type { ChecklistTask, TemplateDefinition } from "@/lib/mock-data";
import { mergeActiveTemplateTasks } from "@/lib/template-storage";

export function DashboardChecklist({
  initialTasks,
  initialTemplates,
  scheduledTasks = [],
  persistedEntries = {},
  checklistDate,
  isAuthenticated,
}: {
  initialTasks: ChecklistTask[];
  initialTemplates: TemplateDefinition[];
  scheduledTasks?: ChecklistTask[];
  // Map of entryId -> completed loaded from DB (server-side)
  persistedEntries?: Record<string, boolean>;
  checklistDate: string;
  isAuthenticated: boolean;
}) {
  const [tasks, setTasks] = useState<ChecklistTask[]>(() => {
    const mergedTasks = mergeActiveTemplateTasks(initialTemplates);
    const base = mergedTasks.length > 0 ? mergedTasks : initialTasks;
    const all = [...base, ...scheduledTasks.filter((s) => !base.some((b) => b.id === s.id))];
    // Apply persisted completed state from DB
    return all.map((task) =>
      task.id in persistedEntries
        ? { ...task, completed: persistedEntries[task.id] }
        : task,
    );
  });

  // Track which task IDs are currently being saved to show a spinner
  const [saving, setSaving] = useState<Set<string>>(new Set());

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((task) => task.completed).length;
  const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const toggleTask = useCallback(
    (taskId: string) => {
      const task = tasks.find((t) => t.id === taskId);
      if (!task) return;

      const nextCompleted = !task.completed;

      // Optimistic UI update
      startTransition(() => {
        setTasks((current) =>
          current.map((t) =>
            t.id === taskId ? { ...t, completed: nextCompleted } : t,
          ),
        );
      });

      if (!isAuthenticated) return;

      // Persist to DB
      const taskIndex = tasks.findIndex((t) => t.id === taskId);
      setSaving((prev) => new Set(prev).add(taskId));

      fetch(`/api/checklist/${checklistDate}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: taskId,
          label: task.label,
          category: task.category,
          description: task.description,
          window: task.window,
          position: taskIndex,
          completed: nextCompleted,
        }),
      })
        .catch((err) => {
          console.error("Failed to persist checklist toggle:", err);
          // Rollback on error
          startTransition(() => {
            setTasks((current) =>
              current.map((t) =>
                t.id === taskId ? { ...t, completed: task.completed } : t,
              ),
            );
          });
        })
        .finally(() => {
          setSaving((prev) => {
            const next = new Set(prev);
            next.delete(taskId);
            return next;
          });
        });
    },
    [tasks, checklistDate, isAuthenticated],
  );

  return (
    <>
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted">
            Primary Dashboard
          </p>
          <h2 className="mt-2 text-[20px] font-semibold tracking-[-0.02em] text-foreground md:text-2xl md:text-primary">
            Daily Checklist
          </h2>
        </div>
        <div className="flex items-center gap-3">
          <div className="rounded-full bg-secondary/70 px-4 py-2 text-sm font-semibold text-primary">
            {completedTasks}/{totalTasks} completed
          </div>
          <div className="w-24 overflow-hidden rounded-full bg-secondary/60">
            <div
              className="h-3 rounded-full bg-gradient-to-r from-primary-soft to-primary transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {tasks.map((task, index) => {
          const isSaving = saving.has(task.id);
          return (
            <article
              key={task.id}
              className={`rounded-[18px] border border-outline/40 bg-white p-4 shadow-[0px_4px_12px_rgba(137,168,178,0.08)] transition-transform hover:-translate-y-0.5 md:rounded-[24px] md:border-outline/70 md:bg-surface-soft/70 md:shadow-none ${
                task.completed ? "opacity-75" : ""
              }`}
              style={{ animationDelay: `${index * 80}ms` }}
            >
              <div className="flex items-start gap-4">
                <button
                  type="button"
                  onClick={() => toggleTask(task.id)}
                  aria-pressed={task.completed}
                  aria-label={`Mark ${task.label}`}
                  disabled={isSaving}
                  className={`mt-1 flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border transition-colors ${
                    task.completed
                      ? "border-primary bg-primary text-white"
                      : "border-outline bg-white text-muted"
                  } ${isSaving ? "cursor-wait opacity-60" : ""}`}
                >
                  {isSaving ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <CheckCheck className="h-5 w-5" />
                  )}
                </button>
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-3">
                    <h3
                      className={`text-base font-semibold ${
                        task.completed ? "text-muted line-through" : "text-foreground"
                      }`}
                    >
                      {task.label}
                    </h3>
                    <span
                      className="rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] md:hidden"
                      style={{
                        backgroundColor: `${task.color}22`,
                        color: task.color,
                      }}
                    >
                      {task.category}
                    </span>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-muted">
                    {task.description}
                  </p>
                </div>
                <div className="hidden rounded-full bg-white px-3 py-2 text-xs font-semibold text-muted md:block">
                  {task.window}
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </>
  );
}
