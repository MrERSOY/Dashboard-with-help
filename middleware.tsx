// middleware.ts
export { default } from "next-auth/middleware";

// Bu config, middleware'in hangi yollarda çalışacağını belirtir.
export const config = {
  // :path* ifadesi, /dashboard'dan sonra gelen tüm alt yolları kapsar.
  // Örneğin: /dashboard, /dashboard/products, /dashboard/team/settings vb.
  matcher: ["/dashboard/:path*"],
};
