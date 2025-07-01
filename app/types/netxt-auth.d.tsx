// types/next-auth.d.ts

import { UserRole } from "@prisma/client";
import { DefaultSession } from "next-auth";

// next-auth modülünü genişleterek session.user nesnesine
// kendi özel alanlarımızı (id ve role) ekliyoruz.
declare module "next-auth" {
  /**
   * Sunucuda ve istemcide kullanılabilen Session nesnesi.
   */
  interface Session {
    user: {
      id: string;
      role: UserRole;
    } & DefaultSession["user"]; // name, email, image gibi varsayılan özellikleri koru
  }
}

// JWT token'ına da bu alanları eklemek için
declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: UserRole;
  }
}
