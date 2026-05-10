"use client";

import { useState, useTransition } from "react";
import {
  Check,
  BriefcaseBusiness,
  Coffee,
  Trash2,
  GripVertical,
  Pencil,
  Plus,
  SquarePen,
  SunMedium,
  WandSparkles,
  X,
} from "lucide-react";
import type { TemplateDefinition } from "@/lib/mock-data";

type InlineTemplateDraft = {
  name: string;
  description: string;
};

type TaskDraft = {
  label: string;
  description: string;
};

const blankTaskDraft: TaskDraft = { label: "", description: "" };

function makeTemplateDraft(template: TemplateDefinition): InlineTemplateDraft {
  return {
    name: template.name,
    description: template.description,
  };
}

function getTemplateIcon(shortLabel: string) {
  if (shortLabel === "AM") {
    return SunMedium;
  }

  if (shortLabel === "WK") {
    return BriefcaseBusiness;
  }

  if (shortLabel === "WE") {
    return Coffee;
  }

  return WandSparkles;
}

export function TemplateManager({
  initialTemplates,
}: {
  initialTemplates: TemplateDefinition[];
}) {
  const [templates, setTemplates] = useState<TemplateDefinition[]>(initialTemplates);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(
    initialTemplates[0]?.id ?? "",
  );
  const [editingTemplateId, setEditingTemplateId] = useState<string | null>(null);
  const [editingDraft, setEditingDraft] = useState<InlineTemplateDraft | null>(null);
  const [newTemplateDraft, setNewTemplateDraft] =
    useState<InlineTemplateDraft | null>(null);
  const [isTaskComposerOpen, setIsTaskComposerOpen] = useState(false);
  const [taskDraft, setTaskDraft] = useState<TaskDraft>(blankTaskDraft);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const selectedTemplate =
    templates.find((template) => template.id === selectedTemplateId) ?? templates[0];

  function applyTemplates(nextTemplates: TemplateDefinition[]) {
    setTemplates(nextTemplates);
    setSelectedTemplateId((currentSelectedTemplateId) => {
      if (nextTemplates.some((template) => template.id === currentSelectedTemplateId)) {
        return currentSelectedTemplateId;
      }

      return nextTemplates[0]?.id ?? "";
    });
  }

  async function requestTemplates<T>(
    input: string,
    init?: RequestInit,
  ): Promise<T> {
    const response = await fetch(input, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...(init?.headers ?? {}),
      },
    });

    const payload = (await response.json()) as T & { error?: string };

    if (!response.ok) {
      throw new Error(payload.error || "Unable to update templates.");
    }

    return payload;
  }

  function selectTemplate(templateId: string) {
    setSelectedTemplateId(templateId);
    setEditingTemplateId(null);
    setEditingDraft(null);
    setIsTaskComposerOpen(false);
    setErrorMessage(null);
  }

  function toggleTemplate(templateId: string) {
    const targetTemplate = templates.find((template) => template.id === templateId);

    if (!targetTemplate) {
      return;
    }

    setSelectedTemplateId(templateId);
    setErrorMessage(null);

    startTransition(async () => {
      try {
        const payload = await requestTemplates<{ templates: TemplateDefinition[] }>(
          `/api/templates/${templateId}`,
          {
            method: "PATCH",
            body: JSON.stringify({
              active: !targetTemplate.active,
            }),
          },
        );
        applyTemplates(payload.templates);
      } catch (error) {
        setErrorMessage(
          error instanceof Error ? error.message : "Unable to update template status.",
        );
      }
    });
  }

  function startEditingTemplate(template: TemplateDefinition) {
    setEditingTemplateId(template.id);
    setEditingDraft(makeTemplateDraft(template));
    setNewTemplateDraft(null);
    setSelectedTemplateId(template.id);
  }

  function saveEditedTemplate(templateId: string) {
    if (!editingDraft || !editingDraft.name.trim()) {
      return;
    }

    setErrorMessage(null);

    startTransition(async () => {
      try {
        const payload = await requestTemplates<{ templates: TemplateDefinition[] }>(
          `/api/templates/${templateId}`,
          {
            method: "PATCH",
            body: JSON.stringify({
              name: editingDraft.name,
              description: editingDraft.description,
            }),
          },
        );
        applyTemplates(payload.templates);
        setEditingTemplateId(null);
        setEditingDraft(null);
      } catch (error) {
        setErrorMessage(
          error instanceof Error ? error.message : "Unable to save template changes.",
        );
      }
    });
  }

  function cancelEditingTemplate() {
    setEditingTemplateId(null);
    setEditingDraft(null);
  }

  function startNewTemplate() {
    if (newTemplateDraft) {
      return;
    }

    setNewTemplateDraft({
      name: "",
      description: "",
    });
    setEditingTemplateId(null);
    setEditingDraft(null);
  }

  function saveNewTemplate() {
    if (!newTemplateDraft || !newTemplateDraft.name.trim()) {
      return;
    }
    setErrorMessage(null);

    startTransition(async () => {
      try {
        const payload = await requestTemplates<{ templates: TemplateDefinition[] }>(
          "/api/templates",
          {
            method: "POST",
            body: JSON.stringify({
              name: newTemplateDraft.name,
              description: newTemplateDraft.description,
            }),
          },
        );
        applyTemplates(payload.templates);
        setSelectedTemplateId(payload.templates[0]?.id ?? "");
        setNewTemplateDraft(null);
      } catch (error) {
        setErrorMessage(
          error instanceof Error ? error.message : "Unable to create a new template.",
        );
      }
    });
  }

  function cancelNewTemplate() {
    setNewTemplateDraft(null);
  }

  function addTaskToSelectedTemplate() {
    if (!taskDraft.label.trim() || !selectedTemplate) {
      return;
    }

    setErrorMessage(null);

    startTransition(async () => {
      try {
        const payload = await requestTemplates<{ templates: TemplateDefinition[] }>(
          `/api/templates/${selectedTemplate.id}/items`,
          {
            method: "POST",
            body: JSON.stringify({
              label: taskDraft.label,
              description: taskDraft.description,
            }),
          },
        );
        applyTemplates(payload.templates);
        setTaskDraft(blankTaskDraft);
        setIsTaskComposerOpen(false);
      } catch (error) {
        setErrorMessage(
          error instanceof Error ? error.message : "Unable to add a new task.",
        );
      }
    });
  }

  function removeTemplate(templateId: string) {
    setErrorMessage(null);

    startTransition(async () => {
      try {
        const payload = await requestTemplates<{ templates: TemplateDefinition[] }>(
          `/api/templates/${templateId}`,
          {
            method: "DELETE",
          },
        );
        applyTemplates(payload.templates);
        if (editingTemplateId === templateId) {
          setEditingTemplateId(null);
          setEditingDraft(null);
        }
      } catch (error) {
        setErrorMessage(
          error instanceof Error ? error.message : "Unable to delete the template.",
        );
      }
    });
  }

  return (
    <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
      <div className="space-y-6 lg:col-span-5">
        <div className="rounded-[24px] border border-outline/70 bg-white p-6 shadow-[0_4px_12px_rgba(137,168,178,0.08)]">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-[20px] font-semibold text-primary">
              Available Templates
            </h3>
            <button
              type="button"
              onClick={startNewTemplate}
              className="rounded-full bg-secondary p-3 text-primary hover:scale-95"
            >
              <Plus className="h-5 w-5" />
            </button>
          </div>

          <div className="space-y-4">
            {errorMessage ? (
              <div className="rounded-[16px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {errorMessage}
              </div>
            ) : null}

            {newTemplateDraft ? (
              <article className="rounded-[18px] border-2 border-primary bg-[#f4f8f9] p-4">
                <div className="grid gap-3">
                  <input
                    value={newTemplateDraft.name}
                    onChange={(event) =>
                      setNewTemplateDraft((current) =>
                        current
                          ? { ...current, name: event.target.value }
                          : current,
                      )
                    }
                    className="rounded-[12px] border border-outline bg-white px-3 py-3 text-lg font-semibold text-foreground outline-none focus:border-primary"
                    placeholder="New template title"
                  />
                  <textarea
                    value={newTemplateDraft.description}
                    onChange={(event) =>
                      setNewTemplateDraft((current) =>
                        current
                          ? { ...current, description: event.target.value }
                          : current,
                      )
                    }
                    className="min-h-24 rounded-[12px] border border-outline bg-white px-3 py-3 text-sm text-muted outline-none focus:border-primary"
                    placeholder="New template description"
                  />
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={saveNewTemplate}
                    disabled={isPending}
                    className="rounded-full bg-primary p-2 text-white hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                      <Check className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={cancelNewTemplate}
                    disabled={isPending}
                    className="rounded-full bg-surface-strong p-2 text-muted hover:bg-outline/40 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </article>
            ) : null}

            {templates.map((template) => {
              const isSelected = template.id === selectedTemplate.id;
              const isEditing =
                editingTemplateId === template.id && editingDraft !== null;
              const TemplateIcon = getTemplateIcon(template.shortLabel);

              return (
                <article
                  key={template.id}
                  onClick={() => selectTemplate(template.id)}
                  className={`group cursor-pointer rounded-[18px] border bg-white p-4 transition-all ${
                    isSelected
                      ? "border-2 border-primary shadow-[0_4px_12px_rgba(137,168,178,0.08)]"
                      : "border-outline/70 hover:border-primary-soft hover:bg-surface-soft"
                  }`}
                >
                  <div className="mb-2 flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="rounded-full bg-surface-strong p-3 text-primary">
                        <TemplateIcon className="h-4 w-4" />
                      </span>
                      {isEditing ? (
                        <input
                          value={editingDraft.name}
                          onChange={(event) =>
                            setEditingDraft((current) =>
                              current
                                ? { ...current, name: event.target.value }
                                : current,
                            )
                          }
                          onClick={(event) => event.stopPropagation()}
                          className="rounded-[12px] border border-outline bg-white px-3 py-2 text-[20px] font-semibold text-foreground outline-none focus:border-primary"
                        />
                      ) : (
                        <h4 className="text-[20px] font-semibold text-foreground">
                          {template.name}
                        </h4>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {isEditing ? (
                        <>
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();
                              cancelEditingTemplate();
                            }}
                            disabled={isPending}
                            className="rounded-full bg-surface-strong p-2 text-muted hover:bg-outline/40 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            <X className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();
                              saveEditedTemplate(template.id);
                            }}
                            disabled={isPending}
                            className="rounded-full bg-primary p-2 text-white hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            <Check className="h-4 w-4" />
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();
                              removeTemplate(template.id);
                            }}
                            disabled={isPending}
                            className="rounded-full bg-surface-strong p-2 text-muted hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();
                              startEditingTemplate(template);
                            }}
                            disabled={isPending}
                            className="rounded-full bg-surface-strong p-2 text-primary hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            <SquarePen className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            aria-pressed={template.active}
                            onClick={(event) => {
                              event.stopPropagation();
                              toggleTemplate(template.id);
                            }}
                            disabled={isPending}
                            className={`flex h-6 w-11 shrink-0 items-center rounded-full p-1 disabled:cursor-not-allowed disabled:opacity-60 ${
                              template.active ? "bg-primary" : "bg-outline/70"
                            }`}
                          >
                            <span
                              className={`h-4 w-4 rounded-full bg-white transition-transform ${
                                template.active ? "translate-x-5" : ""
                              }`}
                            />
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {isEditing ? (
                    <textarea
                      value={editingDraft.description}
                      onChange={(event) =>
                        setEditingDraft((current) =>
                          current
                            ? { ...current, description: event.target.value }
                            : current,
                        )
                      }
                      onClick={(event) => event.stopPropagation()}
                      className="mt-3 min-h-20 w-full rounded-[12px] border border-outline bg-white px-3 py-3 text-sm text-muted outline-none focus:border-primary"
                    />
                  ) : (
                    <p className="mb-4 text-sm leading-7 text-muted">
                      {template.description}
                    </p>
                  )}

                  <div className="flex flex-wrap gap-2">
                    {template.active ? (
                      <span className="rounded-full bg-secondary px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-primary">
                        Active
                      </span>
                    ) : null}
                    <span className="rounded-full bg-surface-strong px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-muted">
                      {template.items.length} Items
                    </span>
                  </div>
                </article>
              );
            })}
          </div>
        </div>

      </div>

      <div className="lg:col-span-7">
        {!selectedTemplate ? (
          <section className="rounded-[24px] border border-outline/70 bg-white p-10 text-center shadow-[0_4px_12px_rgba(137,168,178,0.08)]">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted">
              Template Editor
            </p>
            <h3 className="mt-3 text-3xl font-semibold text-foreground">
              No template selected
            </h3>
            <p className="mt-3 text-sm leading-7 text-muted">
              Create a new template from the left panel to start building your checklist structure.
            </p>
          </section>
        ) : (
        <section className="rounded-[24px] border border-outline/70 bg-white p-6 shadow-[0_4px_12px_rgba(137,168,178,0.08)]">
          <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h3 className="text-[32px] font-semibold leading-[40px] tracking-[-0.02em] text-foreground">
                Editor: {selectedTemplate.name}
              </h3>
              <p className="text-sm leading-6 text-muted">
                Refine the structure and checklist items for this template.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={cancelEditingTemplate}
                disabled={isPending}
                className="rounded-full bg-surface-strong p-3 text-muted hover:bg-outline/40 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <X className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => {
                  if (editingTemplateId === selectedTemplate.id) {
                    saveEditedTemplate(selectedTemplate.id);
                  }
                }}
                disabled={isPending || editingTemplateId !== selectedTemplate.id}
                className="rounded-full bg-primary p-3 text-white hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Check className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="space-y-6 border-l-4 border-secondary pl-6">
            {selectedTemplate.items.map((item) => (
              <div
                key={item.id}
                className="group relative flex items-start gap-4 border-b border-surface-strong pb-5"
              >
                <GripVertical className="mt-1 h-5 w-5 text-outline" />
                <div className="flex-1">
                  <div className="mb-1 flex items-center gap-3">
                    <span className="rounded bg-primary/12 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-primary">
                      Checklist
                    </span>
                    <p className="text-[20px] font-semibold leading-7 text-foreground">
                      {item.label}
                    </p>
                  </div>
                  <p className="text-sm italic leading-6 text-muted">
                    {item.description}
                  </p>
                </div>
                <button className="rounded-full p-2 text-muted opacity-0 transition-all hover:bg-surface-strong group-hover:opacity-100">
                  <Pencil className="h-4 w-4" />
                </button>
              </div>
            ))}

            {!isTaskComposerOpen ? (
              <button
                type="button"
                onClick={() => setIsTaskComposerOpen(true)}
                className="flex min-h-[108px] w-full items-center justify-center rounded-[18px] border border-dashed border-outline bg-[#fcfbf8] text-muted hover:border-primary hover:text-primary"
              >
                <div className="flex flex-col items-center gap-2">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full border border-outline">
                    <Plus className="h-5 w-5" />
                  </span>
                  <span className="text-sm font-semibold">Add New Item</span>
                </div>
              </button>
            ) : (
              <div className="rounded-[18px] border border-outline/70 bg-[#fcfbf8] p-4">
                <div className="grid gap-4">
                  <input
                    value={taskDraft.label}
                    onChange={(event) =>
                      setTaskDraft((current) => ({
                        ...current,
                        label: event.target.value,
                      }))
                    }
                    className="rounded-[12px] border border-outline bg-white px-4 py-3 text-base font-semibold text-foreground outline-none focus:border-primary"
                    placeholder="New task title"
                  />
                  <textarea
                    value={taskDraft.description}
                    onChange={(event) =>
                      setTaskDraft((current) => ({
                        ...current,
                        description: event.target.value,
                      }))
                    }
                    className="min-h-24 rounded-[12px] border border-outline bg-white px-4 py-3 text-sm text-muted outline-none focus:border-primary"
                    placeholder="New task description"
                  />
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsTaskComposerOpen(false)}
                    disabled={isPending}
                    className="rounded-full bg-surface-strong p-2 text-muted hover:bg-outline/40 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                      <X className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={addTaskToSelectedTemplate}
                      disabled={isPending}
                      className="rounded-full bg-primary p-2 text-white hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <Check className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>
        )}
      </div>
    </div>
  );
}
