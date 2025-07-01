// app/api/users/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: "desc",
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
