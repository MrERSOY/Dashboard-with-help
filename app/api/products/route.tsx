// app/api/products/route.ts
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { z } from "zod";

// Zod ile form verisi için bir şema oluşturuyoruz
// Bu şema, Supabase tablonuzla ve formunuzla eşleşmelidir.
const productSchema = z.object({
  name: z.string().min(3, "Ürün adı en az 3 karakter olmalıdır."),
  description: z.string().optional(),
  category: z.string(),
  price: z.number().min(0, "Fiyat negatif olamaz."),
  stock: z.number().int().min(0, "Stok negatif olamaz."),
  barcode: z.string().min(1, "Barkod alanı zorunludur."),
  image_url: z.string().url().nullable().optional(), // image_url alanı eklendi
});

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Gelen veriyi Zod şeması ile doğrula
    const validation = productSchema.safeParse(body);
    if (!validation.success) {
      console.error("Zod Validation Error:", validation.error.flatten());
      return NextResponse.json(
        { error: "Geçersiz form verisi", details: validation.error.flatten() },
        { status: 400 }
      );
    }

    // Doğrulanmış veriyi Supabase'e ekle
    const { data, error } = await supabase
      .from("products")
      .insert([validation.data]) // Zod tarafından doğrulanan veriyi direkt ekle
      .select()
      .single();

    if (error) {
      console.error("Supabase insert error:", error);
      return NextResponse.json(
        { error: "Veritabanına kayıt sırasında bir hata oluştu." },
        { status: 500 }
      );
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error("Create product API error:", error);
    return NextResponse.json({ error: "İç sunucu hatası." }, { status: 500 });
  }
}
