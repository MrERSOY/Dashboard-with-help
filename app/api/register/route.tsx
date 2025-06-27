// app/api/register/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma"; // Prisma istemcisini import ediyoruz
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Lütfen tüm alanları doldurun." },
        { status: 400 }
      );
    }

    // Kullanıcı zaten var mı diye kontrol et
    const existingUser = await prisma.user.findUnique({
      where: { email: email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Bu e-posta adresi zaten kullanılıyor." },
        { status: 409 } // 409 Conflict
      );
    }

    // Şifreyi hash'le (güvenli hale getir)
    const hashedPassword = await bcrypt.hash(password, 10);

    // Yeni kullanıcıyı Prisma aracılığıyla veritabanına ekle
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        // Diğer alanlar (role, status vb.) schema.prisma'daki varsayılan değerleri alacak
      },
    });

    // Başarılı olursa, oluşturulan kullanıcıyı (şifresiz olarak) geri döndür
    const { password: _, ...userWithoutPassword } = user;
    return NextResponse.json(userWithoutPassword, { status: 201 });
  } catch (error) {
    console.error("Register API error:", error);
    return NextResponse.json({ error: "İç sunucu hatası." }, { status: 500 });
  }
}
