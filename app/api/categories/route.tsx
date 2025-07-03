// app/api/categories/route.ts

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { Prisma } from "@prisma/client";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { z } from "zod";

const categorySchema = z.object({
  name: z.string().min(2, "Kategori adı en az 2 karakter olmalıdır."),
});

// TÜM kategorileri getiren basit GET fonksiyonu
export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: "asc" },
    });
    return NextResponse.json(categories);
  } catch (error) {
    console.error("[CATEGORIES_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

// YENİ bir kategori oluşturan basit POST fonksiyonu
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    const body = await req.json();
    const validation = categorySchema.safeParse(body);
    if (!validation.success) {
      return new NextResponse(validation.error.message, { status: 400 });
    }
    const category = await prisma.category.create({
      data: { name: validation.data.name },
    });
    return NextResponse.json(category);
  } catch (error) {
    console.error("[CATEGORIES_POST]", error);
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return new NextResponse("Bu kategori zaten mevcut.", { status: 409 });
    }
    return new NextResponse("Internal error", { status: 500 });
  }
}
