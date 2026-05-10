import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";

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
      email: "Belum login",
      initials: "GU",
      authLabel: "Belum login",
      authDescription: "Akses akan terbuka setelah Google SSO berhasil.",
      avatarUrl: null,
      signedIn: false,
    };
  }

  const displayName = session.user.name || session.user.email || "Authenticated User";
  const email = session.user.email || "Email tidak tersedia";

  return {
    name: displayName,
    email,
    initials: getInitials(displayName),
    authLabel: "Google SSO",
    authDescription:
      email.toLowerCase() === (process.env.ALLOWED_EMAIL ?? "").toLowerCase()
        ? "Akses diizinkan oleh allowlist email."
        : "Email tidak ada di allowlist.",
    avatarUrl: session.user.image ?? null,
    signedIn: true,
  };
}
