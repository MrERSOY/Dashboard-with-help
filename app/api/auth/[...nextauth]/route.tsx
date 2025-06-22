// app/api/auth/[...nextauth]/route.ts
import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { MongoDBAdapter } from "@next-auth/mongodb-adapter";
import clientPromise from "@/lib/mongodb";
import { MongoClient } from "mongodb";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  adapter: MongoDBAdapter(clientPromise),

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

        const client: MongoClient = await clientPromise;
        // DÜZELTME: Veritabanı adını açıkça belirtiyoruz
        const db = client.db("Dashboard");

        // Kullanıcıyı e-posta adresine göre MongoDB'den bul
        const user = await db
          .collection("users")
          .findOne({ email: credentials.email });

        if (!user) {
          throw new Error("Kullanıcı bulunamadı.");
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
        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
        };
      },
    }),
  ],

  session: {
    strategy: "jwt",
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
      }
      return session;
    },
  },

  pages: {
    signIn: "/login",
  },

  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
