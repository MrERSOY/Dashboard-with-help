// app/api/products/[productId]/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { z } from "zod";

// Güncelleme için Zod şeması (tüm alanlar opsiyonel)
const productUpdateSchema = z.object({
  name: z.string().min(3).optional(),
  description: z.string().optional(),
  category: z.string().optional(),
  price: z.number().min(0).optional(),
  stock: z.number().int().min(0).optional(),
  barcode: z.string().min(1).optional(),
  image_url: z.string().url().nullable().optional(),
});

// Tek bir ürünü getiren GET fonksiyonu
export async function GET(
  req: Request,
  { params }: { params: { productId: string } }
) {
  try {
    const product = await prisma.product.findUnique({
      where: { id: params.productId },
    });

    if (!product) {
      return NextResponse.json({ error: "Ürün bulunamadı." }, { status: 404 });
    }
    return NextResponse.json(product);
  } catch (error) {
    console.error(`GET /api/products/${params.productId} error:`, error);
    return NextResponse.json({ error: "Sunucu hatası." }, { status: 500 });
  }
}

// Bir ürünü güncelleyen PATCH fonksiyonu
export async function PATCH(
  req: Request,
  { params }: { params: { productId: string } }
) {
  try {
    const body = await req.json();
    const validation = productUpdateSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Geçersiz veri", details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const product = await prisma.product.update({
      where: { id: params.productId },
      data: { ...validation.data, updatedAt: new Date() },
    });
    return NextResponse.json(product);
  } catch (error) {
    console.error(`PATCH /api/products/${params.productId} error:`, error);
    return NextResponse.json({ error: "Güncelleme hatası." }, { status: 500 });
  }
}

// Bir ürünü silen DELETE fonksiyonu
export async function DELETE(
  req: Request,
  { params }: { params: { productId: string } }
) {
  try {
    await prisma.product.delete({
      where: { id: params.productId },
    });
    return new NextResponse(null, { status: 204 }); // Başarılı, içerik yok
  } catch (error) {
    console.error(`DELETE /api/products/${params.productId} error:`, error);
    return NextResponse.json({ error: "Silme hatası." }, { status: 500 });
  }
}
