import { and, asc, desc, eq } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { scheduledTasks } from "@/lib/db/schema";

type CreateScheduledTaskInput = {
  title: string;
  description: string;
  category?: string;
  taskDate: string;
  window?: string;
};

const fallbackUserId = (process.env.ALLOWED_EMAIL ?? "demo-user").toLowerCase();

function normalizeDate(value: string) {
  return value.slice(0, 10);
}

export async function getScheduledTasksByDate(taskDate: string, userId = fallbackUserId) {
  const db = getDb();
  const dateValue = normalizeDate(taskDate);

  if (!db) {
    return [];
  }

  return db
    .select()
    .from(scheduledTasks)
    .where(
      and(
        eq(scheduledTasks.userId, userId),
        eq(scheduledTasks.taskDate, dateValue),
      ),
    )
    .orderBy(asc(scheduledTasks.createdAt));
}

export async function getScheduledTasksForRange(
  startDate: string,
  endDate: string,
  userId = fallbackUserId,
) {
  const db = getDb();

  if (!db) {
    return [];
  }

  const start = normalizeDate(startDate);
  const end = normalizeDate(endDate);

  return db
    .select()
    .from(scheduledTasks)
    .where(and(eq(scheduledTasks.userId, userId)))
    .orderBy(desc(scheduledTasks.taskDate), desc(scheduledTasks.createdAt))
    .then((rows) => rows.filter((row) => row.taskDate >= start && row.taskDate <= end));
}

export async function createScheduledTask(
  input: CreateScheduledTaskInput,
  userId = fallbackUserId,
) {
  const db = getDb();

  if (!db) {
    return [];
  }

  const now = new Date();

  await db.insert(scheduledTasks).values({
    id: `scheduled-${crypto.randomUUID()}`,
    userId,
    title: input.title.trim(),
    description: input.description.trim() || "Scheduled checklist task",
    category: input.category?.trim() || "Scheduled",
    taskDate: normalizeDate(input.taskDate),
    window: input.window?.trim() || "Scheduled",
    createdAt: now,
    updatedAt: now,
  });

  return getScheduledTasksByDate(input.taskDate, userId);
}

export async function deleteScheduledTask(taskId: string, userId = fallbackUserId) {
  const db = getDb();

  if (!db) {
    return;
  }

  await db
    .delete(scheduledTasks)
    .where(and(eq(scheduledTasks.id, taskId), eq(scheduledTasks.userId, userId)));
}
