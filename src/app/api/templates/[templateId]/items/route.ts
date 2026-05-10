import { NextResponse } from "next/server";
import { getAuthorizedUserId } from "@/lib/authorized-user";
import { createTemplateItem } from "@/lib/template-library";

type RouteContext = {
  params: Promise<{
    templateId: string;
  }>;
};

export async function POST(request: Request, context: RouteContext) {
  const userId = await getAuthorizedUserId();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { templateId } = await context.params;
  const body = (await request.json()) as {
    label?: string;
    description?: string;
  };

  if (!body.label?.trim()) {
    return NextResponse.json(
      { error: "Task title is required." },
      { status: 400 },
    );
  }

  const templates = await createTemplateItem(
    templateId,
    {
      label: body.label,
      description: body.description ?? "",
    },
    userId,
  );

  return NextResponse.json({ templates });
}
