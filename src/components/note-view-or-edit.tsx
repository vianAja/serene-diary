"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  Check,
  Copy,
  Edit3,
  Eye,
  Globe,
  Lock,
  Pin,
  Save,
  Trash2,
  User,
  Users,
  X,
} from "lucide-react";
import type { NoteItem, NoteVisibility } from "@/lib/notes";
import { MarkdownRenderer } from "@/components/markdown-renderer";

interface NoteViewOrEditProps {
  initialNote: NoteItem;
  canEdit: boolean;
  currentUserEmail: string | null;
  initialEditing?: boolean;
}

export function NoteViewOrEdit({
  initialNote,
  canEdit,
  currentUserEmail,
  initialEditing = false,
}: NoteViewOrEditProps) {
  const router = useRouter();
  const [note, setNote] = useState<NoteItem>(initialNote);
  const [isEditing, setIsEditing] = useState(initialEditing && canEdit);
  const [preview, setPreview] = useState(false); // toggle markdown preview while editing
  const [copied, setCopied] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Edit form state
  const [title, setTitle] = useState(initialNote.title);
  const [content, setContent] = useState(initialNote.content);
  const [category, setCategory] = useState(initialNote.category);
  const [visibility, setVisibility] = useState<NoteVisibility>(initialNote.visibility);
  const [isPinned, setIsPinned] = useState(initialNote.isPinned);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleCopy = async () => {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const url = `${origin}/notes/${note.id}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // fallback
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMsg("Note title is required.");
      return;
    }
    setErrorMsg("");
    setSuccessMsg("");

    startTransition(async () => {
      try {
        const res = await fetch(`/api/notes/${note.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title, content, category, visibility, isPinned }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to update note");

        setNote(data.note);
        setIsEditing(false);
        setPreview(false);
        setSuccessMsg("Note saved successfully!");
        setTimeout(() => setSuccessMsg(""), 3000);
        router.refresh();
      } catch (err: unknown) {
        setErrorMsg(err instanceof Error ? err.message : "Error saving note");
      }
    });
  };

  const handleCancelEdit = () => {
    setTitle(note.title);
    setContent(note.content);
    setCategory(note.category);
    setVisibility(note.visibility);
    setIsPinned(note.isPinned);
    setErrorMsg("");
    setPreview(false);
    setIsEditing(false);
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this note?")) return;
    startTransition(async () => {
      try {
        const res = await fetch(`/api/notes/${note.id}`, { method: "DELETE" });
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Failed to delete");
        }
        router.push("/notes");
      } catch (err) {
        alert(err instanceof Error ? err.message : "Failed to delete note");
      }
    });
  };

  const createdDate = new Date(note.createdAt).toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const getVisibilityBadge = (vis: NoteVisibility) => {
    switch (vis) {
      case "public":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 border border-emerald-200">
            <Globe className="h-3.5 w-3.5" /> Tautan publik
          </span>
        );
      case "authenticated":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 border border-blue-200">
            <Users className="h-3.5 w-3.5" /> Pengguna login
          </span>
        );
      case "private":
      default:
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 border border-slate-200">
            <Lock className="h-3.5 w-3.5" /> Hanya saya
          </span>
        );
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Top Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/notes"
          className="inline-flex items-center gap-2 rounded-xl px-3 py-1.5 text-sm font-semibold text-muted hover:bg-surface-soft hover:text-foreground transition"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Notes
        </Link>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 rounded-xl border border-outline/80 bg-surface px-3 py-1.5 text-xs font-semibold text-muted hover:bg-surface-soft hover:text-foreground transition shadow-2xs"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-600" />
                <span className="text-emerald-600">Copied Link!</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" />
                <span>Share Link</span>
              </>
            )}
          </button>

          {canEdit && !isEditing && (
            <>
              <button
                onClick={() => setIsEditing(true)}
                className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-primary/90 transition shadow-2xs"
              >
                <Edit3 className="h-3.5 w-3.5" />
                <span>Edit Note</span>
              </button>
              <button
                onClick={handleDelete}
                className="rounded-xl border border-rose-200 bg-surface p-1.5 text-rose-500 hover:bg-rose-50 transition shadow-2xs"
                title="Delete Note"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Alert messages */}
      {successMsg && (
        <div className="rounded-xl bg-emerald-50 p-3 text-xs font-semibold text-emerald-700 border border-emerald-200">
          ✅ {successMsg}
        </div>
      )}
      {errorMsg && (
        <div className="rounded-xl bg-rose-50 p-3 text-xs font-semibold text-rose-700 border border-rose-200">
          {errorMsg}
        </div>
      )}

      {/* ============================= */}
      {/* IN-PAGE EDITOR (Edit Mode)    */}
      {/* ============================= */}
      {isEditing ? (
        <article className="surface-card overflow-hidden rounded-2xl shadow-sm">
          {/* Editor Header */}
          <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-outline/70">
            <div>
              <h2 className="text-lg font-bold text-foreground">Edit Note</h2>
              <p className="mt-0.5 text-xs text-muted font-mono">
                ID: {note.id}
              </p>
            </div>
            <button
              onClick={handleCancelEdit}
              className="rounded-lg p-1.5 text-muted hover:bg-surface-soft hover:text-foreground"
              title="Cancel editing"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={handleSave} className="p-6 space-y-5">
            {/* Title */}
            <div>
              <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1">
                Note Title
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter note title..."
                className="w-full rounded-xl border border-outline/80 bg-surface px-4 py-2.5 text-base font-semibold focus:border-primary focus:outline-hidden"
              />
            </div>

            {/* Category & Visibility */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1">
                  Category
                </label>
                <input
                  type="text"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="e.g. Work, Journal, Research"
                  className="w-full rounded-xl border border-outline/80 bg-surface px-3 py-2 text-sm focus:border-primary focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1">
                  Who can open this note?
                </label>
                <select
                  value={visibility}
                  onChange={(e) => setVisibility(e.target.value as NoteVisibility)}
                  className="w-full rounded-xl border border-outline/80 bg-surface px-3 py-2 text-sm focus:border-primary focus:outline-hidden font-medium"
                >
                  <option value="private">🔒 Hanya saya</option>
                  <option value="authenticated">👥 Pengguna login workspace</option>
                  <option value="public">🌐 Siapa saja yang memiliki tautan</option>
                </select>
              </div>
            </div>

            {/* Content: Toggle between Markdown editor and Preview */}
            <div>
              <div className="mb-2 flex items-center justify-between">
                <label className="block text-xs font-semibold text-muted uppercase tracking-wider">
                  Content
                </label>
                {/* Toggle Preview/Edit button */}
                <button
                  type="button"
                  onClick={() => setPreview((v) => !v)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-outline/70 bg-surface-soft px-3 py-1 text-xs font-semibold text-muted hover:text-foreground transition"
                >
                  {preview ? (
                    <>
                      <Edit3 className="h-3.5 w-3.5" />
                      <span>Back to Editor</span>
                    </>
                  ) : (
                    <>
                      <Eye className="h-3.5 w-3.5" />
                      <span>Preview Markdown</span>
                    </>
                  )}
                </button>
              </div>

              {preview ? (
                /* Markdown Preview Panel */
                <div className="min-h-[300px] w-full rounded-xl border border-primary/30 bg-surface p-5">
                  {content.trim() ? (
                    <MarkdownRenderer content={content} />
                  ) : (
                    <p className="text-sm text-muted italic">Nothing to preview yet...</p>
                  )}
                </div>
              ) : (
                /* Raw Markdown Textarea */
                <div className="relative">
                  <textarea
                    rows={14}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder={`Write your note in Markdown format...\n\n# Heading 1\n## Heading 2\n\n**Bold text**, *italic text*\n\n- Bullet point one\n- Bullet point two\n\n> Blockquote\n\n\`inline code\``}
                    className="w-full rounded-xl border border-outline/80 bg-surface p-4 text-sm leading-relaxed text-foreground focus:border-primary focus:outline-hidden resize-y font-mono"
                  />
                  <div className="absolute bottom-3 right-3 rounded-md bg-surface-soft px-2 py-1 text-[10px] font-semibold text-muted">
                    Markdown
                  </div>
                </div>
              )}

              <p className="mt-1.5 text-xs text-muted">
                Supports <strong>Markdown</strong>: headings (#), bold (**), italic (*), lists (-), code blocks (```), tables, links, and more.
              </p>
            </div>

            {/* Pin Toggle */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="inPagePin"
                checked={isPinned}
                onChange={(e) => setIsPinned(e.target.checked)}
                className="h-4 w-4 rounded border-outline text-primary focus:ring-primary"
              />
              <label htmlFor="inPagePin" className="text-xs font-semibold text-foreground cursor-pointer">
                Pin this note to the top of your list
              </label>
            </div>

            {/* Save / Cancel */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-outline/70">
              <button
                type="button"
                onClick={handleCancelEdit}
                className="rounded-xl px-4 py-2 text-sm font-semibold text-muted hover:bg-surface-soft"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isPending}
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary/90 disabled:opacity-50"
              >
                <Save className="h-4 w-4" />
                {isPending ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </article>
      ) : (
        /* =============================== */
        /* READING VIEW (Rendered Markdown) */
        /* =============================== */
        <article className="surface-card overflow-hidden rounded-2xl shadow-sm">
          {/* Meta row */}
          <div className="flex flex-wrap items-center justify-between gap-3 px-6 pt-6 pb-5 border-b border-outline/60">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-lg bg-surface-soft px-3 py-1 text-xs font-medium text-muted">
                {note.category}
              </span>
              {getVisibilityBadge(note.visibility)}
              {note.isPinned && (
                <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                  <Pin className="h-3 w-3 fill-primary" /> Pinned
                </span>
              )}
            </div>
            <span className="font-mono text-xs bg-surface-soft px-2 py-1 rounded text-muted">
              ID: {note.id}
            </span>
          </div>

          <div className="px-6 sm:px-8 pb-8">
            {/* Title — rendered as large heading */}
            <h1 className="mt-6 text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground leading-snug">
              {note.title}
            </h1>

            {/* Author & Date */}
            <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-muted">
              <div className="flex items-center gap-1.5">
                <User className="h-3.5 w-3.5" />
                <span>{note.authorName || note.authorEmail}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" />
                <span>{createdDate}</span>
              </div>
            </div>

            {/* Divider */}
            <hr className="my-6 border-outline/40" />

            {/* ============================== */}
            {/* MARKDOWN RENDERED CONTENT BODY */}
            {/* ============================== */}
            {note.content ? (
              <MarkdownRenderer content={note.content} />
            ) : (
              <p className="text-sm text-muted italic">This note has no content yet.</p>
            )}
          </div>
        </article>
      )}
    </div>
  );
}
