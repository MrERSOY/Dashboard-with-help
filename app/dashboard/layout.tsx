// app/dashboard/layout.tsx
"use client";

import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarProvider } from "@/components/ui/sidebar";

// Bu layout, tüm yönetici paneli sayfalarını sarmalar.
// Sol tarafta bir kenar çubuğu ve üstte bir başlık alanı oluşturur.
export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        {/* Sol taraftaki, daraltılıp genişletilebilen kenar çubuğu */}
        <AppSidebar />

        {/* Ana içerik alanı */}
        <div className="flex flex-1 flex-col">
          {/* Üstteki sabit başlık çubuğu */}
          <SiteHeader />

          {/* Değişken sayfa içeriği (children), bu alana yerleştirilir */}
          <main className="flex-1 p-4 md:p-6 lg:p-10">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}
