// app/api/products/route.ts
import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { MongoClient } from "mongodb";
import { z } from "zod";

// POST isteği için Zod şeması
const productSchema = z.object({
  name: z.string().min(3, "Ürün adı en az 3 karakter olmalıdır."),
  description: z.string().optional(),
  category: z.string(),
  price: z.number().min(0),
  stock: z.number().int().min(0),
  barcode: z.string().min(1),
  image_url: z.string().url().nullable().optional(),
});

// Ürünleri listeleyen GET fonksiyonu
export async function GET(request: Request) {
  try {
    const client: MongoClient = await clientPromise;
    const db = client.db("Dashboard");

    const products = await db
      .collection("products")
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json(products);
  } catch (error) {
    console.error("Get Products API error:", error);
    return NextResponse.json(
      { error: "Ürünler getirilirken bir hata oluştu." },
      { status: 500 }
    );
  }
}

// Yeni ürün ekleyen POST fonksiyonu
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validation = productSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Geçersiz form verisi", details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const client: MongoClient = await clientPromise;
    const db = client.db("Dashboard");

    const result = await db.collection("products").insertOne({
      ...validation.data,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return NextResponse.json(
      { message: "Ürün başarıyla oluşturuldu.", productId: result.insertedId },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create Product API error:", error);
    return NextResponse.json({ error: "İç sunucu hatası." }, { status: 500 });
  }
}
