import { and, asc, eq } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { allowedUsers } from "@/lib/db/schema";

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export async function ensureDefaultAllowedEmail() {
  const db = getDb();
  const defaultEmail = normalizeEmail(process.env.ALLOWED_EMAIL ?? "");

  if (!db || !defaultEmail) {
    return;
  }

  const existing = await db
    .select()
    .from(allowedUsers)
    .where(eq(allowedUsers.email, defaultEmail))
    .limit(1);

  if (existing.length > 0) {
    return;
  }

  const now = new Date();
  await db.insert(allowedUsers).values({
    id: `allowed-${crypto.randomUUID()}`,
    email: defaultEmail,
    isActive: true,
    createdAt: now,
    updatedAt: now,
  });
}

export async function isEmailAllowed(email: string) {
  const targetEmail = normalizeEmail(email);
  const db = getDb();
  const defaultEmail = normalizeEmail(process.env.ALLOWED_EMAIL ?? "");

  if (!targetEmail) {
    return false;
  }

  if (!db) {
    return targetEmail === defaultEmail;
  }

  await ensureDefaultAllowedEmail();

  const match = await db
    .select()
    .from(allowedUsers)
    .where(and(eq(allowedUsers.email, targetEmail), eq(allowedUsers.isActive, true)))
    .limit(1);

  return match.length > 0;
}

export async function listAllowedUsers() {
  const db = getDb();
  const defaultEmail = normalizeEmail(process.env.ALLOWED_EMAIL ?? "");

  if (!db) {
    return defaultEmail
      ? [
          {
            id: "allowed-default",
            email: defaultEmail,
            isActive: true,
          },
        ]
      : [];
  }

  await ensureDefaultAllowedEmail();

  return db
    .select({
      id: allowedUsers.id,
      email: allowedUsers.email,
      isActive: allowedUsers.isActive,
    })
    .from(allowedUsers)
    .orderBy(asc(allowedUsers.email));
}

export async function addAllowedUser(email: string) {
  const db = getDb();

  if (!db) {
    return listAllowedUsers();
  }

  const normalizedEmail = normalizeEmail(email);

  if (!normalizedEmail) {
    return listAllowedUsers();
  }

  const now = new Date();
  const existing = await db
    .select()
    .from(allowedUsers)
    .where(eq(allowedUsers.email, normalizedEmail))
    .limit(1);

  if (existing.length > 0) {
    await db
      .update(allowedUsers)
      .set({ isActive: true, updatedAt: now })
      .where(eq(allowedUsers.id, existing[0].id));
  } else {
    await db.insert(allowedUsers).values({
      id: `allowed-${crypto.randomUUID()}`,
      email: normalizedEmail,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });
  }

  return listAllowedUsers();
}

export async function setAllowedUserActive(id: string, isActive: boolean) {
  const db = getDb();

  if (!db) {
    return listAllowedUsers();
  }

  await db
    .update(allowedUsers)
    .set({ isActive, updatedAt: new Date() })
    .where(eq(allowedUsers.id, id));

  return listAllowedUsers();
}
