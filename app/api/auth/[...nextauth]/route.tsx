// app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { supabase } from "@/lib/supabase"; // Supabase istemcimiz
import bcrypt from "bcryptjs"; // Şifre karşılaştırma için

// Kullanıcı tipi (veritabanından dönecek)
interface DbUser {
  id: string;
  name: string;
  email: string;
  password?: string; // Bu alanı seçmemeye dikkat edeceğiz
}

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, req) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        // 1. Kullanıcıyı e-posta adresine göre veritabanında bul
        const { data: user, error } = await supabase
          .from("users")
          .select("*") // Şifreyi de almamız gerekiyor karşılaştırma için
          .eq("email", credentials.email)
          .single();

        if (error || !user) {
          console.error("Kullanıcı bulunamadı veya Supabase hatası:", error);
          return null;
        }

        // 2. Girilen şifre ile veritabanındaki hash'lenmiş şifreyi karşılaştır
        const passwordMatch = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!passwordMatch) {
          console.log("Şifre eşleşmedi.");
          return null;
        }

        console.log("Giriş başarılı:", user.email);

        // 3. Başarılı olursa, session için kullanıcı objesini döndür
        // Dönen objeye asla şifreyi dahil etme!
        return {
          id: user.id,
          name: user.name,
          email: user.email,
        };
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
  // Session yönetimi için strateji
  session: {
    strategy: "jwt",
  },
  // JWT ve session'a ek bilgi eklemek için callbacks
  callbacks: {
    async jwt({ token, user }) {
      // Giriş yapıldığında, user objesindeki bilgileri token'a ekle
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      // Token'daki bilgileri session objesine ekle
      if (session.user) {
        // NextAuth'un varsayılan User tipinde id yok, bu yüzden cast ediyoruz
        (session.user as any).id = token.id;
      }
      return session;
    },
  },
});

export { handler as GET, handler as POST };
