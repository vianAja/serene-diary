import { NextResponse } from "next/server";
import { getAuthorizedUserId } from "@/lib/authorized-user";
import { loadDailyEntries, upsertChecklistEntry } from "@/lib/daily-checklist";

// GET /api/checklist/[date] — returns map of { [entryId]: completed }
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ date: string }> },
) {
  const userId = await getAuthorizedUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { date } = await params;
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ error: "Invalid date format" }, { status: 400 });
  }

  const entries = await loadDailyEntries(userId, date);
  return NextResponse.json({ entries });
}

// PATCH /api/checklist/[date] — toggle a single checklist entry
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ date: string }> },
) {
  const userId = await getAuthorizedUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { date } = await params;
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ error: "Invalid date format" }, { status: 400 });
  }

  const body = (await request.json()) as {
    id?: string;
    label?: string;
    category?: string;
    description?: string;
    window?: string;
    position?: number;
    completed?: boolean;
  };

  if (!body.id || body.completed === undefined) {
    return NextResponse.json(
      { error: "id and completed are required" },
      { status: 400 },
    );
  }

  await upsertChecklistEntry(
    userId,
    date,
    body.id,
    body.label ?? "",
    body.category ?? "",
    body.description ?? "",
    body.window ?? "",
    body.position ?? 0,
    body.completed,
  );

  return NextResponse.json({ ok: true });
}
