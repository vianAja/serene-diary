import { NextResponse } from "next/server";
import { getAuthorizedUserId } from "@/lib/authorized-user";
import {
  createTemplate,
  getTemplateLibrary,
} from "@/lib/template-library";

export async function GET() {
  const userId = await getAuthorizedUserId();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const templates = await getTemplateLibrary(userId);
  return NextResponse.json({ templates });
}

export async function POST(request: Request) {
  const userId = await getAuthorizedUserId();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as {
    name?: string;
    description?: string;
  };

  if (!body.name?.trim()) {
    return NextResponse.json(
      { error: "Template name is required." },
      { status: 400 },
    );
  }

  const templates = await createTemplate(
    {
      name: body.name,
      description: body.description ?? "",
    },
    userId,
  );

  return NextResponse.json({ templates });
}
