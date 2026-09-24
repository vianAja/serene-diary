import { and, eq } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { checklistEntries, dailyChecklists } from "@/lib/db/schema";

export type ChecklistEntryRow = typeof checklistEntries.$inferSelect;

// Get or create today's daily checklist record for a user
async function getOrCreateDailyChecklist(userId: string, checklistDate: string) {
  const db = getDb();
  if (!db) return null;

  const existing = await db
    .select()
    .from(dailyChecklists)
    .where(
      and(
        eq(dailyChecklists.userId, userId),
        eq(dailyChecklists.checklistDate, checklistDate),
      ),
    )
    .limit(1);

  if (existing.length > 0) {
    return existing[0];
  }

  const id = `checklist-${userId}-${checklistDate}`;
  const now = new Date();

  await db.insert(dailyChecklists).values({
    id,
    userId,
    checklistDate,
    title: `Daily Checklist ${checklistDate}`,
    progress: 0,
    note: "",
    createdAt: now,
    updatedAt: now,
  });

  return { id, userId, checklistDate, progress: 0, note: "" };
}

// Load all checklist entries for a given date (returns a map of entryKey -> completed)
export async function loadDailyEntries(
  userId: string,
  checklistDate: string,
): Promise<Record<string, boolean>> {
  try {
    const db = getDb();
    if (!db) return {};

    const checklist = await getOrCreateDailyChecklist(userId, checklistDate);
    if (!checklist) return {};

    const entries = await db
      .select()
      .from(checklistEntries)
      .where(eq(checklistEntries.checklistId, checklist.id));

    return Object.fromEntries(entries.map((e) => [e.id, e.completed]));
  } catch (error) {
    console.error("loadDailyEntries error:", error);
    return {};
  }
}

// Toggle or upsert a single checklist entry
export async function upsertChecklistEntry(
  userId: string,
  checklistDate: string,
  entryId: string,
  label: string,
  category: string,
  description: string,
  window: string,
  position: number,
  completed: boolean,
): Promise<boolean> {
  try {
    const db = getDb();
    if (!db) return completed;

    const checklist = await getOrCreateDailyChecklist(userId, checklistDate);
    if (!checklist) return completed;

    // Check if entry already exists
    const existing = await db
      .select()
      .from(checklistEntries)
      .where(eq(checklistEntries.id, entryId))
      .limit(1);

    const now = new Date();

    if (existing.length > 0) {
      await db
        .update(checklistEntries)
        .set({
          completed,
          completedAt: completed ? now : null,
        })
        .where(eq(checklistEntries.id, entryId));
    } else {
      await db.insert(checklistEntries).values({
        id: entryId,
        checklistId: checklist.id,
        templateItemId: null,
        label,
        category,
        description,
        window,
        position,
        completed,
        completedAt: completed ? now : null,
      });
    }

    // Update progress on the parent checklist
    const allEntries = await db
      .select()
      .from(checklistEntries)
      .where(eq(checklistEntries.checklistId, checklist.id));

    const completedCount = allEntries.filter((e) => e.completed).length;
    const progress =
      allEntries.length > 0 ? Math.round((completedCount / allEntries.length) * 100) : 0;

    await db
      .update(dailyChecklists)
      .set({ progress, updatedAt: now })
      .where(eq(dailyChecklists.id, checklist.id));

    return completed;
  } catch (error) {
    console.error("upsertChecklistEntry error:", error);
    return completed;
  }
}
