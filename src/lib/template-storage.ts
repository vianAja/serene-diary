import type { ChecklistTask, TemplateDefinition } from "@/lib/mock-data";

export const templateStorageKey = "serene-diary-template-library";

export function loadStoredTemplates(
  fallbackTemplates: TemplateDefinition[],
): TemplateDefinition[] {
  if (typeof window === "undefined") {
    return fallbackTemplates;
  }

  const storedValue = window.localStorage.getItem(templateStorageKey);

  if (!storedValue) {
    return fallbackTemplates;
  }

  try {
    const parsedTemplates = JSON.parse(storedValue) as TemplateDefinition[];

    if (!Array.isArray(parsedTemplates) || parsedTemplates.length === 0) {
      return fallbackTemplates;
    }

    return parsedTemplates;
  } catch {
    return fallbackTemplates;
  }
}

export function saveStoredTemplates(templates: TemplateDefinition[]) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(templateStorageKey, JSON.stringify(templates));
}

export function mergeActiveTemplateTasks(
  templates: TemplateDefinition[],
): ChecklistTask[] {
  const activeTemplates = templates.filter((template) => template.active);
  const sourceTemplates =
    activeTemplates.length > 0 ? activeTemplates : templates.slice(0, 1);

  return sourceTemplates.flatMap((template) =>
    template.items.map((item, index) => ({
      ...item,
      id: `${template.id}-${item.id}-${index}`,
      completed: false,
      color: template.color,
    })),
  );
}
