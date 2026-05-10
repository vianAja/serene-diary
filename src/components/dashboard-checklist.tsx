"use client";

import { startTransition, useState } from "react";
import { CheckCheck } from "lucide-react";
import type { ChecklistTask, TemplateDefinition } from "@/lib/mock-data";
import {
  loadStoredTemplates,
  mergeActiveTemplateTasks,
} from "@/lib/template-storage";

export function DashboardChecklist({
  initialTasks,
  initialTemplates,
}: {
  initialTasks: ChecklistTask[];
  initialTemplates: TemplateDefinition[];
}) {
  const [tasks, setTasks] = useState(() => {
    const storedTemplates = loadStoredTemplates(initialTemplates);
    const mergedTasks = mergeActiveTemplateTasks(storedTemplates);
    return mergedTasks.length > 0 ? mergedTasks : initialTasks;
  });
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((task) => task.completed).length;
  const progress = Math.round((completedTasks / totalTasks) * 100);

  function toggleTask(taskId: string) {
    startTransition(() => {
      setTasks((currentTasks) =>
        currentTasks.map((task) =>
          task.id === taskId ? { ...task, completed: !task.completed } : task,
        ),
      );
    });
  }

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
              className="h-3 rounded-full bg-gradient-to-r from-primary-soft to-primary"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {tasks.map((task, index) => (
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
                className={`mt-1 flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border ${
                  task.completed
                    ? "border-primary bg-primary text-white"
                    : "border-outline bg-white text-muted"
                }`}
              >
                <CheckCheck className="h-5 w-5" />
              </button>
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-3">
                  <h3
                    className={`text-base font-semibold ${
                      task.completed
                        ? "text-muted line-through"
                        : "text-foreground"
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
        ))}
      </div>
    </>
  );
}
