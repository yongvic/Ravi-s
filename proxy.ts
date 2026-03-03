import { auth } from "@/auth";

export const proxy = auth((req) => {
  const isLoggedIn = !!req.auth;
  const isPublicRoute =
    req.nextUrl.pathname.startsWith("/auth") ||
    req.nextUrl.pathname === "/" ||
    req.nextUrl.pathname === "/about" ||
    req.nextUrl.pathname === "/pricing" ||
    req.nextUrl.pathname.startsWith("/api/auth") ||
    req.nextUrl.pathname.startsWith("/_next") ||
    req.nextUrl.pathname.startsWith("/favicon");

  if (!isLoggedIn && !isPublicRoute) {
    return Response.redirect(new URL("/auth/signin", req.nextUrl.origin));
  }

  return null;
});

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};

