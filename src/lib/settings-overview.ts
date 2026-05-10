import { countDistinct, gte } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { checklistTemplates } from "@/lib/db/schema";
import { getViewerProfile } from "@/lib/viewer-profile";
import { listAllowedUsers } from "@/lib/allowed-users";

export async function getSettingsOverview() {
  const profile = await getViewerProfile();
  const db = getDb();

  if (!db) {
    const allowedUsers = await listAllowedUsers();
    return {
      profile,
      totalUsers: 1,
      activeUsers: profile.signedIn ? 1 : 0,
      allowedUsers,
    };
  }

  const allUsers = await db
    .select({
      value: countDistinct(checklistTemplates.userId),
    })
    .from(checklistTemplates);

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const activeUsers = await db
    .select({
      value: countDistinct(checklistTemplates.userId),
    })
    .from(checklistTemplates)
    .where(gte(checklistTemplates.updatedAt, sevenDaysAgo));

  const allowedUsers = await listAllowedUsers();

  return {
    profile,
    totalUsers: allUsers[0]?.value ?? 0,
    activeUsers: activeUsers[0]?.value ?? 0,
    allowedUsers,
  };
}
