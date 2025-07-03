// app/api/auth/[...nextauth]/route.tsx

import NextAuth from "next-auth";
// DÜZELTME: authOptions artık merkezi lib/auth.ts dosyasından import ediliyor.
import { authOptions } from "@/lib/auth";

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
