import type { NextAuthOptions } from "next-auth";
import Google from "next-auth/providers/google";
import { isEmailAllowed } from "@/lib/allowed-users";

export const authOptions: NextAuthOptions = {
  secret:
    process.env.AUTH_SECRET ||
    process.env.NEXTAUTH_SECRET ||
    "serene-diary-default-auth-secret-do-not-use-in-real-production",
  pages: {
    signIn: "/sign-in",
    error: "/sign-in",
  },
  session: {
    strategy: "jwt",
  },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID || "dummy-google-client-id",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "dummy-google-client-secret",
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
  ],
  callbacks: {
    async signIn({ user, profile }) {
      const email = user.email?.toLowerCase() ?? profile?.email?.toLowerCase();

      if (!email) {
        return "/sign-in?error=MissingEmail";
      }

      return true;
    },
    async jwt({ token, user, profile }) {
      const email =
        user?.email?.toLowerCase() ??
        (typeof token.email === "string" ? token.email.toLowerCase() : undefined) ??
        (typeof profile?.email === "string" ? profile.email.toLowerCase() : undefined);

      if (email) {
        token.email = email;
        token.isAllowed = await isEmailAllowed(email);
      } else {
        token.isAllowed = false;
      }

      return token;
    },
    async session({ session, token }) {
      session.user = {
        ...session.user,
        email: typeof token.email === "string" ? token.email : session.user?.email,
      };
      return session;
    },
  },
};
