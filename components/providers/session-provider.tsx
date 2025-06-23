// components/providers/session-provider.tsx
"use client";

import { SessionProvider } from "next-auth/react";
import { ReactNode } from "react";

interface NextAuthProviderProps {
  children: ReactNode;
}

// Bu bileşen, NextAuth'un SessionProvider'ını bir Client Component olarak sarmalar.
// Bu, App Router yapısında oturum bilgilerini client tarafında kullanabilmemiz için gereklidir.
export default function NextAuthProvider({ children }: NextAuthProviderProps) {
  return <SessionProvider>{children}</SessionProvider>;
}
