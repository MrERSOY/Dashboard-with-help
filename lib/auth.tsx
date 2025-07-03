// lib/auth.ts

import { PrismaAdapter } from "@auth/prisma-adapter";
import { NextAuthOptions } from "next-auth";
import { Adapter } from "next-auth/adapters";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { User, UserRole } from "@prisma/client";

// authOptions nesnesi artık bu merkezi dosyadan export ediliyor.
export const authOptions: NextAuthOptions = {
  // Prisma'yı NextAuth için bir adaptör olarak kullanır.
  // Bu, kullanıcı ve oturum bilgilerini veritabanında saklamamızı sağlar.
  adapter: PrismaAdapter(prisma) as Adapter,

  // Kullanacağımız kimlik doğrulama yöntemlerini tanımlar.
  providers: [
    // E-posta ve şifre ile girişi sağlayan 'Credentials' provider'ı.
    CredentialsProvider({
      name: "Credentials",
      credentials: { email: {}, password: {} },
      // authorize fonksiyonu, giriş bilgileri gönderildiğinde çalışır.
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Eksik bilgi.");
        }

        // Kullanıcıyı e-posta adresine göre veritabanında bul.
        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        // Kullanıcı yoksa veya şifresi kayıtlı değilse hata döndür.
        if (!user || !user.password) {
          throw new Error("Kullanıcı bulunamadı.");
        }

        // Gönderilen şifre ile veritabanındaki şifreyi karşılaştır.
        const isPasswordCorrect = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isPasswordCorrect) {
          throw new Error("Hatalı şifre.");
        }

        // Her şey doğruysa, kullanıcı nesnesini döndür.
        return user;
      },
    }),
  ],

  // Oturum yönetimi stratejisi olarak JWT (JSON Web Token) kullan.
  session: { strategy: "jwt" },

  // Oturum ve token'lar üzerinde özel işlemler yapmak için callback'ler.
  callbacks: {
    // JWT oluşturulduğunda veya güncellendiğinde çalışır.
    async jwt({ token, user }) {
      // Kullanıcı ilk kez giriş yaptığında, 'user' nesnesi dolu gelir.
      // Bu bilgileri (id ve rol) token'a aktarıyoruz.
      if (user) {
        token.id = user.id;
        token.role = (user as User).role;
      }
      return token;
    },

    // İstemci tarafında oturum bilgisi istendiğinde çalışır.
    async session({ session, token }) {
      // Token'daki özel bilgileri (id ve rol) session.user nesnesine aktarıyoruz.
      // Bu sayede projenin her yerinde session.user.role gibi bilgilere erişebiliriz.
      return {
        ...session,
        user: {
          ...session.user,
          id: token.id as string,
          role: token.role as UserRole,
        },
      };
    },
  },

  // Giriş sayfasının yolunu belirtir.
  pages: {
    signIn: "/login",
  },

  // Oturumları şifrelemek için kullanılan gizli anahtar.
  // Bu, .env.local dosyasından çekilir.
  secret: process.env.NEXTAUTH_SECRET,
};
