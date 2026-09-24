import { NextResponse } from "next/server";
import { getAuthorizedUserId } from "@/lib/authorized-user";
import {
  deleteTemplate,
  toggleTemplateActive,
  updateTemplate,
} from "@/lib/template-library";

type RouteContext = {
  params: Promise<{
    templateId: string;
  }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const userId = await getAuthorizedUserId();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { templateId } = await context.params;
    const body = (await request.json()) as {
      name?: string;
      description?: string;
      active?: boolean;
    };

    let templates;

    if (typeof body.active === "boolean") {
      templates = await toggleTemplateActive(templateId, body.active, userId);
    } else if (body.name?.trim()) {
      templates = await updateTemplate(
        templateId,
        {
          name: body.name,
          description: body.description ?? "",
        },
        userId,
      );
    } else {
      return NextResponse.json(
        { error: "No supported update payload was provided." },
        { status: 400 },
      );
    }

    return NextResponse.json({ templates });
  } catch (error) {
    console.error("PATCH /api/templates/[templateId] error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update template" },
      { status: 500 },
    );
  }
}

export async function DELETE(_: Request, context: RouteContext) {
  try {
    const userId = await getAuthorizedUserId();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { templateId } = await context.params;
    const templates = await deleteTemplate(templateId, userId);

    return NextResponse.json({ templates });
  } catch (error) {
    console.error("DELETE /api/templates/[templateId] error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to delete template" },
      { status: 500 },
    );
  }
}
