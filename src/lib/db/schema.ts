import {
  boolean,
  date,
  integer,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

export const checklistTemplates = pgTable("checklist_templates", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  position: integer("position").notNull().default(0),
  name: text("name").notNull(),
  description: text("description").notNull(),
  focus: text("focus").notNull(),
  color: text("color").notNull(),
  shortLabel: text("short_label").notNull(),
  frequency: text("frequency").notNull(),
  isActive: boolean("is_active").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const allowedUsers = pgTable("allowed_users", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const templateChecklistItems = pgTable("template_checklist_items", {
  id: text("id").primaryKey(),
  templateId: text("template_id")
    .notNull()
    .references(() => checklistTemplates.id, { onDelete: "cascade" }),
  label: text("label").notNull(),
  category: text("category").notNull(),
  description: text("description").notNull(),
  window: text("window").notNull(),
  position: integer("position").notNull(),
});

export const dailyChecklists = pgTable("daily_checklists", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  templateId: text("template_id").references(() => checklistTemplates.id, {
    onDelete: "set null",
  }),
  title: text("title").notNull(),
  checklistDate: date("checklist_date").notNull(),
  progress: integer("progress").notNull().default(0),
  note: text("note").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const checklistEntries = pgTable("checklist_entries", {
  id: text("id").primaryKey(),
  checklistId: text("checklist_id")
    .notNull()
    .references(() => dailyChecklists.id, { onDelete: "cascade" }),
  templateItemId: text("template_item_id").references(
    () => templateChecklistItems.id,
    { onDelete: "set null" },
  ),
  label: text("label").notNull(),
  category: text("category").notNull(),
  description: text("description").notNull(),
  window: text("window").notNull(),
  completed: boolean("completed").notNull().default(false),
  position: integer("position").notNull(),
  completedAt: timestamp("completed_at", { withTimezone: true }),
});

export const scheduledTasks = pgTable("scheduled_tasks", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull().default("Scheduled"),
  taskDate: date("task_date").notNull(),
  window: text("window").notNull().default("Scheduled"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});
