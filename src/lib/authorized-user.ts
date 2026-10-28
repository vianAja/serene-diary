import { getServerSession } from "next-auth";
import { unstable_rethrow } from "next/navigation";
import { authOptions } from "@/auth";
import { isEmailAllowed } from "@/lib/allowed-users";

export async function getAuthorizedUserId(): Promise<string | null> {
  try {
    const session = await getServerSession(authOptions);
    const email = session?.user?.email?.toLowerCase();
    if (!email || !(await isEmailAllowed(email))) {
      return null;
    }

    return email;
  } catch (error) {
    unstable_rethrow(error);
    console.error("Failed to retrieve session in getAuthorizedUserId:", error);
  }

  return null;
}

/** Returns an identity only when the request has a valid, allow-listed session. */
export async function getSignedInUserEmail(): Promise<string | null> {
  try {
    const session = await getServerSession(authOptions);
    const email = session?.user?.email?.trim().toLowerCase();

    if (email && (await isEmailAllowed(email))) {
      return email;
    }
  } catch (error) {
    console.error("Failed to retrieve signed-in user for notes:", error);
  }

  return null;
}
