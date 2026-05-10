import { and, asc, desc, eq, inArray } from "drizzle-orm";
import {
  getTemplateManagementSnapshot,
  type TemplateDefinition,
  type TemplateItem,
} from "@/lib/mock-data";
import { getDb } from "@/lib/db/client";
import {
  checklistTemplates,
  templateChecklistItems,
} from "@/lib/db/schema";

const defaultUserId = (process.env.ALLOWED_EMAIL ?? "demo-user").toLowerCase();
const defaultTemplateColors = ["#47626c", "#a16f54", "#5b7f68", "#7d6a8b"];

function cloneDefaultTemplates() {
  return structuredClone(getTemplateManagementSnapshot().templates);
}

function buildShortLabel(name: string) {
  const words = name.trim().split(/\s+/).filter(Boolean);

  if (words.length === 0) {
    return "NEW";
  }

  if (words.length === 1) {
    return words[0].slice(0, 3).toUpperCase();
  }

  return words
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? "")
    .join("");
}

function buildTemplateId(name: string) {
  const slug = name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-");
  return `template-${slug || crypto.randomUUID()}`;
}

function buildItemId(label: string) {
  const slug = label.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-");
  return `item-${slug || crypto.randomUUID()}`;
}

async function seedDefaultTemplates(userId: string) {
  const db = getDb();

  if (!db) {
    return cloneDefaultTemplates();
  }

  const templates = cloneDefaultTemplates();
  const timestamp = new Date();

  await db.insert(checklistTemplates).values(
    templates.map((template, index) => ({
      id: template.id,
      userId,
      position: index,
      name: template.name,
      description: template.description,
      focus: template.focus,
      color: template.color,
      shortLabel: template.shortLabel,
      frequency: template.frequency,
      isActive: template.active,
      createdAt: timestamp,
      updatedAt: timestamp,
    })),
  );

  await db.insert(templateChecklistItems).values(
    templates.flatMap((template) =>
      template.items.map((item, index) => ({
        id: item.id,
        templateId: template.id,
        label: item.label,
        category: item.category,
        description: item.description,
        window: item.window,
        position: index,
      })),
    ),
  );

  return templates;
}

function mapTemplates(
  templatesRows: typeof checklistTemplates.$inferSelect[],
  itemsRows: typeof templateChecklistItems.$inferSelect[],
): TemplateDefinition[] {
  const itemsByTemplateId = new Map<string, TemplateItem[]>();

  for (const item of itemsRows) {
    const currentItems = itemsByTemplateId.get(item.templateId) ?? [];
    currentItems.push({
      id: item.id,
      label: item.label,
      category: item.category,
      description: item.description,
      window: item.window,
    });
    itemsByTemplateId.set(item.templateId, currentItems);
  }

  return templatesRows.map((template) => ({
    id: template.id,
    name: template.name,
    description: template.description,
    focus: template.focus,
    color: template.color,
    shortLabel: template.shortLabel,
    frequency: template.frequency,
    active: template.isActive,
    items: itemsByTemplateId.get(template.id) ?? [],
  }));
}

export async function getTemplateLibrary(userId = defaultUserId) {
  const db = getDb();

  if (!db) {
    return cloneDefaultTemplates();
  }

  const templatesRows = await db
    .select()
    .from(checklistTemplates)
    .where(eq(checklistTemplates.userId, userId))
    .orderBy(asc(checklistTemplates.position), desc(checklistTemplates.createdAt));

  if (templatesRows.length === 0) {
    return seedDefaultTemplates(userId);
  }

  const templateIds = templatesRows.map((template) => template.id);
  const itemsRows =
    templateIds.length === 0
      ? []
      : await db
          .select()
          .from(templateChecklistItems)
          .where(inArray(templateChecklistItems.templateId, templateIds))
          .orderBy(
            asc(templateChecklistItems.templateId),
            asc(templateChecklistItems.position),
          );

  return mapTemplates(templatesRows, itemsRows);
}

export async function createTemplate(
  {
    name,
    description,
  }: {
    name: string;
    description: string;
  },
  userId = defaultUserId,
) {
  const db = getDb();

  if (!db) {
    return getTemplateLibrary(userId);
  }

  const trimmedName = name.trim();
  const trimmedDescription = description.trim();
  const currentTemplates = await getTemplateLibrary(userId);

  const nextTemplate = {
    id: buildTemplateId(trimmedName),
    userId,
    position: -1,
    name: trimmedName,
    description:
      trimmedDescription || "A new template for structured daily checklist routines.",
    focus: "Custom",
    color: defaultTemplateColors[currentTemplates.length % defaultTemplateColors.length],
    shortLabel: buildShortLabel(trimmedName),
    frequency: "Daily",
    isActive: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  await db.insert(checklistTemplates).values(nextTemplate);

  return getTemplateLibrary(userId);
}

export async function updateTemplate(
  templateId: string,
  {
    name,
    description,
  }: {
    name: string;
    description: string;
  },
  userId = defaultUserId,
) {
  const db = getDb();

  if (!db) {
    return getTemplateLibrary(userId);
  }

  const trimmedName = name.trim();
  const trimmedDescription = description.trim();

  await db
    .update(checklistTemplates)
    .set({
      name: trimmedName,
      description: trimmedDescription,
      shortLabel: buildShortLabel(trimmedName),
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(checklistTemplates.id, templateId),
        eq(checklistTemplates.userId, userId),
      ),
    );

  return getTemplateLibrary(userId);
}

export async function deleteTemplate(templateId: string, userId = defaultUserId) {
  const db = getDb();

  if (!db) {
    return getTemplateLibrary(userId);
  }

  await db
    .delete(checklistTemplates)
    .where(
      and(
        eq(checklistTemplates.id, templateId),
        eq(checklistTemplates.userId, userId),
      ),
    );

  return getTemplateLibrary(userId);
}

export async function toggleTemplateActive(
  templateId: string,
  active: boolean,
  userId = defaultUserId,
) {
  const db = getDb();

  if (!db) {
    return getTemplateLibrary(userId);
  }

  await db
    .update(checklistTemplates)
    .set({
      isActive: active,
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(checklistTemplates.id, templateId),
        eq(checklistTemplates.userId, userId),
      ),
    );

  return getTemplateLibrary(userId);
}

export async function createTemplateItem(
  templateId: string,
  {
    label,
    description,
  }: {
    label: string;
    description: string;
  },
  userId = defaultUserId,
) {
  const db = getDb();

  if (!db) {
    return getTemplateLibrary(userId);
  }

  const template = await db
    .select()
    .from(checklistTemplates)
    .where(
      and(
        eq(checklistTemplates.id, templateId),
        eq(checklistTemplates.userId, userId),
      ),
    )
    .limit(1);

  if (template.length === 0) {
    return getTemplateLibrary(userId);
  }

  const items = await db
    .select()
    .from(templateChecklistItems)
    .where(eq(templateChecklistItems.templateId, templateId))
    .orderBy(desc(templateChecklistItems.position))
    .limit(1);

  const nextPosition = (items[0]?.position ?? -1) + 1;

  await db.insert(templateChecklistItems).values({
    id: buildItemId(label),
    templateId,
    label: label.trim(),
    category: "Checklist",
    description: description.trim() || "Add a short supporting note for this task.",
    window: "Flexible",
    position: nextPosition,
  });

  await db
    .update(checklistTemplates)
    .set({ updatedAt: new Date() })
    .where(eq(checklistTemplates.id, templateId));

  return getTemplateLibrary(userId);
}
