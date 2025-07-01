// app/api/categories/route.ts

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import { z } from "zod";

// Yeni kategori oluşturmak için veri doğrulama şeması
const categorySchema = z.object({
  name: z
    .string()
    .min(2, { message: "Kategori adı en az 2 karakter olmalıdır." }),
});

/**
 * GET: Tüm kategorileri listeler.
 * Herkese açık bir uç noktadır.
 */
export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: {
        name: "asc",
      },
    });
    return NextResponse.json(categories);
  } catch (error) {
    console.error("[CATEGORIES_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

/**
 * POST: Yeni bir kategori oluşturur.
 * Sadece 'ADMIN' rolündeki kullanıcılar tarafından erişilebilir.
 */
export async function POST(req: Request) {
  try {
    // Oturum kontrolü
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as any).role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const validation = categorySchema.safeParse(body);

    if (!validation.success) {
      return new NextResponse(validation.error.message, { status: 400 });
    }

    // Aynı isimde kategori var mı kontrol et
    const existingCategory = await prisma.category.findFirst({
      where: { name: { equals: validation.data.name, mode: "insensitive" } },
    });

    if (existingCategory) {
      return new NextResponse("Bu kategori zaten mevcut.", { status: 409 });
    }

    const category = await prisma.category.create({
      data: {
        name: validation.data.name,
      },
    });

    return NextResponse.json(category);
  } catch (error) {
    console.error("[CATEGORIES_POST]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
