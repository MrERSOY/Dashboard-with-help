// app/api/products/route.ts

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import { z } from "zod";

// Yeni ürün oluşturmak için veri doğrulama şeması
const productSchema = z.object({
  name: z.string().min(3, "Ürün adı en az 3 karakter olmalıdır."),
  description: z.string().optional(),
  price: z.coerce.number().min(0, "Fiyat 0'dan küçük olamaz."),
  stock: z.coerce.number().int("Stok tam sayı olmalıdır."),
  categoryId: z.string().cuid("Geçersiz kategori ID'si."),
  images: z
    .array(z.string().url("Geçersiz resim URL'i."))
    .min(1, "En az bir resim eklenmelidir."),
  barcode: z.string().optional(),
});

/**
 * GET: Ürünleri listeler.
 * Kategoriye veya arama terimine göre filtrelenebilir.
 * Herkese açık bir uç noktadır.
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const categoryId = searchParams.get("categoryId");
    const query = searchParams.get("query");

    const products = await prisma.product.findMany({
      where: {
        // Arama sorgusu varsa ürün adı veya açıklamasında ara
        ...(query && {
          OR: [
            { name: { contains: query, mode: "insensitive" } },
            { description: { contains: query, mode: "insensitive" } },
          ],
        }),
        // Kategori ID'si varsa ona göre filtrele
        ...(categoryId && { categoryId }),
      },
      include: {
        // İlişkili kategori bilgisini de getir
        category: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(products);
  } catch (error) {
    console.error("[PRODUCTS_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

/**
 * POST: Yeni bir ürün oluşturur.
 * Sadece 'ADMIN' ve 'STAFF' rollerindeki kullanıcılar tarafından erişilebilir.
 */
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const userRole = (session?.user as any)?.role;

    if (!session?.user || !["ADMIN", "STAFF"].includes(userRole)) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const validation = productSchema.safeParse(body);

    if (!validation.success) {
      return new NextResponse(validation.error.message, { status: 400 });
    }

    const { name, description, price, stock, categoryId, images, barcode } =
      validation.data;

    const product = await prisma.product.create({
      data: {
        name,
        description,
        price,
        stock,
        categoryId,
        images,
        barcode,
      },
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error("[PRODUCTS_POST]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
