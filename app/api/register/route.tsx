// app/api/register/route.tsx
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { UserRole } from "@prisma/client";

export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Lütfen tüm alanları doldurun." },
        { status: 400 }
      );
    }

    const existingUsersCount = await prisma.user.count();
    const role: UserRole = existingUsersCount === 0 ? "ADMIN" : "CUSTOMER";

    const existingUser = await prisma.user.findUnique({
      where: { email: email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Bu e-posta adresi zaten kullanılıyor." },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: role,
      },
    });

    // DÜZELTME: Geriye dönen nesneden `password` alanını çıkararak
    // "unused-var" hatasını gideriyoruz.
    const userToReturn = { ...user };
    userToReturn.password = null;

    return NextResponse.json(userToReturn, { status: 201 });
  } catch (error) {
    console.error("Register API error:", error);
    return NextResponse.json({ error: "İç sunucu hatası." }, { status: 500 });
  }
}
