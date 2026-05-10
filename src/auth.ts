import type { NextAuthOptions } from "next-auth";
import Google from "next-auth/providers/google";

const allowedEmail = (process.env.ALLOWED_EMAIL ?? "").toLowerCase();

export const authOptions: NextAuthOptions = {
  secret: process.env.AUTH_SECRET,
  pages: {
    signIn: "/sign-in",
    error: "/sign-in",
  },
  session: {
    strategy: "jwt",
  },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
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

      if (email !== allowedEmail) {
        return "/sign-in?error=AccessDenied";
      }

      return true;
    },
  },
};
