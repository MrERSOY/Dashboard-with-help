// app/dashboard/layout.tsx
import { AppSidebar } from "@/components/app-sidebar"; // 'ui' klasörü olmadan import yolu düzeltildi
import { SiteHeader } from "@/components/site-header"; // Header bileşeninizin yolu
import { SidebarProvider } from "@/components/providers/sidebar-provider"; // Gerekli provider import edildi

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // Sidebar ve Header'ı SidebarProvider ile sarmalıyoruz
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-gray-100 dark:bg-background">
        {/* 1. Sabit Sidebar */}
        <AppSidebar />

        {/* 2. Ana İçerik Alanı */}
        <div className="flex flex-1 flex-col">
          {/* 3. Sabit Header */}
          <SiteHeader />

          {/* 4. Değişken Sayfa İçeriği */}
          <main className="flex-1 p-4 md:p-8 lg:p-10">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}
