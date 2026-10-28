import { getSignedInUserEmail } from "@/lib/authorized-user";
import { getNotesForUser, NoteStorageError } from "@/lib/notes";
import type { NoteItem } from "@/lib/notes";
import { NotesManager } from "@/components/notes-manager";

export const metadata = {
  title: "Notes & Reflections | SereneDiary",
  description: "Capture thoughts, project logs, or share public notes with secure RBAC and random URLs.",
};

export default async function NotesPage() {
  const userId = await getSignedInUserEmail();
  let initialNotes: NoteItem[];
  try {
    initialNotes = await getNotesForUser(userId);
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

  return <NotesManager initialNotes={initialNotes} currentUserEmail={userId} />;
}
