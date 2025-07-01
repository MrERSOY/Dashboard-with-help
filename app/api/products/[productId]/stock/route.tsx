// app/api/products/[productId]/stock/route.ts

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import { z } from "zod";

// Stok güncelleme için veri doğrulama şeması
const stockUpdateSchema = z.object({
  // 'adjustment' pozitif (ekleme) veya negatif (çıkarma) bir tam sayı olabilir.
  adjustment: z.number().int("Ayarlama değeri bir tam sayı olmalıdır."),
});

/**
 * PATCH: Belirli bir ürünün stok miktarını günceller.
 * Sadece 'ADMIN' ve 'STAFF' rollerindeki kullanıcılar tarafından erişilebilir.
 */
export async function PATCH(
  req: Request,
  { params }: { params: { productId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || !["ADMIN", "STAFF"].includes(session.user.role)) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!params.productId) {
      return new NextResponse("Product ID is required", { status: 400 });
    }

    const body = await req.json();
    const validation = stockUpdateSchema.safeParse(body);

    if (!validation.success) {
      return new NextResponse(validation.error.message, { status: 400 });
    }

    const { adjustment } = validation.data;

    // Prisma'nın atomik operasyonlarını kullanarak stok miktarını güncelle.
    // 'increment' metodu, negatif değerler için otomatik olarak 'decrement' işlemi yapar.
    const updatedProduct = await prisma.product.update({
      where: {
        id: params.productId,
      },
      data: {
        stock: {
          increment: adjustment,
        },
      },
    });

    // Yeni stok miktarı negatif olamaz kontrolü
    if (updatedProduct.stock < 0) {
      // Eğer stok negatif olursa, işlemi geri al ve hata döndür.
      await prisma.product.update({
        where: { id: params.productId },
        data: { stock: { decrement: adjustment } }, // Yapılan işlemi geri al
      });
      return new NextResponse("Stok miktarı sıfırın altına düşemez.", {
        status: 400,
      });
    }

    return NextResponse.json(updatedProduct);
  } catch (error) {
    console.error("[STOCK_PATCH]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
