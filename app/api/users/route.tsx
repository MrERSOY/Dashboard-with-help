// app/api/users/route.ts
import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { MongoClient } from "mongodb";

export async function GET(request: Request) {
  try {
    const client: MongoClient = await clientPromise;
    const db = client.db();

    // Kullanıcıları bul ve şifre alanını DAHİL ETME
    const users = await db
      .collection("users")
      .find({})
      .project({ password: 0 }) // password: 0, şifre alanını sonuçtan çıkarır
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json(users);
  } catch (error) {
    console.error("Get Users API error:", error);
    return NextResponse.json(
      { error: "Kullanıcılar getirilirken bir hata oluştu." },
      { status: 500 }
    );
  }
}
