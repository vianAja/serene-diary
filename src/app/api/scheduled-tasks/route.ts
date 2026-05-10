import { NextResponse } from "next/server";
import { getAuthorizedUserId } from "@/lib/authorized-user";
import {
  createScheduledTask,
  deleteScheduledTask,
  getScheduledTasksByDate,
} from "@/lib/scheduled-tasks";

export async function GET(request: Request) {
  const userId = await getAuthorizedUserId();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const taskDate = searchParams.get("date");

  if (!taskDate) {
    return NextResponse.json({ tasks: [] });
  }

  const tasks = await getScheduledTasksByDate(taskDate, userId);
  return NextResponse.json({ tasks });
}

export async function POST(request: Request) {
  const userId = await getAuthorizedUserId();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as {
    title?: string;
    description?: string;
    category?: string;
    taskDate?: string;
    window?: string;
  };

  if (!body.title?.trim() || !body.taskDate?.trim()) {
    return NextResponse.json(
      { error: "Title and date are required." },
      { status: 400 },
    );
  }

  const tasks = await createScheduledTask(
    {
      title: body.title,
      description: body.description ?? "",
      category: body.category,
      taskDate: body.taskDate,
      window: body.window,
    },
    userId,
  );

  return NextResponse.json({ tasks }, { status: 201 });
}

export async function DELETE(request: Request) {
  const userId = await getAuthorizedUserId();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Task id is required." }, { status: 400 });
  }

  await deleteScheduledTask(id, userId);
  return NextResponse.json({ ok: true });
}
