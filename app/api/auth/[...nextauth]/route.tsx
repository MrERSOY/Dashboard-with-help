// app/api/auth/[...nextauth]/route.ts
import NextAuth, { NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import prisma from "@/lib/prisma";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { Adapter } from "next-auth/adapters";

export const authOptions: NextAuthOptions = {
  // PrismaAdapter, NextAuth'un veritabanı işlemlerini (kullanıcı bulma, session kaydetme vb.)
  // otomatik olarak Prisma üzerinden yapmasını sağlar.
  adapter: PrismaAdapter(prisma) as Adapter,

  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Eksik bilgi girdiniz.");
        }

        // Kullanıcıyı e-posta adresine göre veritabanından bul
        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        // Kullanıcı yoksa veya şifresi kayıtlı değilse (örn: Google ile giriş yapmış) hata ver
        if (!user || !user.password) {
          throw new Error("Kullanıcı bulunamadı veya şifre ayarlanmamış.");
        }

        // Girilen şifre ile veritabanındaki hash'lenmiş şifreyi karşılaştır
        const isPasswordCorrect = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isPasswordCorrect) {
          throw new Error("Hatalı şifre.");
        }

        // Başarılı olursa, session için kullanıcı objesini döndür
        return user;
      },
    }),
  ],

  // Session yönetimi için JWT (JSON Web Token) stratejisini kullan
  session: {
    strategy: "jwt",
  },

  // JWT ve session'a ek bilgi eklemek için callbacks
  callbacks: {
    async jwt({ token, user }) {
      // Giriş yapıldığında, user objesindeki ID'yi token'a ekle
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      // Token'daki bilgileri session objesine ekle
      // Bu sayede client tarafında `useSession()` ile user.id'ye erişebiliriz
      if (session.user) {
        (session.user as any).id = token.id;
      }
      return session;
    },
  },

  // Özel giriş sayfamızın yolunu belirt
  pages: {
    signIn: "/login",
  },

  // .env.local dosyasındaki gizli anahtarı kullan
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
