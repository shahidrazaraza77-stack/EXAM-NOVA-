import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const response = NextResponse.json({ success: true, message: "Auth state reset successfully" });
  
  // Clear all auth cookies
  response.cookies.delete("examnova-session");
  response.cookies.delete("examnova-role");
  
  // Clear any Supabase cookies matching sb-*
  req.cookies.getAll().forEach((cookie) => {
    if (cookie.name.startsWith("sb-") || cookie.name.includes("auth-token")) {
      response.cookies.delete(cookie.name);
    }
  });

  return response;
}

export async function GET(req: NextRequest) {
  const url = new URL("/login?reset=true", req.url);
  const response = NextResponse.redirect(url);
  
  // Clear all auth cookies
  response.cookies.delete("examnova-session");
  response.cookies.delete("examnova-role");
  
  req.cookies.getAll().forEach((cookie) => {
    if (cookie.name.startsWith("sb-") || cookie.name.includes("auth-token")) {
      response.cookies.delete(cookie.name);
    }
  });

  return response;
}
