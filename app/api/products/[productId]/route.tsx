// app/api/products/[productId]/route.ts
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { z } from "zod";

// Güncelleme için Zod şeması (tüm alanlar opsiyonel)
const productUpdateSchema = z.object({
  name: z.string().min(3).optional(),
  description: z.string().optional(),
  category: z.string().optional(),
  price: z.number().min(0).optional(),
  stock: z.number().int().min(0).optional(),
  barcode: z.string().min(1).optional(),
  image_url: z.string().url().nullable().optional(), // image_url null olabilir
});

export async function PATCH(
  request: Request,
  { params }: { params: { productId: string } }
) {
  try {
    const body = await request.json();
    const validation = productUpdateSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Geçersiz veri", details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("products")
      .update(validation.data)
      .eq("id", params.productId)
      .select()
      .single();

    if (error) {
      console.error("Supabase update error:", error);
      return NextResponse.json(
        { error: "Ürün güncellenemedi." },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: "İç sunucu hatası." }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { productId: string } }
) {
  try {
    // İsteğe bağlı: Ürünle ilişkili görselleri Supabase Storage'dan silme mantığı buraya eklenebilir.

    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", params.productId);

    if (error) {
      console.error("Supabase delete error:", error);
      return NextResponse.json({ error: "Ürün silinemedi." }, { status: 500 });
    }

    return new NextResponse(null, { status: 204 }); // Başarılı, içerik yok
  } catch (error) {
    return NextResponse.json({ error: "İç sunucu hatası." }, { status: 500 });
  }
}
