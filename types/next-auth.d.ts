// types/next-auth.d.ts

import { UserRole } from "@prisma/client";
import { DefaultSession } from "next-auth";

// next-auth modülünü genişleterek session.user nesnesine
// kendi özel alanlarımızı (id ve role) ekliyoruz.
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: UserRole;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: UserRole;
  }
}
