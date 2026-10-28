import { NextResponse } from "next/server";
import { getSignedInUserEmail } from "@/lib/authorized-user";
import { createNote, getNotesForUser, isNoteVisibility, NoteStorageError } from "@/lib/notes";
import type { NoteVisibility } from "@/lib/notes";

export async function GET() {
  const userId = await getSignedInUserEmail();
  try {
    const notes = await getNotesForUser(userId);
    return NextResponse.json({ notes });
  } catch (error) {
    if (error instanceof NoteStorageError) {
      return NextResponse.json({ error: error.message }, { status: 503 });
    }
    throw error;
  }
}

export async function POST(request: Request) {
  const userId = await getSignedInUserEmail();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized. Please sign in to create notes." }, { status: 401 });
  }

  try {
    const body = (await request.json()) as {
      title?: string;
      content?: string;
      category?: string;
      visibility?: NoteVisibility;
      isPinned?: boolean;
    };

    if (!body.title?.trim()) {
      return NextResponse.json({ error: "Title is required." }, { status: 400 });
    }

    if (body.visibility !== undefined && !isNoteVisibility(body.visibility)) {
      return NextResponse.json({ error: "Invalid note visibility." }, { status: 400 });
    }

    const newNote = await createNote({
      userId,
      authorEmail: userId,
      title: body.title,
      content: body.content ?? "",
      category: body.category || "General",
      visibility: body.visibility || "private",
      isPinned: body.isPinned ?? false,
    });

    return NextResponse.json({ note: newNote }, { status: 201 });
  } catch (error) {
    console.error("POST /api/notes error:", error);
    const status = error instanceof NoteStorageError ? 503 : 500;
    const message = error instanceof NoteStorageError
      ? error.message
      : "Failed to create note. Please try again.";
    return NextResponse.json({ error: message }, { status });
  }
}
