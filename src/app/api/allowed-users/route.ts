import { NextResponse } from "next/server";
import {
  addAllowedUser,
  listAllowedUsers,
  setAllowedUserActive,
} from "@/lib/allowed-users";
import { getAuthorizedUserId } from "@/lib/authorized-user";

export async function GET() {
  const userId = await getAuthorizedUserId();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const users = await listAllowedUsers();
  return NextResponse.json({ users });
}

export async function POST(request: Request) {
  const userId = await getAuthorizedUserId();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as { email?: string };

  if (!body.email?.trim()) {
    return NextResponse.json({ error: "Email is required." }, { status: 400 });
  }

  const users = await addAllowedUser(body.email);
  return NextResponse.json({ users }, { status: 201 });
}

export async function PATCH(request: Request) {
  const userId = await getAuthorizedUserId();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as { id?: string; isActive?: boolean };

  if (!body.id || typeof body.isActive !== "boolean") {
    return NextResponse.json(
      { error: "id and isActive are required." },
      { status: 400 },
    );
  }

  const users = await setAllowedUserActive(body.id, body.isActive);
  return NextResponse.json({ users });
}
