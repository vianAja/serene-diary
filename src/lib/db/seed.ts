import { config } from "dotenv";
import { getDb } from "./client";
import {
  checklistEntries,
  checklistTemplates,
  dailyChecklists,
  templateChecklistItems,
} from "./schema";
import { buildDatabaseSeed } from "../mock-data";

config({ path: ".env.local" });
config();

async function seed() {
  const db = getDb();

  if (!db) {
    throw new Error("DATABASE_URL is not available. Configure your environment before running the seed.");
  }

  const payload = buildDatabaseSeed();

  await db.delete(checklistEntries);
  await db.delete(dailyChecklists);
  await db.delete(templateChecklistItems);
  await db.delete(checklistTemplates);

  await db.insert(checklistTemplates).values(payload.templates);
  await db.insert(templateChecklistItems).values(payload.templateItems);
  await db.insert(dailyChecklists).values(payload.checklists);
  await db.insert(checklistEntries).values(payload.entries);

  console.log("Seed complete. Templates, checklist records, and demo entries have been inserted.");
}

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
