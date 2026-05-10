import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { isEmailAllowed } from "@/lib/allowed-users";

export async function getAuthorizedUserId() {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email?.toLowerCase();
  if (!email || !(await isEmailAllowed(email))) {
    return null;
  }

  return email;
}
