"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import {
  Check,
  BriefcaseBusiness,
  Coffee,
  GripVertical,
  Pencil,
  Plus,
  SquarePen,
  SunMedium,
  WandSparkles,
  X,
} from "lucide-react";
import type { TemplateDefinition, TemplateItem } from "@/lib/mock-data";
import {
  loadStoredTemplates,
  saveStoredTemplates,
} from "@/lib/template-storage";

type InlineTemplateDraft = {
  name: string;
  description: string;
};

type TaskDraft = {
  label: string;
  description: string;
};

const blankTaskDraft: TaskDraft = {
  label: "",
  description: "",
};

function toTemplateId(name: string) {
  return `template-${name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-") || Date.now()}`;
}

function toItemId(label: string) {
  return `item-${label.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-") || Date.now()}`;
}

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
  const [templates, setTemplates] = useState<TemplateDefinition[]>(() =>
    loadStoredTemplates(initialTemplates),
  );
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(() => {
    const storedTemplates = loadStoredTemplates(initialTemplates);
    return storedTemplates[0]?.id ?? initialTemplates[0].id;
  });
  const [editingTemplateId, setEditingTemplateId] = useState<string | null>(null);
  const [editingDraft, setEditingDraft] = useState<InlineTemplateDraft | null>(null);
  const [newTemplateDraft, setNewTemplateDraft] =
    useState<InlineTemplateDraft | null>(null);
  const [isTaskComposerOpen, setIsTaskComposerOpen] = useState(false);
  const [taskDraft, setTaskDraft] = useState<TaskDraft>(blankTaskDraft);

  useEffect(() => {
    saveStoredTemplates(templates);
  }, [templates]);

  const selectedTemplate =
    templates.find((template) => template.id === selectedTemplateId) ?? templates[0];

  function selectTemplate(templateId: string) {
    setSelectedTemplateId(templateId);
    setEditingTemplateId(null);
    setEditingDraft(null);
    setIsTaskComposerOpen(false);
  }

  function toggleTemplate(templateId: string) {
    setTemplates((currentTemplates) =>
      currentTemplates.map((template) =>
        template.id === templateId
          ? { ...template, active: !template.active }
          : template,
      ),
    );
    setSelectedTemplateId(templateId);
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

    setTemplates((currentTemplates) =>
      currentTemplates.map((template) =>
        template.id === templateId
          ? {
              ...template,
              name: editingDraft.name.trim(),
              description:
                editingDraft.description.trim() || template.description,
              shortLabel:
                editingDraft.name.trim().slice(0, 3).toUpperCase() ||
                template.shortLabel,
            }
          : template,
      ),
    );
    setEditingTemplateId(null);
    setEditingDraft(null);
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

    const nextTemplate: TemplateDefinition = {
      id: toTemplateId(newTemplateDraft.name),
      name: newTemplateDraft.name.trim(),
      description:
        newTemplateDraft.description.trim() ||
        "Template baru untuk checklist harian.",
      focus: "General",
      color: "#47626c",
      shortLabel: newTemplateDraft.name.trim().slice(0, 3).toUpperCase() || "NEW",
      frequency: "Setiap Hari",
      active: false,
      items: [],
    };

    setTemplates((currentTemplates) => [nextTemplate, ...currentTemplates]);
    setSelectedTemplateId(nextTemplate.id);
    setNewTemplateDraft(null);
  }

  function cancelNewTemplate() {
    setNewTemplateDraft(null);
  }

  function addTaskToSelectedTemplate() {
    if (!taskDraft.label.trim()) {
      return;
    }

    const nextItem: TemplateItem = {
      id: toItemId(taskDraft.label),
      label: taskDraft.label.trim(),
      description:
        taskDraft.description.trim() ||
        "Tuliskan detail singkat untuk task ini.",
      category: "Checklist",
      window: "Flexible",
    };

    setTemplates((currentTemplates) =>
      currentTemplates.map((template) =>
        template.id === selectedTemplate.id
          ? { ...template, items: [...template.items, nextItem] }
          : template,
      ),
    );
    setTaskDraft(blankTaskDraft);
    setIsTaskComposerOpen(false);
  }

  return (
    <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
      <div className="space-y-6 lg:col-span-5">
        <div className="rounded-[24px] border border-outline/70 bg-white p-6 shadow-[0_4px_12px_rgba(137,168,178,0.08)]">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-[20px] font-semibold text-primary">
              Template Tersedia
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
                    placeholder="Judul template baru"
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
                    placeholder="Deskripsi template baru"
                  />
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={saveNewTemplate}
                      className="rounded-full bg-primary p-2 text-white hover:bg-primary/90"
                    >
                      <Check className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={cancelNewTemplate}
                      className="rounded-full bg-surface-strong p-2 text-muted hover:bg-outline/40"
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
                            className="rounded-full bg-surface-strong p-2 text-muted hover:bg-outline/40"
                          >
                            <X className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();
                              saveEditedTemplate(template.id);
                            }}
                            className="rounded-full bg-primary p-2 text-white hover:bg-primary/90"
                          >
                            <Check className="h-4 w-4" />
                          </button>
                        </>
                      ) : (
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            startEditingTemplate(template);
                          }}
                          className="rounded-full bg-surface-strong p-2 text-primary hover:bg-secondary"
                        >
                          <SquarePen className="h-4 w-4" />
                        </button>
                      )}
                      <button
                        type="button"
                        aria-pressed={template.active}
                        onClick={(event) => {
                          event.stopPropagation();
                          toggleTemplate(template.id);
                        }}
                        className={`flex h-6 w-11 items-center rounded-full p-1 ${
                          template.active ? "bg-primary" : "bg-outline/70"
                        }`}
                      >
                        <span
                          className={`h-4 w-4 rounded-full bg-white transition-transform ${
                            template.active ? "translate-x-5" : ""
                          }`}
                        />
                      </button>
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

        <div className="relative h-48 overflow-hidden rounded-[20px] shadow-[0_4px_12px_rgba(137,168,178,0.08)]">
          <Image
            alt="Mindful workspace"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBVjqj79g1V45Q1wtW-YJB8Jxngtv4cjjBypDEBVHua5M6vQv6io37VRMfCfHcohWOJcyHJcpXrPCjema4yR3Pxc3vyJCeWWQxwZTuTzJMA2K0Z3hneCZ7N0r-YkgwfR-Uc2wFNI8aKIaFPny76V3wBMuz1MGsxAK5wnkBD8UJXtJpyQ_tROHEsbj9dFMkaUDVdezRkFfBPNsYOQasLYZOdHZKGOKUlJQEe4V_SjnVJsYXv7hGXO-Zvtz66AlNdAUirbwMmpzP5gW2k"
            fill
            sizes="(max-width: 1024px) 100vw, 40vw"
            className="object-cover transition-transform duration-700 hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent p-6 text-white">
            <div className="absolute bottom-6">
              <p className="text-[20px] font-semibold">Kembangkan Kebiasaan</p>
              <p className="mt-2 max-w-xs text-sm leading-6 text-white/80">
                Template membantu Anda konsisten dalam refleksi diri setiap hari.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="lg:col-span-7">
        <section className="rounded-[24px] border border-outline/70 bg-white p-6 shadow-[0_4px_12px_rgba(137,168,178,0.08)]">
          <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h3 className="text-[32px] font-semibold leading-[40px] tracking-[-0.02em] text-foreground">
                Editor: {selectedTemplate.name}
              </h3>
              <p className="text-sm leading-6 text-muted">
                Edit struktur input untuk template ini.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={cancelEditingTemplate}
                className="rounded-full bg-surface-strong p-3 text-muted hover:bg-outline/40"
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
                className="rounded-full bg-primary p-3 text-white hover:bg-primary/90"
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
                  <span className="text-sm font-semibold">Tambah Item Baru</span>
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
                    placeholder="Judul task baru"
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
                    placeholder="Deskripsi task baru"
                  />
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsTaskComposerOpen(false)}
                      className="rounded-full bg-surface-strong p-2 text-muted hover:bg-outline/40"
                    >
                      <X className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={addTaskToSelectedTemplate}
                      className="rounded-full bg-primary p-2 text-white hover:bg-primary/90"
                    >
                      <Check className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
