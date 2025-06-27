// app/api/users/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma"; // Prisma istemcisini import ediyoruz

export async function GET(request: Request) {
  try {
    // Prisma kullanarak tüm kullanıcıları bul ve şifre alanını DAHİL ETME
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        status: true,
        createdAt: true,
        // 'password' alanını burada belirtmeyerek sonuçtan çıkarmış oluyoruz.
      },
      orderBy: {
        createdAt: "desc", // En yeni kullanıcılar üstte
      },
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error("Get Users API error:", error);
    return NextResponse.json(
      { error: "Kullanıcılar getirilirken bir hata oluştu." },
      { status: 500 }
    );
  }
}
