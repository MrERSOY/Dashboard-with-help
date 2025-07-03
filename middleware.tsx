// middleware.tsx

import { getToken } from "next-auth/jwt";
import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  async function middleware(req) {
    const token = await getToken({ req });
    const isAuth = !!token;
    const isAuthPage =
      req.nextUrl.pathname.startsWith("/login") ||
      req.nextUrl.pathname.startsWith("/register");

    const isDashboardPage = req.nextUrl.pathname.startsWith("/dashboard");

    // Eğer kullanıcı giriş/kayıt sayfasındaysa...
    if (isAuthPage) {
      // ve zaten giriş yapmışsa, dashboard'a yönlendir.
      if (isAuth) {
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }
      // Giriş yapmamışsa, sayfayı görmesine izin ver.
      return null;
    }

    // Eğer kullanıcı dashboard sayfalarından birine girmeye çalışıyorsa...
    if (isDashboardPage) {
      // ve giriş yapmamışsa, login sayfasına yönlendir.
      if (!isAuth) {
        return NextResponse.redirect(new URL("/login", req.url));
      }

      // Giriş yapmışsa, rolünü kontrol et.
      const userRole = token.role as string; // next-auth.d.ts sayesinde bu tip güvenli.

      // Eğer rolü ADMIN veya STAFF değilse...
      if (userRole !== "ADMIN" && userRole !== "STAFF") {
        // Yetkisiz erişim hatasıyla birlikte login sayfasına geri yönlendir.
        const url = new URL("/login", req.url);
        url.searchParams.set("error", "unauthorized");
        return NextResponse.redirect(url);
      }
    }

    // Diğer tüm durumlar için, devam et.
    return null;
  },
  {
    callbacks: {
      // Bu callback, middleware fonksiyonunun her zaman çalışmasını sağlar.
      // Asıl mantık yukarıdaki fonksiyonda işlenir.
      async authorized() {
        return true;
      },
    },
  }
);

// Middleware'in hangi sayfalarda çalışacağını belirtir.
export const config = {
  matcher: ["/dashboard/:path*", "/login", "/register"],
};
