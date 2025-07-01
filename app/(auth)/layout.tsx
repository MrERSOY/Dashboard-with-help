// app/(auth)/layout.tsx

import React from "react";

// Bu layout, tüm kimlik doğrulama sayfalarını (Giriş, Kayıt vb.)
// dikey ve yatay olarak ekranın tam ortasında göstermek için ortak bir yapı sağlar.
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // DÜZELTME: `min-h-screen` kullanarak layout'un her zaman en az
    // ekran yüksekliğinde olmasını sağlıyoruz. Bu, `h-full`'dan daha
    // güvenilir bir ortalama yöntemi sunar.
    <div className="flex min-h-screen w-full items-center justify-center bg-muted/40 p-4">
      {children}
    </div>
  );
}
