import { NextResponse } from "next/server";
import { getSignedInUserEmail } from "@/lib/authorized-user";
import {
  deleteNote,
  getNoteById,
  isNoteVisibility,
  NoteStorageError,
  updateNote,
  type NoteAccessResult,
  type NoteVisibility,
} from "@/lib/notes";

export async function GET(
  _request: Request,
  props: { params: Promise<{ id: string }> },
) {
  const { id } = await props.params;
  const userId = await getSignedInUserEmail();
  let result: NoteAccessResult;
  try {
    result = await getNoteById(id, userId);
  } catch (error) {
    if (error instanceof NoteStorageError) {
      return NextResponse.json({ error: error.message }, { status: 503 });
    }
    throw error;
  }

  if (!result.canView || !result.note) {
    return NextResponse.json(
      { error: "Note not found or access denied." },
      { status: result.role === "unauthorized" ? 403 : 404 },
    );
  }

  return NextResponse.json({
    note: result.note,
    canEdit: result.canEdit,
    role: result.role,
  });
}

export async function PUT(
  request: Request,
  props: { params: Promise<{ id: string }> },
) {
  const { id } = await props.params;
  const userId = await getSignedInUserEmail();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = (await request.json()) as {
      title?: string;
      content?: string;
      category?: string;
      visibility?: NoteVisibility;
      isPinned?: boolean;
    };

    if (body.visibility !== undefined && !isNoteVisibility(body.visibility)) {
      return NextResponse.json({ error: "Invalid note visibility." }, { status: 400 });
    }

    const updated = await updateNote(id, body, userId);
    return NextResponse.json({ note: updated });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to update note";
    const status = error instanceof NoteStorageError ? 503 : message.startsWith("Forbidden:") ? 403 : 404;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function DELETE(
  _request: Request,
  props: { params: Promise<{ id: string }> },
) {
  const { id } = await props.params;
  const userId = await getSignedInUserEmail();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await deleteNote(id, userId);
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to delete note";
    const status = error instanceof NoteStorageError ? 503 : message.startsWith("Forbidden:") ? 403 : 404;
    return NextResponse.json({ error: message }, { status });
  }
}
