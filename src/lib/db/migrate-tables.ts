import "dotenv/config";
import { sql } from "drizzle-orm";
import { getDb } from "./client";

async function main() {
  const db = getDb();
  if (!db) {
    console.error("Could not get DB instance");
    process.exit(1);
  }

  console.log("Connected to DB, creating tables with quoted reserved words...");

  const tables = [
    `CREATE TABLE IF NOT EXISTS allowed_users (
      id text PRIMARY KEY,
      email text NOT NULL UNIQUE,
      is_active boolean NOT NULL DEFAULT true,
      created_at timestamp with time zone NOT NULL DEFAULT now(),
      updated_at timestamp with time zone NOT NULL DEFAULT now()
    );`,
    `CREATE TABLE IF NOT EXISTS checklist_templates (
      id text PRIMARY KEY,
      user_id text NOT NULL,
      position integer NOT NULL DEFAULT 0,
      name text NOT NULL,
      description text NOT NULL,
      focus text NOT NULL,
      color text NOT NULL,
      short_label text NOT NULL,
      frequency text NOT NULL,
      is_active boolean NOT NULL DEFAULT false,
      created_at timestamp with time zone NOT NULL DEFAULT now(),
      updated_at timestamp with time zone NOT NULL DEFAULT now()
    );`,
    `CREATE TABLE IF NOT EXISTS template_checklist_items (
      id text PRIMARY KEY,
      template_id text NOT NULL REFERENCES checklist_templates(id) ON DELETE CASCADE,
      label text NOT NULL,
      category text NOT NULL,
      description text NOT NULL,
      "window" text NOT NULL,
      position integer NOT NULL
    );`,
    `CREATE TABLE IF NOT EXISTS daily_checklists (
      id text PRIMARY KEY,
      user_id text NOT NULL,
      template_id text REFERENCES checklist_templates(id) ON DELETE SET NULL,
      title text NOT NULL,
      checklist_date date NOT NULL,
      progress integer NOT NULL DEFAULT 0,
      note text NOT NULL DEFAULT '',
      created_at timestamp with time zone NOT NULL DEFAULT now(),
      updated_at timestamp with time zone NOT NULL DEFAULT now()
    );`,
    `CREATE TABLE IF NOT EXISTS checklist_entries (
      id text PRIMARY KEY,
      checklist_id text NOT NULL REFERENCES daily_checklists(id) ON DELETE CASCADE,
      template_item_id text REFERENCES template_checklist_items(id) ON DELETE SET NULL,
      label text NOT NULL,
      category text NOT NULL,
      description text NOT NULL,
      "window" text NOT NULL,
      completed boolean NOT NULL DEFAULT false,
      position integer NOT NULL DEFAULT 0,
      completed_at timestamp with time zone
    );`,
    `CREATE TABLE IF NOT EXISTS scheduled_tasks (
      id text PRIMARY KEY,
      user_id text NOT NULL,
      title text NOT NULL,
      description text NOT NULL,
      category text NOT NULL DEFAULT 'Scheduled',
      task_date date NOT NULL,
      "window" text NOT NULL DEFAULT 'Scheduled',
      created_at timestamp with time zone NOT NULL DEFAULT now(),
      updated_at timestamp with time zone NOT NULL DEFAULT now()
    );`,
    `CREATE TABLE IF NOT EXISTS notes (
      id text PRIMARY KEY,
      user_id text NOT NULL,
      author_email text NOT NULL,
      author_name text,
      title text NOT NULL,
      content text NOT NULL DEFAULT '',
      category text NOT NULL DEFAULT 'General',
      visibility text NOT NULL DEFAULT 'private',
      is_pinned boolean NOT NULL DEFAULT false,
      created_at timestamp with time zone NOT NULL DEFAULT now(),
      updated_at timestamp with time zone NOT NULL DEFAULT now()
    );`
  ];

  for (const query of tables) {
    try {
      await db.execute(sql.raw(query));
      console.log("Table created/verified successfully.");
    } catch (e) {
      console.error("Error executing query:", e);
    }
  }

  const res = await db.execute(
    sql.raw("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;")
  );
  console.log("Verified public tables in Supabase:", res);

  console.log("Migration complete!");
  process.exit(0);
}

main().catch((err) => {
  console.error("Migration fatal error:", err);
  process.exit(1);
});
