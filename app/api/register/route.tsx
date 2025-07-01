// app/api/register/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
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
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json(
        { error: "Bu e-posta adresi zaten kullanılıyor." },
        { status: 409 }
      );
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword },
    });
    const { password: _, ...userToReturn } = user;
    return NextResponse.json(userToReturn, { status: 201 });
  } catch (error) {
    console.error("Register API error:", error);
    return NextResponse.json({ error: "İç sunucu hatası." }, { status: 500 });
  }
}
