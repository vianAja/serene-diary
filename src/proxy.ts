import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

const publicRoutes = ["/sign-in", "/login", "/auth/google/callback"];

export async function proxy(request: NextRequest) {
  const { nextUrl } = request;
  const pathname = nextUrl.pathname;

  const secret =
    process.env.AUTH_SECRET ||
    process.env.NEXTAUTH_SECRET ||
    "serene-diary-default-auth-secret-do-not-use-in-real-production";

  let token = null;
  try {
    token = await getToken({
      req: request,
      secret,
    });
  } catch (error) {
    console.error("proxy getToken error:", error);
  }

  const isAuthPage = pathname === "/sign-in" || pathname === "/login";

  if (isAuthPage) {
    if (token?.email) {
      return NextResponse.redirect(new URL("/dashboard", nextUrl));
    }
    return NextResponse.next();
  }

  const isPublicRoute =
    publicRoutes.some((route) => pathname.startsWith(route)) ||
    pathname.startsWith("/api/auth");

  if (isPublicRoute) {
    return NextResponse.next();
  }

  if (!token?.email) {
    return NextResponse.redirect(new URL("/sign-in", nextUrl));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|png|gif|svg|ttf|woff2?|ico|json|csv|zip)).*)",
    "/(api|trpc)(.*)",
  ],
};
