import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const secret = new TextEncoder().encode(
  process.env.SESSION_SECRET ?? "ember-kitchen-demo-secret",
);

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!pathname.startsWith("/staff")) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/staff/login")) {
    return NextResponse.next();
  }

  const token = request.cookies.get("staff_session")?.value;
  if (!token) {
    return NextResponse.redirect(new URL("/staff/login", request.url));
  }

  try {
    const { payload } = await jwtVerify(token, secret);
    const role = payload.role as string;

    if (
      pathname.startsWith("/staff/manager") &&
      role !== "MANAGER" &&
      role !== "ADMIN"
    ) {
      return NextResponse.redirect(new URL("/staff/kitchen", request.url));
    }

    if (
      pathname.startsWith("/staff/kitchen") &&
      role !== "KITCHEN" &&
      role !== "MANAGER" &&
      role !== "ADMIN"
    ) {
      return NextResponse.redirect(new URL("/staff/login", request.url));
    }

    if (pathname.startsWith("/staff/admin") && role !== "ADMIN") {
      return NextResponse.redirect(new URL("/staff/manager", request.url));
    }

    return NextResponse.next();
  } catch {
    return NextResponse.redirect(new URL("/staff/login", request.url));
  }
}

export const config = {
  matcher: ["/staff/:path*"],
};
