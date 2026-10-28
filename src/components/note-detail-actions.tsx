"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, Copy, Edit3, Trash2, X } from "lucide-react";
import type { NoteItem, NoteVisibility } from "@/lib/notes";

export function NoteDetailActions({
  note,
  canEdit,
  currentUserEmail,
}: {
  note: NoteItem;
  canEdit: boolean;
  currentUserEmail: string | null;
}) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const [title, setTitle] = useState(note.title);
  const [content, setContent] = useState(note.content);
  const [category, setCategory] = useState(note.category);
  const [visibility, setVisibility] = useState<NoteVisibility>(note.visibility);
  const [isPinned, setIsPinned] = useState(note.isPinned);
  const [errorMsg, setErrorMsg] = useState("");

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

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMsg("Title is required");
      return;
    }

    startTransition(async () => {
      try {
        const res = await fetch(`/api/notes/${note.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title, content, category, visibility, isPinned }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to update note");

        setIsEditOpen(false);
        router.refresh();
      } catch (err: unknown) {
        setErrorMsg(err instanceof Error ? err.message : "Error saving note");
      }
    });
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

  return (
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

      {canEdit && (
        <>
          <button
            onClick={() => setIsEditOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-outline/80 bg-surface px-3 py-1.5 text-xs font-semibold text-muted hover:bg-surface-soft hover:text-foreground transition shadow-2xs"
          >
            <Edit3 className="h-3.5 w-3.5" />
            <span>Edit</span>
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

      {/* Edit Modal */}
      {isEditOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs">
          <div className="surface-card w-full max-w-xl rounded-2xl p-6 shadow-xl animate-fade-up">
            <div className="flex items-center justify-between pb-4 border-b border-outline/70">
              <h2 className="text-lg font-bold text-foreground">Edit Note</h2>
              <button
                onClick={() => setIsEditOpen(false)}
                className="rounded-lg p-1 text-muted hover:bg-surface-soft hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleUpdate} className="mt-4 space-y-4 text-left">
              {errorMsg && (
                <div className="rounded-xl bg-rose-50 p-3 text-xs font-semibold text-rose-700 border border-rose-200">
                  {errorMsg}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1">
                  Title
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-xl border border-outline/80 bg-surface px-3 py-2 text-sm focus:border-primary focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1">
                    Category
                  </label>
                  <input
                    type="text"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
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
                    className="w-full rounded-xl border border-outline/80 bg-surface px-3 py-2 text-sm focus:border-primary focus:outline-hidden"
                  >
                    <option value="private">🔒 Hanya saya</option>
                    <option value="authenticated">👥 Pengguna login workspace</option>
                    <option value="public">🌐 Siapa saja yang memiliki tautan</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1">
                  Content
                </label>
                <textarea
                  rows={8}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full rounded-xl border border-outline/80 bg-surface px-3 py-2 text-sm focus:border-primary focus:outline-hidden resize-none font-sans"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="modalPin"
                  checked={isPinned}
                  onChange={(e) => setIsPinned(e.target.checked)}
                  className="h-4 w-4 rounded border-outline text-primary focus:ring-primary"
                />
                <label htmlFor="modalPin" className="text-xs font-semibold text-foreground cursor-pointer">
                  Pin this note to the top
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-outline/70">
                <button
                  type="button"
                  onClick={() => setIsEditOpen(false)}
                  className="rounded-xl px-4 py-2 text-sm font-semibold text-muted hover:bg-surface-soft"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="rounded-xl bg-primary px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary/90 disabled:opacity-50"
                >
                  {isPending ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
