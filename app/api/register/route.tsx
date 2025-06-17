// app/api/register/route.ts
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Lütfen tüm alanları doldurun." },
        { status: 400 }
      );
    }

    const { data: existingUser } = await supabase
      .from("users")
      .select("email")
      .eq("email", email)
      .single();

    if (existingUser) {
      return NextResponse.json(
        { error: "Bu e-posta adresi zaten kullanılıyor." },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const { data, error } = await supabase
      .from("users")
      .insert([{ name, email, password: hashedPassword }])
      .select()
      .single();

    if (error) {
      // Orijinal Supabase hatasını konsola yazdır
      console.error("Supabase insert error:", error);
      throw new Error("Kullanıcı oluşturulurken bir veritabanı hatası oluştu.");
    }

    const { password: _, ...userWithoutPassword } = data;
    return NextResponse.json(userWithoutPassword, { status: 201 });
  } catch (error) {
    // Yakalanan hatayı konsola yazdır
    console.error("Register API error:", error);
    return NextResponse.json({ error: "İç sunucu hatası." }, { status: 500 });
  }
}
