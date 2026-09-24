import { and, asc, desc, eq, inArray, or } from "drizzle-orm";
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

function buildTemplateId(name: string, userId: string) {
  const slug = name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-");
  return `tpl-${userId.replace(/[^a-z0-9]/gi, "_")}-${slug || crypto.randomUUID().slice(0, 8)}`;
}

async function seedDefaultTemplates(userId: string): Promise<TemplateDefinition[]> {
  const db = getDb();
  const templates = cloneDefaultTemplates();

  if (!db) {
    return templates;
  }

  const timestamp = new Date();

  try {
    const existing = await db
      .select({ id: checklistTemplates.id })
      .from(checklistTemplates)
      .where(eq(checklistTemplates.userId, userId))
      .limit(1);

    if (existing.length > 0) {
      return await getTemplateLibrary(userId);
    }

    for (const [index, template] of templates.entries()) {
      const templateId = `tpl-${userId.replace(/[^a-z0-9]/gi, "_")}-${template.id}`;

      await db
        .insert(checklistTemplates)
        .values({
          id: templateId,
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
        })
        .onConflictDoNothing();

      if (template.items.length > 0) {
        await db
          .insert(templateChecklistItems)
          .values(
            template.items.map((item, itemIdx) => ({
              id: `item-${userId.replace(/[^a-z0-9]/gi, "_")}-${template.id}-${item.id}`,
              templateId,
              label: item.label,
              category: item.category,
              description: item.description,
              window: item.window,
              position: itemIdx,
            })),
          )
          .onConflictDoNothing();
      }
    }

    return await getTemplateLibrary(userId);
  } catch (error) {
    console.error("Failed to seed default templates to DB:", error);
    return templates;
  }
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

  try {
    const templatesRows = await db
      .select()
      .from(checklistTemplates)
      .where(eq(checklistTemplates.userId, userId))
      .orderBy(asc(checklistTemplates.position), desc(checklistTemplates.createdAt));

    if (templatesRows.length === 0) {
      return await seedDefaultTemplates(userId);
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
  } catch (error) {
    console.error("Failed to fetch template library from DB:", error);
    return cloneDefaultTemplates();
  }
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

  try {
    const nextTemplate = {
      id: buildTemplateId(trimmedName, userId),
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
  } catch (error) {
    console.error("createTemplate error:", error);
  }

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

  try {
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
          or(
            eq(checklistTemplates.id, templateId),
            eq(checklistTemplates.id, `tpl-${userId.replace(/[^a-z0-9]/gi, "_")}-${templateId}`),
          ),
          eq(checklistTemplates.userId, userId),
        ),
      );
  } catch (error) {
    console.error("updateTemplate error:", error);
  }

  return getTemplateLibrary(userId);
}

export async function deleteTemplate(templateId: string, userId = defaultUserId) {
  const db = getDb();

  if (!db) {
    return getTemplateLibrary(userId);
  }

  try {
    await db
      .delete(checklistTemplates)
      .where(
        and(
          or(
            eq(checklistTemplates.id, templateId),
            eq(checklistTemplates.id, `tpl-${userId.replace(/[^a-z0-9]/gi, "_")}-${templateId}`),
          ),
          eq(checklistTemplates.userId, userId),
        ),
      );
  } catch (error) {
    console.error("deleteTemplate error:", error);
  }

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

  try {
    await db
      .update(checklistTemplates)
      .set({
        isActive: active,
        updatedAt: new Date(),
      })
      .where(
        and(
          or(
            eq(checklistTemplates.id, templateId),
            eq(checklistTemplates.id, `tpl-${userId.replace(/[^a-z0-9]/gi, "_")}-${templateId}`),
          ),
          eq(checklistTemplates.userId, userId),
        ),
      );
  } catch (error) {
    console.error("toggleTemplateActive DB error:", error);
  }

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

  try {
    const template = await db
      .select()
      .from(checklistTemplates)
      .where(
        and(
          or(
            eq(checklistTemplates.id, templateId),
            eq(checklistTemplates.id, `tpl-${userId.replace(/[^a-z0-9]/gi, "_")}-${templateId}`),
          ),
          eq(checklistTemplates.userId, userId),
        ),
      )
      .limit(1);

    if (template.length === 0) {
      return getTemplateLibrary(userId);
    }

    const actualTemplateId = template[0].id;

    const items = await db
      .select()
      .from(templateChecklistItems)
      .where(eq(templateChecklistItems.templateId, actualTemplateId))
      .orderBy(desc(templateChecklistItems.position))
      .limit(1);

    const nextPosition = (items[0]?.position ?? -1) + 1;

    await db.insert(templateChecklistItems).values({
      id: `item-${actualTemplateId}-${crypto.randomUUID().slice(0, 8)}`,
      templateId: actualTemplateId,
      label: label.trim(),
      category: "Checklist",
      description: description.trim() || "Add a short supporting note for this task.",
      window: "Flexible",
      position: nextPosition,
    });

    await db
      .update(checklistTemplates)
      .set({ updatedAt: new Date() })
      .where(eq(checklistTemplates.id, actualTemplateId));
  } catch (error) {
    console.error("createTemplateItem error:", error);
  }

  return getTemplateLibrary(userId);
}

export async function deleteTemplateItem(
  templateId: string,
  itemId: string,
  userId = defaultUserId,
) {
  const db = getDb();

  if (!db) {
    return getTemplateLibrary(userId);
  }

  try {
    const template = await db
      .select()
      .from(checklistTemplates)
      .where(
        and(
          or(
            eq(checklistTemplates.id, templateId),
            eq(checklistTemplates.id, `tpl-${userId.replace(/[^a-z0-9]/gi, "_")}-${templateId}`),
          ),
          eq(checklistTemplates.userId, userId),
        ),
      )
      .limit(1);

    if (template.length === 0) {
      return getTemplateLibrary(userId);
    }

    const actualTemplateId = template[0].id;

    await db
      .delete(templateChecklistItems)
      .where(
        and(
          eq(templateChecklistItems.id, itemId),
          eq(templateChecklistItems.templateId, actualTemplateId),
        ),
      );

    await db
      .update(checklistTemplates)
      .set({ updatedAt: new Date() })
      .where(eq(checklistTemplates.id, actualTemplateId));
  } catch (error) {
    console.error("deleteTemplateItem error:", error);
  }

  return getTemplateLibrary(userId);
}
