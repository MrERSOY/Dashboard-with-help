// app/api/users/route.tsx
import { NextResponse as NextResponseUsers } from "next/server";
import prismaUsers from "@/lib/prisma";

export async function GET() {
  // DÜZELTME: Kullanılmayan 'request' parametresi kaldırıldı.
  try {
    const users = await prismaUsers.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponseUsers.json(users);
  } catch (error) {
    console.error("Get Users API error:", error);
    return NextResponseUsers.json(
      { error: "Kullanıcılar getirilirken bir hata oluştu." },
      { status: 500 }
    );
  }
}
