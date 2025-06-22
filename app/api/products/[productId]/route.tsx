// app/api/products/[productId]/route.ts
import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { MongoClient, ObjectId } from "mongodb";
import { z } from "zod";

const productUpdateSchema = z.object({
  name: z.string().min(3).optional(),
  description: z.string().optional(),
  category: z.string().optional(),
  price: z.number().min(0).optional(),
  stock: z.number().int().min(0).optional(),
  barcode: z.string().min(1).optional(),
  image_url: z.string().url().nullable().optional(),
});

export async function PATCH(
  request: Request,
  { params }: { params: { productId: string } }
) {
  try {
    if (!ObjectId.isValid(params.productId)) {
      return NextResponse.json({ error: "Geçersiz Ürün ID." }, { status: 400 });
    }
    const body = await request.json();
    const validation = productUpdateSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: "Geçersiz veri" }, { status: 400 });
    }

    const client: MongoClient = await clientPromise;
    const db = client.db("Dashboard");

    const result = await db
      .collection("products")
      .updateOne(
        { _id: new ObjectId(params.productId) },
        { $set: { ...validation.data, updatedAt: new Date() } }
      );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: "Güncellenecek ürün bulunamadı." },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Ürün başarıyla güncellendi." });
  } catch (error) {
    return NextResponse.json({ error: "İç sunucu hatası." }, { status: 500 });
  }
}
