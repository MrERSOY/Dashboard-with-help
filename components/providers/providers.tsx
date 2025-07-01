// components/providers/providers.tsx
"use client";

import { ThemeProvider } from "@/components/providers/theme-provider";
import { ActiveThemeProvider } from "@/components/active-theme";
import NextAuthProvider from "@/components/providers/session-provider";
import { SidebarProvider } from "@/components/ui/sidebar";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    // Tüm provider'ları burada iç içe yerleştiriyoruz.
    // Sıralama önemlidir.
    <NextAuthProvider>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <ActiveThemeProvider>
          <SidebarProvider>{children}</SidebarProvider>
        </ActiveThemeProvider>
      </ThemeProvider>
    </NextAuthProvider>
  );
}
