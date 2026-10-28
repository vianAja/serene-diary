import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, Lock } from "lucide-react";
import { getSignedInUserEmail } from "@/lib/authorized-user";
import { getNoteById, NoteStorageError } from "@/lib/notes";
import type { NoteAccessResult } from "@/lib/notes";
import { NoteViewOrEdit } from "@/components/note-view-or-edit";

export async function generateMetadata(props: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await props.params;
  const userId = await getSignedInUserEmail();
  try {
    const { note } = await getNoteById(id, userId);

    if (!note) {
      return { title: "Note Not Found | SereneDiary" };
    }

    return {
      title: `${note.title} | SereneDiary Notes`,
      description: note.content.slice(0, 150) || "Read this note on SereneDiary.",
    };
  } catch (error) {
    if (error instanceof NoteStorageError) {
      return { title: "Notes temporarily unavailable | SereneDiary" };
    }
    throw error;
  }
}

export default async function NoteDetailPage(props: {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ edit?: string }>;
}) {
  const { id } = await props.params;
  const searchParams = props.searchParams ? await props.searchParams : {};
  const isEditing = searchParams.edit === "true";

  const userId = await getSignedInUserEmail();
  let result: NoteAccessResult;
  try {
    result = await getNoteById(id, userId);
  } catch (error) {
    if (error instanceof NoteStorageError) {
      return (
        <div role="alert" className="mx-auto max-w-2xl rounded-2xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-950">
          {error.message}
        </div>
      );
    }
    throw error;
  }
  const { note, canEdit, canView, role } = result;

  if (!note && role === "unauthorized" && !userId) {
    redirect(`/sign-in?callbackUrl=/notes/${id}`);
  }

  if (!note || !canView) {
    return (
      <div className="mx-auto max-w-2xl py-12 text-center">
        <div className="surface-card rounded-2xl p-8 shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
            <Lock className="h-7 w-7" />
          </div>
          <h2 className="mt-4 text-xl font-bold text-foreground">Access Restricted</h2>
          <p className="mt-2 text-sm text-muted">
            This note is private or only accessible to authorized workspace members.
          </p>
          <div className="mt-6 flex items-center justify-center gap-3">
            <Link
              href="/notes"
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary/90"
            >
              <ArrowLeft className="h-4 w-4" /> Back to Notes
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <NoteViewOrEdit
      initialNote={note}
      canEdit={canEdit}
      currentUserEmail={userId}
      initialEditing={isEditing}
    />
  );
}
