// app/api/register/route.ts
import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import bcrypt from "bcryptjs";
import { MongoClient } from "mongodb";

export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Lütfen tüm alanları doldurun." },
        { status: 400 }
      );
    }

    const client: MongoClient = await clientPromise;
    const db = client.db("Dashboard"); // Veritabanı adını manuel olarak belirtelim

    const existingUser = await db.collection("users").findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: "Bu e-posta adresi zaten kullanılıyor." },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await db.collection("users").insertOne({
      name,
      email,
      password: hashedPassword,
      createdAt: new Date(),
      updatedAt: new Date(),
      emailVerified: null,
      role: "İzleyici", // Varsayılan rol
      status: "Aktif", // Varsayılan durum
    });

    return NextResponse.json(
      {
        message: "Kullanıcı başarıyla oluşturuldu.",
        userId: result.insertedId,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Register API error:", error);
    return NextResponse.json({ error: "İç sunucu hatası." }, { status: 500 });
  }
}
