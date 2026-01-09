import { NextRequest, NextResponse } from "next/server";
import { neonAuth } from "@neondatabase/auth/next/server";

const PUBLIC_PREFIXES = [
  "/auth",          // neon auth UI pages
  "/api",           // allow API (adjust if you want to protect some)
  "/_next",
  "/favicon.ico",
  "/robots.txt",
  "/sitemap.xml",
];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Skip public paths
  if (PUBLIC_PREFIXES.some((p) => pathname === p || pathname.startsWith(p + "/"))) {
    return NextResponse.next();
  }

  // If already signed in and they visit sign-in, send them home
  if (pathname === "/auth/sign-in") {
    const { user } = await neonAuth();
    if (user) {
      const url = req.nextUrl.clone();
      url.pathname = "/";
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  // Protect everything else
  const { user } = await neonAuth();
  if (!user) {
    const url = req.nextUrl.clone();
    url.pathname = "/auth/sign-in";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image).*)"],
};