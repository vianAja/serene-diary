import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { isEmailAllowed } from "@/lib/allowed-users";

export type ViewerProfile = {
  name: string;
  email: string;
  initials: string;
  authLabel: string;
  authDescription: string;
  avatarUrl: string | null;
  signedIn: boolean;
};

function getInitials(name: string) {
  return (
    name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? "")
      .join("") || "SD"
  );
}

export async function getViewerProfile(): Promise<ViewerProfile> {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return {
      name: "Guest User",
      email: "Not signed in",
      initials: "GU",
      authLabel: "Signed out",
      authDescription: "Access becomes available after a successful Google SSO sign-in.",
      avatarUrl: null,
      signedIn: false,
    };
  }

  const displayName = session.user.name || session.user.email || "Authenticated User";
  const email = session.user.email || "Email unavailable";
  const allowed = email === "Email unavailable" ? false : await isEmailAllowed(email);

  return {
    name: displayName,
    email,
    initials: getInitials(displayName),
    authLabel: "Google SSO",
    authDescription:
      allowed
        ? "Access granted through the approved email allowlist."
        : "This email is not included in the approved allowlist.",
    avatarUrl: session.user.image ?? null,
    signedIn: true,
  };
}
