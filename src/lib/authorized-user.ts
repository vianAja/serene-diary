import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";

export async function getAuthorizedUserId() {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email?.toLowerCase();
  const allowedEmail = (process.env.ALLOWED_EMAIL ?? "").toLowerCase();

  if (!email || email !== allowedEmail) {
    return null;
  }

  return email;
}
