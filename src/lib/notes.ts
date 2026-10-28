import { and, desc, eq, or } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { notes } from "@/lib/db/schema";
import crypto from "crypto";

export type NoteVisibility = "public" | "authenticated" | "private";

export function isNoteVisibility(value: unknown): value is NoteVisibility {
  return value === "public" || value === "authenticated" || value === "private";
}

export class NoteStorageError extends Error {
  constructor() {
    super("Catatan belum dapat disimpan. Periksa DATABASE_URL dan pastikan tabel notes sudah dibuat, lalu coba lagi.");
    this.name = "NoteStorageError";
  }
}

export interface NoteItem {
  id: string;
  userId: string;
  authorEmail: string;
  authorName: string | null;
  title: string;
  content: string;
  category: string;
  visibility: NoteVisibility;
  isPinned: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Generate a cryptographically random, non-title-based ID (e.g. nt_x8k2m9p1q7v4)
export function generateRandomNoteId(): string {
  const chars = "23456789abcdefghjkmnpqrstuvwxyz";
  let randomStr = "";
  const bytes = crypto.randomBytes(12);
  for (let i = 0; i < 12; i++) {
    randomStr += chars[bytes[i] % chars.length];
  }
  return `nt_${randomStr}`;
}

// In-memory store fallback when DB is not connected
const fallbackNotes: NoteItem[] = [
  {
    id: "nt_7k9x2m4p8q1v",
    userId: "najwanoctavian@gmail.com",
    authorEmail: "najwanoctavian@gmail.com",
    authorName: "Najwan Octavian",
    title: "Welcome to Serene Diary Notes",
    content: `### Welcome to your Mindful Notes! 🌿

This is a personal space to capture ideas, reflection logs, operational checklists, and thoughts.

**Features of Notes:**
- **Random URL Path**: Note links use random secure tokens rather than title slugs.
- **RBAC & Visibility Control**:
  - 🌐 **Public**: Anyone with the link can view (no login needed).
  - 👥 **Logged-in Users**: Accessible to any authenticated workspace member.
  - 🔒 **Private (Only Me)**: Strictly accessible to the author.
- **Quick Pinning**: Keep critical notes at the top of your list.
- **Fast Search & Filter**: Filter by categories and visibility.`,
    category: "Guide",
    visibility: "public",
    isPinned: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "nt_3b5w8r1z9x4y",
    userId: "najwanoctavian@gmail.com",
    authorEmail: "najwanoctavian@gmail.com",
    authorName: "Najwan Octavian",
    title: "Project Deployment Checklist & Architecture",
    content: `#### Infrastructure & Deployment Notes
- Port: 3100
- Reverse Proxy: Nginx on host (Port 443 SSL via Let's Encrypt)
- Process Manager: PM2
- Database: Supabase PostgreSQL (via Drizzle ORM)
- Authentication: NextAuth Google SSO with whitelist RBAC`,
    category: "DevOps",
    visibility: "authenticated",
    isPinned: false,
    createdAt: new Date(Date.now() - 3600000),
    updatedAt: new Date(Date.now() - 3600000),
  },
];

export async function getNotesForUser(viewerEmail: string | null): Promise<NoteItem[]> {
  const db = getDb();

  if (db) {
    try {
      if (!viewerEmail) {
        // Public viewer: only public notes
        const rows = await db
          .select()
          .from(notes)
          .where(eq(notes.visibility, "public"))
          .orderBy(desc(notes.isPinned), desc(notes.updatedAt));
        return rows.map((r) => ({
          ...r,
          visibility: r.visibility as NoteVisibility,
        }));
      }

      // Authenticated user: own notes OR other notes that are public or authenticated
      const rows = await db
        .select()
        .from(notes)
        .where(
          or(
            eq(notes.authorEmail, viewerEmail.toLowerCase()),
            eq(notes.visibility, "public"),
            eq(notes.visibility, "authenticated"),
          ),
        )
        .orderBy(desc(notes.isPinned), desc(notes.updatedAt));

      return rows.map((r) => ({
        ...r,
        visibility: r.visibility as NoteVisibility,
      }));
    } catch (err) {
      console.error("getNotesForUser DB error:", err);
      throw new NoteStorageError();
    }
  }

  // Fallback in-memory
  if (!viewerEmail) {
    return fallbackNotes.filter((n) => n.visibility === "public");
  }

  return fallbackNotes
    .filter(
      (n) =>
        n.authorEmail === viewerEmail.toLowerCase() ||
        n.visibility === "public" ||
        n.visibility === "authenticated",
    )
    .sort((a, b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0) || b.updatedAt.getTime() - a.updatedAt.getTime());
}

export interface NoteAccessResult {
  note: NoteItem | null;
  canView: boolean;
  canEdit: boolean;
  role: "owner" | "member" | "public_viewer" | "unauthorized";
}

export async function getNoteById(
  id: string,
  viewerEmail: string | null,
): Promise<NoteAccessResult> {
  const db = getDb();
  let note: NoteItem | null = null;

  if (db) {
    try {
      const rows = await db.select().from(notes).where(eq(notes.id, id)).limit(1);
      if (rows.length > 0) {
        const r = rows[0];
        note = {
          ...r,
          visibility: r.visibility as NoteVisibility,
        };
      }
    } catch (err) {
      console.error("getNoteById DB error:", err);
      throw new NoteStorageError();
    }
  }

  if (!note) {
    note = fallbackNotes.find((n) => n.id === id) ?? null;
  }

  if (!note) {
    return { note: null, canView: false, canEdit: false, role: "unauthorized" };
  }

  const isOwner = viewerEmail !== null && note.authorEmail.toLowerCase() === viewerEmail.toLowerCase();

  if (isOwner) {
    return { note, canView: true, canEdit: true, role: "owner" };
  }

  if (note.visibility === "public") {
    return { note, canView: true, canEdit: false, role: viewerEmail ? "member" : "public_viewer" };
  }

  if (note.visibility === "authenticated") {
    if (viewerEmail) {
      return { note, canView: true, canEdit: false, role: "member" };
    }
    return { note: null, canView: false, canEdit: false, role: "unauthorized" };
  }

  // Private note and not the owner
  return { note: null, canView: false, canEdit: false, role: "unauthorized" };
}

export async function createNote(params: {
  userId: string;
  authorEmail: string;
  authorName?: string;
  title: string;
  content: string;
  category?: string;
  visibility?: NoteVisibility;
  isPinned?: boolean;
}): Promise<NoteItem> {
  const id = generateRandomNoteId();
  const now = new Date();

  const newNote: NoteItem = {
    id,
    userId: params.userId,
    authorEmail: params.authorEmail.toLowerCase(),
    authorName: params.authorName || params.authorEmail.split("@")[0],
    title: params.title.trim() || "Untitled Note",
    content: params.content || "",
    category: params.category?.trim() || "General",
    visibility: params.visibility || "private",
    isPinned: params.isPinned ?? false,
    createdAt: now,
    updatedAt: now,
  };

  const db = getDb();
  if (!db) {
    throw new NoteStorageError();
  }

  try {
    await db.insert(notes).values({
      id: newNote.id,
      userId: newNote.userId,
      authorEmail: newNote.authorEmail,
      authorName: newNote.authorName,
      title: newNote.title,
      content: newNote.content,
      category: newNote.category,
      visibility: newNote.visibility,
      isPinned: newNote.isPinned,
      createdAt: newNote.createdAt,
      updatedAt: newNote.updatedAt,
    });
    return newNote;
  } catch (err) {
    console.error("createNote DB error:", err);
    throw new NoteStorageError();
  }
}

export async function updateNote(
  id: string,
  params: {
    title?: string;
    content?: string;
    category?: string;
    visibility?: NoteVisibility;
    isPinned?: boolean;
  },
  viewerEmail: string,
): Promise<NoteItem> {
  const db = getDb();
  if (!db) {
    throw new NoteStorageError();
  }

  const access = await getNoteById(id, viewerEmail);
  if (!access.canEdit || !access.note) {
    throw new Error("Forbidden: You do not have permission to edit this note.");
  }

  const now = new Date();
  const updatedNote: NoteItem = {
    ...access.note,
    title: params.title !== undefined ? params.title.trim() || "Untitled Note" : access.note.title,
    content: params.content !== undefined ? params.content : access.note.content,
    category: params.category !== undefined ? params.category.trim() || "General" : access.note.category,
    visibility: params.visibility !== undefined ? params.visibility : access.note.visibility,
    isPinned: params.isPinned !== undefined ? params.isPinned : access.note.isPinned,
    updatedAt: now,
  };

  try {
    const rows = await db
      .update(notes)
      .set({
        title: updatedNote.title,
        content: updatedNote.content,
        category: updatedNote.category,
        visibility: updatedNote.visibility,
        isPinned: updatedNote.isPinned,
        updatedAt: updatedNote.updatedAt,
      })
      .where(eq(notes.id, id))
      .returning();
    if (!rows[0]) {
      throw new Error("Note not found.");
    }
    return { ...rows[0], visibility: rows[0].visibility as NoteVisibility };
  } catch (err) {
    if (err instanceof Error && err.message === "Note not found.") throw err;
    console.error("updateNote DB error:", err);
    throw new NoteStorageError();
  }
}

export async function deleteNote(id: string, viewerEmail: string): Promise<boolean> {
  const db = getDb();
  if (!db) {
    throw new NoteStorageError();
  }

  const access = await getNoteById(id, viewerEmail);
  if (!access.canEdit || !access.note) {
    throw new Error("Forbidden: You do not have permission to delete this note.");
  }

  try {
    const rows = await db.delete(notes).where(eq(notes.id, id)).returning({ id: notes.id });
    if (!rows.length) throw new Error("Note not found.");
    return true;
  } catch (err) {
    if (err instanceof Error && err.message === "Note not found.") throw err;
    console.error("deleteNote DB error:", err);
    throw new NoteStorageError();
  }
}
