import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

const publicRoutes = ["/sign-in", "/login", "/auth/google/callback"];

export default async function proxy(request: NextRequest) {
  const { nextUrl } = request;
  const pathname = nextUrl.pathname;

  const isPublicRoute =
    publicRoutes.some((route) => pathname.startsWith(route)) ||
    pathname.startsWith("/api/auth");

  if (isPublicRoute) {
    return NextResponse.next();
  }

  const token = await getToken({
    req: request,
    secret: process.env.AUTH_SECRET,
  });

  if (!token?.email) {
    return NextResponse.redirect(new URL("/sign-in", nextUrl));
  }

  const email = token.email.toLowerCase();
  const allowedEmail = (process.env.ALLOWED_EMAIL ?? "").toLowerCase();

  if (!email || email !== allowedEmail) {
    return NextResponse.redirect(new URL("/sign-in?error=AccessDenied", nextUrl));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|png|gif|svg|ttf|woff2?|ico|json|csv|zip)).*)",
    "/(api|trpc)(.*)",
  ],
};
