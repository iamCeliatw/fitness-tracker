import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import authConfig from "@/auth.config";

const { auth } = NextAuth(authConfig);

const PUBLIC_ROUTES = ["/login", "/register"];
const ADMIN_PREFIX = "/admin";
const USER_PREFIX = "/dashboard";

export default auth((req) => {
  const { nextUrl, auth: session } = req;
  const isLoggedIn = !!session?.user;
  const isPublic = PUBLIC_ROUTES.includes(nextUrl.pathname);
  const isAdminRoute = nextUrl.pathname.startsWith(ADMIN_PREFIX);
  const isUserRoute = nextUrl.pathname.startsWith(USER_PREFIX);

  // 未登入 → 跳轉登入頁
  if (!isLoggedIn && !isPublic) {
    return NextResponse.redirect(new URL("/login", nextUrl));
  }

  // 已登入訪問公開頁 → 依 role 導向
  if (isLoggedIn && isPublic) {
    const dest = session.user.role === "ADMIN" ? "/admin" : "/dashboard";
    return NextResponse.redirect(new URL(dest, nextUrl));
  }

  // 非 ADMIN 訪問後台 → 403
  if (isAdminRoute && session?.user?.role !== "ADMIN") {
    return NextResponse.redirect(new URL("/dashboard", nextUrl));
  }

  // ADMIN 訪問前台 → 導向後台
  if (isUserRoute && session?.user?.role === "ADMIN") {
    return NextResponse.redirect(new URL("/admin", nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
