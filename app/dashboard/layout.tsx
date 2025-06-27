// app/dashboard/layout.tsx
"use client"; // Provider ve interaktif bileşenleri barındırdığı için Client Component

import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarProvider } from "@/components/ui/sidebar"; // Doğru provider'ı import ediyoruz

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // SidebarProvider, hem AppSidebar'ın hem de SiteHeader'ın (ve içindeki trigger'ın)
    // aynı durumu (küçük/büyük) paylaşmasını sağlar.
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        {/* Sol taraftaki sabit kenar çubuğu */}
        <AppSidebar />

        <div className="flex flex-1 flex-col">
          {/* Üstteki sabit başlık çubuğu */}
          <SiteHeader />

          {/* Değişken sayfa içeriği buraya gelir */}
          <main className="flex-1 p-4 md:p-6 lg:p-10">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}
