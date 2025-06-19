// app/dashboard/layout.tsx
"use client"; // Etkileşimli Provider'ları barındırdığı için Client Component olmalı.

import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
// DOĞRU YOL: Provider'ı projenin orijinal sidebar dosyasından alıyoruz.
import { SidebarProvider } from "@/components/ui/sidebar";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // SidebarProvider, tüm layout'u sarmalayarak context'i sağlar.
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <AppSidebar />
        <div className="flex flex-1 flex-col">
          <SiteHeader />
          <main className="flex-1 p-4 md:p-6 lg:p-10">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}
