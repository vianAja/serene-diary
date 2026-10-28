"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Check,
  Copy,
  Edit3,
  ExternalLink,
  Globe,
  Lock,
  NotebookPen,
  Pin,
  PinOff,
  Plus,
  Search,
  Trash2,
  Users,
} from "lucide-react";
import type { NoteItem, NoteVisibility } from "@/lib/notes";

interface NotesManagerProps {
  initialNotes: NoteItem[];
  currentUserEmail: string | null;
}

export function NotesManager({ initialNotes, currentUserEmail }: NotesManagerProps) {
  const router = useRouter();
  const [notes, setNotes] = useState<NoteItem[]>(initialNotes);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTab, setSelectedTab] = useState<"all" | "mine" | "public" | "shared" | "pinned">("all");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleCopyLink = async (noteId: string) => {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const url = `${origin}/notes/${noteId}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopiedId(noteId);
      setTimeout(() => setCopiedId(null), 2500);
    } catch {
      // fallback
    }
  };

  const handleDelete = async (noteId: string) => {
    if (!confirm("Are you sure you want to delete this note?")) return;

    startTransition(async () => {
      try {
        const res = await fetch(`/api/notes/${noteId}`, { method: "DELETE" });
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Failed to delete");
        }
        setNotes((prev) => prev.filter((n) => n.id !== noteId));
      } catch (err) {
        alert(err instanceof Error ? err.message : "Failed to delete note");
      }
    });
  };

  const handleTogglePin = async (note: NoteItem) => {
    const isOwner = currentUserEmail && note.authorEmail.toLowerCase() === currentUserEmail.toLowerCase();
    if (!isOwner) return;

    startTransition(async () => {
      try {
        const res = await fetch(`/api/notes/${note.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isPinned: !note.isPinned }),
        });
        const data = await res.json();
        if (res.ok) {
          setNotes((prev) =>
            prev.map((n) => (n.id === note.id ? { ...data.note } : n)),
          );
        }
      } catch {
        // ignore
      }
    });
  };

  // Filter notes
  const filteredNotes = notes.filter((note) => {
    const isOwner = currentUserEmail && note.authorEmail.toLowerCase() === currentUserEmail.toLowerCase();

    // Tab filter
    if (selectedTab === "mine" && !isOwner) return false;
    if (selectedTab === "public" && note.visibility !== "public") return false;
    if (selectedTab === "shared" && (isOwner || note.visibility === "private")) return false;
    if (selectedTab === "pinned" && !note.isPinned) return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = note.title.toLowerCase().includes(q);
      const matchContent = note.content.toLowerCase().includes(q);
      const matchCategory = note.category.toLowerCase().includes(q);
      return matchTitle || matchContent || matchCategory;
    }

    return true;
  });

  const getVisibilityBadge = (visibility: NoteVisibility) => {
    switch (visibility) {
      case "public":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 border border-emerald-200">
            <Globe className="h-3 w-3" /> Tautan publik
          </span>
        );
      case "authenticated":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700 border border-blue-200">
            <Users className="h-3 w-3" /> Login workspace
          </span>
        );
      case "private":
      default:
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-700 border border-slate-200">
            <Lock className="h-3 w-3" /> Hanya saya
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Notes & Reflections
          </h1>
          <p className="mt-1 text-sm text-muted">
            Capture thoughts, project logs, or share public notes with secure RBAC and random URLs.
          </p>
        </div>

        {currentUserEmail && (
          <Link
            href="/notes/new"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" />
            New Note
          </Link>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Tab Filters */}
        <div className="flex flex-wrap gap-1.5 rounded-xl bg-surface-soft p-1.5 border border-outline/60">
          <button
            onClick={() => setSelectedTab("all")}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
              selectedTab === "all"
                ? "bg-surface text-primary shadow-xs"
                : "text-muted hover:text-foreground"
            }`}
          >
            All ({notes.length})
          </button>
          {currentUserEmail && (
            <button
              onClick={() => setSelectedTab("mine")}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                selectedTab === "mine"
                  ? "bg-surface text-primary shadow-xs"
                  : "text-muted hover:text-foreground"
              }`}
            >
              My Notes
            </button>
          )}
          <button
            onClick={() => setSelectedTab("public")}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
              selectedTab === "public"
                ? "bg-surface text-primary shadow-xs"
                : "text-muted hover:text-foreground"
            }`}
          >
            Public Link
          </button>
          {currentUserEmail && (
            <button
              onClick={() => setSelectedTab("shared")}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                selectedTab === "shared"
                  ? "bg-surface text-primary shadow-xs"
                  : "text-muted hover:text-foreground"
              }`}
            >
              Shared with Me
            </button>
          )}
          <button
            onClick={() => setSelectedTab("pinned")}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
              selectedTab === "pinned"
                ? "bg-surface text-primary shadow-xs"
                : "text-muted hover:text-foreground"
            }`}
          >
            Pinned
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input
            type="text"
            placeholder="Search notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-outline/80 bg-surface pl-9 pr-3 py-1.5 text-sm placeholder:text-muted focus:border-primary focus:outline-hidden"
          />
        </div>
      </div>

      {/* Notes Grid */}
      {filteredNotes.length === 0 ? (
        <div className="surface-card flex flex-col items-center justify-center rounded-2xl p-12 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-surface-soft text-primary">
            <NotebookPen className="h-7 w-7" />
          </div>
          <h3 className="mt-4 text-base font-semibold text-foreground">No notes found</h3>
          <p className="mt-1 max-w-sm text-sm text-muted">
            {searchQuery
              ? "Try adjusting your search terms or active filters."
              : "Create your first mindful note with custom RBAC access."}
          </p>
          {currentUserEmail && !searchQuery && (
            <Link
              href="/notes/new"
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary/90"
            >
              <Plus className="h-4 w-4" /> Create Note
            </Link>
          )}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredNotes.map((note) => {
            const isOwner = currentUserEmail && note.authorEmail.toLowerCase() === currentUserEmail.toLowerCase();
            const createdDate = new Date(note.createdAt).toLocaleDateString("id-ID", {
              day: "numeric",
              month: "short",
              year: "numeric",
            });

            return (
              <article
                key={note.id}
                className={`surface-card group relative flex flex-col justify-between rounded-2xl p-5 transition hover:shadow-md ${
                  note.isPinned ? "border-primary/40 bg-linear-to-b from-primary/5 to-transparent" : ""
                }`}
              >
                <div>
                  {/* Top line: Category + Badges + Pin */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="rounded-lg bg-surface-soft px-2.5 py-1 text-xs font-medium text-muted">
                        {note.category}
                      </span>
                      {getVisibilityBadge(note.visibility)}
                    </div>

                    <div className="flex items-center gap-1">
                      {isOwner && (
                        <button
                          onClick={() => handleTogglePin(note)}
                          title={note.isPinned ? "Unpin note" : "Pin note to top"}
                          className={`rounded-lg p-1 transition ${
                            note.isPinned
                              ? "text-primary hover:bg-primary/10"
                              : "text-muted hover:bg-surface-soft opacity-0 group-hover:opacity-100"
                          }`}
                        >
                          {note.isPinned ? <Pin className="h-4 w-4 fill-primary" /> : <PinOff className="h-4 w-4" />}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="mt-3 text-base font-bold text-foreground line-clamp-1">
                    <Link
                      href={`/notes/${note.id}`}
                      className="hover:text-primary transition"
                    >
                      {note.title}
                    </Link>
                  </h3>

                  {/* Content snippet */}
                  <p className="mt-2 text-sm leading-relaxed text-muted line-clamp-3">
                    {note.content || "(No content)"}
                  </p>
                </div>

                {/* Footer: Random URL token, Author, Actions */}
                <div className="mt-5 pt-3 border-t border-outline/50">
                  <div className="flex items-center justify-between text-xs text-muted">
                    <span className="font-mono text-[11px] bg-surface-soft px-1.5 py-0.5 rounded text-muted/80">
                      /notes/{note.id}
                    </span>
                    <span>{createdDate}</span>
                  </div>

                  <div className="mt-3 flex items-center justify-between gap-2">
                    <button
                      onClick={() => handleCopyLink(note.id)}
                      className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium text-muted hover:bg-surface-soft hover:text-foreground transition"
                    >
                      {copiedId === note.id ? (
                        <>
                          <Check className="h-3.5 w-3.5 text-emerald-600" />
                          <span className="text-emerald-600 font-semibold">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3.5 w-3.5" />
                          <span>Copy Link</span>
                        </>
                      )}
                    </button>

                    <div className="flex items-center gap-1">
                      {isOwner && (
                        <>
                          <Link
                            href={`/notes/${note.id}?edit=true`}
                            className="rounded-lg p-1.5 text-muted hover:bg-surface-soft hover:text-foreground transition"
                            title="Edit Note In-Page"
                          >
                            <Edit3 className="h-3.5 w-3.5" />
                          </Link>
                          <button
                            onClick={() => handleDelete(note.id)}
                            className="rounded-lg p-1.5 text-rose-500 hover:bg-rose-50 transition"
                            title="Delete Note"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </>
                      )}

                      <Link
                        href={`/notes/${note.id}`}
                        className="rounded-lg p-1.5 text-primary hover:bg-primary/10 transition"
                        title="Open Note"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
