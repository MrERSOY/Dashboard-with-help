// app/api/categories/[categoryId]/route.ts

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import { z } from "zod";

// Kategori güncelleme için veri doğrulama şeması
const categorySchema = z.object({
  name: z
    .string()
    .min(2, { message: "Kategori adı en az 2 karakter olmalıdır." }),
});

/**
 * GET: Belirli bir kategoriyi ID'ye göre getirir.
 */
export async function GET(
  req: Request,
  { params }: { params: { categoryId: string } }
) {
  try {
    if (!params.categoryId) {
      return new NextResponse("Category ID is required", { status: 400 });
    }

    const category = await prisma.category.findUnique({
      where: {
        id: params.categoryId,
      },
    });

    return NextResponse.json(category);
  } catch (error) {
    console.error("[CATEGORY_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

/**
 * PATCH: Belirli bir kategoriyi günceller.
 * Sadece 'ADMIN' rolündeki kullanıcılar tarafından erişilebilir.
 */
export async function PATCH(
  req: Request,
  { params }: { params: { categoryId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as any).role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!params.categoryId) {
      return new NextResponse("Category ID is required", { status: 400 });
    }

    const body = await req.json();
    const validation = categorySchema.safeParse(body);

    if (!validation.success) {
      return new NextResponse(validation.error.message, { status: 400 });
    }

    const category = await prisma.category.update({
      where: {
        id: params.categoryId,
      },
      data: {
        name: validation.data.name,
      },
    });

    return NextResponse.json(category);
  } catch (error) {
    console.error("[CATEGORY_PATCH]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

/**
 * DELETE: Belirli bir kategoriyi siler.
 * Sadece 'ADMIN' rolündeki kullanıcılar tarafından erişilebilir.
 */
export async function DELETE(
  req: Request,
  { params }: { params: { categoryId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as any).role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!params.categoryId) {
      return new NextResponse("Category ID is required", { status: 400 });
    }

    // Not: Bu kategoriye bağlı ürünler varsa silme işlemi başarısız olabilir.
    // Gerçek bir uygulamada, önce bu kategoriye bağlı ürünleri başka bir kategoriye
    // atamak veya bu ürünleri de silmek gibi bir strateji izlenmelidir.
    // Şimdilik basit bir silme işlemi yapıyoruz.
    const category = await prisma.category.delete({
      where: {
        id: params.categoryId,
      },
    });

    return NextResponse.json(category);
  } catch (error) {
    console.error("[CATEGORY_DELETE]", error);
    // Prisma, ilişkili kayıtlar varken silmeye çalışıldığında P2025 koduyla hata verir.
    if ((error as any).code === "P2025" || (error as any).code === "P2003") {
      return new NextResponse(
        "Bu kategoriye atanmış ürünler olduğundan silinemez.",
        { status: 409 }
      );
    }
    return new NextResponse("Internal error", { status: 500 });
  }
}
