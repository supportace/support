import { type NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { isDevelopmentEnvironment } from "./lib/constants";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/ping")) {
    return new Response("pong", { status: 200 });
  }

  if (pathname.startsWith("/api/auth")) {
    return NextResponse.next();
  }

  const token = await getToken({
    req: request,
    secret: process.env.AUTH_SECRET,
    secureCookie: !isDevelopmentEnvironment,
  });

  const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

  // Niet ingelogd → naar /login (behalve /login zelf en /api routes)
  if (!token) {
    if (pathname === `${base}/login` || pathname.startsWith("/api/")) {
      return NextResponse.next();
    }
    return NextResponse.redirect(new URL(`${base}/login`, request.url));
  }

  // Ingelogd → niet naar /login of /register
  if ([`${base}/login`, `${base}/register`, "/login", "/register"].includes(pathname)) {
    return NextResponse.redirect(new URL(`${base}/`, request.url));
  }

  // /register → altijd naar /login
  if (pathname.startsWith("/register")) {
    return NextResponse.redirect(new URL(`${base}/login`, request.url));
  }

  // /admin → alleen voor admins
  if (pathname.startsWith("/admin")) {
    const role = (token as { role?: string }).role;
    if (role !== "admin") {
      return NextResponse.redirect(new URL(`${base}/`, request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/chat/:id",
    "/admin/:path*",
    "/login",
    "/register",
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
