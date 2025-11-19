import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const roleRequired: Record<string, Array<"owner" | "manager" | "rep">> = {
  "/api/crm/push": ["owner", "manager"],
  "/api/leads/enrich": ["owner", "manager", "rep"],
  "/api/leads/score": ["owner", "manager", "rep"],
  "/api/leads/search": ["owner", "manager", "rep"],
  "/api/outreach": ["owner", "manager", "rep"],
  "/api/chat": ["owner", "manager", "rep"],
};

export function middleware(request: NextRequest) {
  const role = (request.headers.get("x-team-role") as "owner" | "manager" | "rep" | null) ?? "owner";
  const pathname = request.nextUrl.pathname;
  const allowedRoles = Object.entries(roleRequired).find(([route]) => pathname.startsWith(route))?.[1];
  if (allowedRoles && !allowedRoles.includes(role)) {
    return NextResponse.json({ error: "Insufficient role" }, { status: 403 });
  }
  const response = NextResponse.next();
  response.headers.set("x-leadly-role", role);
  return response;
}

export const config = {
  matcher: "/api/:path*",
};
