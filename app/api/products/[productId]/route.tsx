// app/api/products/[productId]/route.ts

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import { z } from "zod";

// Ürün güncelleme için veri doğrulama şeması (tüm alanlar opsiyonel)
const productUpdateSchema = z.object({
  name: z.string().min(3, "Ürün adı en az 3 karakter olmalıdır.").optional(),
  description: z.string().optional(),
  price: z.coerce.number().min(0, "Fiyat 0'dan küçük olamaz.").optional(),
  stock: z.coerce.number().int("Stok tam sayı olmalıdır.").optional(),
  categoryId: z.string().cuid("Geçersiz kategori ID'si.").optional(),
  images: z
    .array(z.string().url("Geçersiz resim URL'i."))
    .min(1, "En az bir resim eklenmelidir.")
    .optional(),
  barcode: z.string().optional(),
});

/**
 * GET: Belirli bir ürünü ID'ye göre getirir.
 * Herkese açık bir uç noktadır.
 */
export async function GET(
  req: Request,
  { params }: { params: { productId: string } }
) {
  try {
    if (!params.productId) {
      return new NextResponse("Product ID is required", { status: 400 });
    }

    const product = await prisma.product.findUnique({
      where: {
        id: params.productId,
      },
      include: {
        category: true, // Kategori bilgisini de dahil et
      },
    });

    if (!product) {
      return new NextResponse("Product not found", { status: 404 });
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error("[PRODUCT_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

/**
 * PATCH: Belirli bir ürünü günceller.
 * Sadece 'ADMIN' ve 'STAFF' rollerindeki kullanıcılar tarafından erişilebilir.
 */
export async function PATCH(
  req: Request,
  { params }: { params: { productId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    const userRole = (session?.user as any)?.role;

    if (!session?.user || !["ADMIN", "STAFF"].includes(userRole)) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!params.productId) {
      return new NextResponse("Product ID is required", { status: 400 });
    }

    const body = await req.json();
    const validation = productUpdateSchema.safeParse(body);

    if (!validation.success) {
      return new NextResponse(validation.error.message, { status: 400 });
    }

    const product = await prisma.product.update({
      where: {
        id: params.productId,
      },
      data: validation.data,
    });

    return NextResponse.json(product);
  } catch (error) {
    console.error("[PRODUCT_PATCH]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

/**
 * DELETE: Belirli bir ürünü siler.
 * Sadece 'ADMIN' rolündeki kullanıcılar tarafından erişilebilir.
 */
export async function DELETE(
  req: Request,
  { params }: { params: { productId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    const userRole = (session?.user as any)?.role;

    if (!session?.user || userRole !== "ADMIN") {
      return new NextResponse("Unauthorized: Admins only", { status: 401 });
    }

    if (!params.productId) {
      return new NextResponse("Product ID is required", { status: 400 });
    }

    // Önce bu ürüne bağlı sipariş kalemlerini sil
    await prisma.orderItem.deleteMany({
      where: {
        productId: params.productId,
      },
    });

    // Sonra ürünü sil
    const product = await prisma.product.delete({
      where: {
        id: params.productId,
      },
    });

    return NextResponse.json(product);
  } catch (error) {
    console.error("[PRODUCT_DELETE]", error);
    if ((error as any).code === "P2025") {
      return new NextResponse("Silinecek ürün bulunamadı.", { status: 404 });
    }
    return new NextResponse("Internal error", { status: 500 });
  }
}
