import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Retrieve auth cookies
  const sessionToken = request.cookies.get("examnova-session")?.value;
  const userRole = request.cookies.get("examnova-role")?.value;

  // Check both explicit examnova-session and Supabase standard cookies
  const allCookies = request.cookies.getAll();
  const hasSupabaseCookie = allCookies.some(
    (c) => c.name.startsWith("sb-") && !!c.value && c.value !== '""' && c.value !== "undefined"
  );

  const isAuthenticated = (!!sessionToken && sessionToken !== '""' && sessionToken !== "undefined") || hasSupabaseCookie;

  // Auth/Protected route checks
  const isDashboardRoute = pathname.startsWith("/dashboard");
  const isAdminRoute = pathname.startsWith("/admin");
  const isAuthRoute = 
    pathname.startsWith("/login") || 
    pathname.startsWith("/signup") || 
    pathname.startsWith("/register") || 
    pathname.startsWith("/forgot-password") || 
    pathname.startsWith("/reset-password");

  // 1. Redirect to login if accessing protected route without session
  if ((isDashboardRoute || isAdminRoute) && !isAuthenticated) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Note: We intentionally do NOT redirect authenticated users away from /login or /signup.
  // Users must be able to sign in with a different Google account or switch accounts.

  // 3. Role-based routing controls
  if (isAuthenticated) {
    // Admin routes restriction (only admins & content_managers)
    if (isAdminRoute && userRole !== "admin" && userRole !== "content_manager") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    // Recruiter routes restriction (only recruiters)
    const isRecruiterRoute = pathname.startsWith("/dashboard/recruiter");
    if (isRecruiterRoute && userRole !== "recruiter") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/admin/:path*",
    "/mfa-verify",
    "/login",
    "/signup",
    "/register",
    "/forgot-password",
    "/reset-password"
  ],
};
