// app/layout.tsx
import type { Metadata } from "next";
import "./globals.css"; // globals.css dosyanızın burada import edildiğini varsayıyorum.

// Eğer Geist fontlarını kullanmıyorsanız, bu import satırları da kaldırılabilir.
// import { GeistSans } from "geist/font/sans";
// import { GeistMono } from "geist/font/mono";

export const metadata: Metadata = {
  // META_THEME_COLORS değişkeni kaldırıldığı için burayı doğrudan doldurabilirsiniz
  // veya temanızla ilgili ayarları buradan silebilirsiniz.
  title: "Dashboard Uygulaması",
  description: "Next.js ile oluşturuldu",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      {/* Kullanılmayan `geistSans.variable` ve `geistMono.variable` 
        değişkenleri body'nin className'inden kaldırıldı.
      */}
      <body className="antialiased">{children}</body>
    </html>
  );
}
