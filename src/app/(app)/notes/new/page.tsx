"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, X } from "lucide-react";
import type { NoteVisibility } from "@/lib/notes";

export default function NewNotePage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("General");
  const [visibility, setVisibility] = useState<NoteVisibility>("private");
  const [isPinned, setIsPinned] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMsg("Note title is required.");
      return;
    }

    setErrorMsg("");

    startTransition(async () => {
      try {
        const res = await fetch("/api/notes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title, content, category, visibility, isPinned }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to create note");

        // Redirect directly to the newly created note page
        router.push(`/notes/${data.note.id}`);
      } catch (err: unknown) {
        setErrorMsg(err instanceof Error ? err.message : "Error creating note");
      }
    });
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <Link
          href="/notes"
          className="inline-flex items-center gap-2 rounded-xl px-3 py-1.5 text-sm font-semibold text-muted hover:bg-surface-soft hover:text-foreground transition"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Notes
        </Link>
      </div>

      <article className="surface-card overflow-hidden rounded-2xl p-6 sm:p-8 shadow-sm">
        <div className="pb-4 border-b border-outline/70">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Create New Note</h1>
          <p className="mt-1 text-sm text-muted">
            Create a note with full Markdown support, secure random URL ID, and custom RBAC permissions.
          </p>
        </div>

        {errorMsg && (
          <div className="mt-4 rounded-xl bg-rose-50 p-3 text-xs font-semibold text-rose-700 border border-rose-200">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleCreate} className="mt-6 space-y-5">
          <div>
            <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1">
              Note Title
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Daily Standup Log, System Architecture Notes"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-xl border border-outline/80 bg-surface px-4 py-2.5 text-base font-semibold focus:border-primary focus:outline-hidden"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1">
                Category
              </label>
              <input
                type="text"
                placeholder="e.g. Work, Journal, Architecture"
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
                className="w-full rounded-xl border border-outline/80 bg-surface px-3 py-2 text-sm focus:border-primary focus:outline-hidden font-medium"
              >
                <option value="private">🔒 Hanya saya</option>
                <option value="authenticated">👥 Pengguna login workspace</option>
                <option value="public">🌐 Siapa saja yang memiliki tautan</option>
              </select>
            </div>
          </div>

          <div className="rounded-xl bg-surface-soft p-3 text-xs text-muted border border-outline/60">
            {visibility === "public" && (
              <p>
                🌐 <strong>Siapa saja:</strong> Orang yang memiliki tautan dapat membuka catatan ini tanpa login.
              </p>
            )}
            {visibility === "authenticated" && (
              <p>
                👥 <strong>Pengguna login:</strong> Hanya pengguna yang sudah login dan diizinkan masuk workspace yang dapat membuka catatan ini.
              </p>
            )}
            {visibility === "private" && (
              <p>
                🔒 <strong>Hanya saya:</strong> Hanya akun pembuat catatan yang dapat membuka atau mengubahnya.
              </p>
            )}
            <p className="mt-1 text-[11px] text-muted/80">
              ⚡ A cryptographically random URL path (e.g. <code>/notes/nt_...</code>) will be generated.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1">
              Content (Markdown supported)
            </label>
            <textarea
              rows={12}
              placeholder="Write your note content here..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full rounded-xl border border-outline/80 bg-surface p-4 text-sm leading-relaxed focus:border-primary focus:outline-hidden resize-y font-sans"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="newNotePin"
              checked={isPinned}
              onChange={(e) => setIsPinned(e.target.checked)}
              className="h-4 w-4 rounded border-outline text-primary focus:ring-primary"
            />
            <label htmlFor="newNotePin" className="text-xs font-semibold text-foreground cursor-pointer">
              Pin this note to the top of your list
            </label>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-outline/70">
            <Link
              href="/notes"
              className="rounded-xl px-4 py-2 text-sm font-semibold text-muted hover:bg-surface-soft"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isPending}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary/90 disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              {isPending ? "Creating..." : "Create Note"}
            </button>
          </div>
        </form>
      </article>
    </div>
  );
}
