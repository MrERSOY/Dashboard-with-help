// app/api/auth/[...nextauth]/route.ts

import NextAuth, { NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import prisma from "@/lib/prisma";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { Adapter } from "next-auth/adapters";
import { User, UserRole } from "@prisma/client"; // UserRole enum'unu import et

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as Adapter,
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: { email: {}, password: {} },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Eksik bilgi.");
        }
        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });
        if (!user || !user.password) {
          throw new Error("Kullanıcı bulunamadı.");
        }
        const isPasswordCorrect = await bcrypt.compare(
          credentials.password,
          user.password
        );
        if (!isPasswordCorrect) {
          throw new Error("Hatalı şifre.");
        }
        return user;
      },
    }),
  ],
  session: { strategy: "jwt" },
  callbacks: {
    // JWT oluşturulduğunda veya güncellendiğinde çalışır.
    async jwt({ token, user }) {
      // Giriş yapıldığında, 'user' nesnesi veritabanından gelir.
      // Bu bilgileri token'a aktarıyoruz.
      if (user) {
        token.id = user.id;
        token.role = (user as User).role;
      }
      return token;
    },

    // DÜZELTME: session nesnesini yeniden yapılandırarak döndürüyoruz.
    // Bu, TypeScript'in user nesnesinin yeni yapısını anlamasını sağlar.
    async session({ session, token }) {
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
  pages: { signIn: "/login" },
  secret: process.env.NEXTAUTH_SECRET,
};

// NextAuth'u başlat
const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
