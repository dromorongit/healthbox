import { NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  const token = request.cookies.get("adminToken")?.value ?? request.headers.get("authorization")?.split(" ")[1];

  const isLoginPage = request.nextUrl.pathname.startsWith("/login");
  const isRegisterPage = request.nextUrl.pathname.startsWith("/register");
  const isApiRoute = request.nextUrl.pathname.startsWith("/api");

  if (isLoginPage || isRegisterPage || isApiRoute) {
    return NextResponse.next();
  }

  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};