// app/api/products/[productId]/route.ts
import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { MongoClient, ObjectId } from "mongodb";
import { z } from "zod";

// Güncelleme için Zod şeması
const productUpdateSchema = z.object({
  name: z.string().min(3).optional(),
  description: z.string().optional(),
  category: z.string().optional(),
  price: z.number().min(0).optional(),
  stock: z.number().int().min(0).optional(),
  barcode: z.string().min(1).optional(),
  image_url: z.string().url().nullable().optional(),
});

// YENİ: Tek bir ürünü getiren GET metodu
export async function GET(
  request: Request,
  { params }: { params: { productId: string } }
) {
  try {
    const productId = params.productId;
    if (!ObjectId.isValid(productId)) {
      return NextResponse.json({ error: "Geçersiz Ürün ID." }, { status: 400 });
    }

    const client: MongoClient = await clientPromise;
    const db = client.db("Dashboard");
    const product = await db
      .collection("products")
      .findOne({ _id: new ObjectId(productId) });

    if (!product) {
      return NextResponse.json({ error: "Ürün bulunamadı." }, { status: 404 });
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error("Get Product API error:", error);
    return NextResponse.json({ error: "İç sunucu hatası." }, { status: 500 });
  }
}

// Ürün Güncelleme (PATCH) metodu
export async function PATCH(
  request: Request,
  { params }: { params: { productId: string } }
) {
  try {
    const productId = params.productId;
    if (!ObjectId.isValid(productId)) {
      return NextResponse.json({ error: "Geçersiz Ürün ID." }, { status: 400 });
    }

    const body = await request.json();
    const validation = productUpdateSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Geçersiz veri", details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const client: MongoClient = await clientPromise;
    const db = client.db("Dashboard");

    const result = await db
      .collection("products")
      .updateOne(
        { _id: new ObjectId(productId) },
        { $set: { ...validation.data, updatedAt: new Date() } }
      );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: "Güncellenecek ürün bulunamadı." },
        { status: 404 }
      );
    }

    // Güncellenen veriyi geri döndürelim
    const updatedProduct = await db
      .collection("products")
      .findOne({ _id: new ObjectId(productId) });
    return NextResponse.json(updatedProduct);
  } catch (error) {
    console.error("Update Product API error:", error);
    return NextResponse.json({ error: "İç sunucu hatası." }, { status: 500 });
  }
}

// Ürün Silme (DELETE) metodu
export async function DELETE(
  request: Request,
  { params }: { params: { productId: string } }
) {
  try {
    const productId = params.productId;
    if (!ObjectId.isValid(productId)) {
      return NextResponse.json({ error: "Geçersiz Ürün ID." }, { status: 400 });
    }

    const client: MongoClient = await clientPromise;
    const db = client.db("Dashboard");

    const result = await db
      .collection("products")
      .deleteOne({ _id: new ObjectId(productId) });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: "Silinecek ürün bulunamadı." },
        { status: 404 }
      );
    }

    return new NextResponse(null, { status: 204 }); // Başarılı, içerik yok
  } catch (error) {
    console.error("Delete Product API error:", error);
    return NextResponse.json({ error: "İç sunucu hatası." }, { status: 500 });
  }
}
