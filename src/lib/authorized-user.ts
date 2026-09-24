import { getServerSession } from "next-auth";
import { unstable_rethrow } from "next/navigation";
import { authOptions } from "@/auth";
import { isEmailAllowed } from "@/lib/allowed-users";

export async function getAuthorizedUserId() {
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
    return null;
  }
}
