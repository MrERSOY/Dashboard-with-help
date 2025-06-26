// app/api/products/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { z } from "zod";

// Yeni ürün oluşturma için Zod şeması
const productCreateSchema = z.object({
  name: z.string().min(3, "Ürün adı en az 3 karakter olmalıdır."),
  description: z.string().optional(),
  category: z.string(),
  price: z.number().min(0, "Fiyat negatif olamaz."),
  stock: z.number().int().min(0, "Stok negatif olamaz."),
  barcode: z.string().min(1, "Barkod alanı zorunludur."),
  image_url: z.string().url().nullable().optional(),
});

// Tüm ürünleri getiren GET fonksiyonu
export async function GET() {
  try {
    const products = await prisma.product.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });
    return NextResponse.json(products);
  } catch (error) {
    console.error("Get Products API error:", error);
    return NextResponse.json(
      { error: "Ürünler getirilirken bir hata oluştu." },
      { status: 500 }
    );
  }
}

// Yeni bir ürün oluşturan POST fonksiyonu
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validation = productCreateSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Geçersiz form verisi", details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const product = await prisma.product.create({
      data: validation.data,
    });
    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error("Create Product API error:", error);
    // Prisma'nın benzersiz alan hatasını yakalama (örn: barcode)
    if ((error as any).code === "P2002") {
      return NextResponse.json(
        { error: "Bu barkoda sahip bir ürün zaten mevcut." },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: "Ürün oluşturulurken bir hata oluştu." },
      { status: 500 }
    );
  }
}
