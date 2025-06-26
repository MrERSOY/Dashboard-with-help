// app/api/dashboard/stats/route.ts
import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { MongoClient } from "mongodb";

export async function GET() {
  try {
    const client: MongoClient = await clientPromise;
    const db = client.db("Dashboard");

    // Bugünün başlangıcını temsil eden bir tarih objesi oluştur
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Aynı anda birden fazla sorgu çalıştırarak verileri topla
    const [
      userCount,
      productCount,
      totalStockData,
      categoryData,
      newUsersToday, // Yeni istatistik
      newProductsToday, // Yeni istatistik
    ] = await Promise.all([
      db.collection("users").countDocuments(),
      db.collection("products").countDocuments(),
      db
        .collection("products")
        .aggregate([{ $group: { _id: null, total: { $sum: "$stock" } } }])
        .toArray(),
      db
        .collection("products")
        .aggregate([
          { $group: { _id: "$category", count: { $sum: 1 } } },
          { $sort: { count: -1 } },
          { $limit: 1 },
        ])
        .toArray(),
      // Bugün kayıt olan kullanıcıların sayısı
      db.collection("users").countDocuments({ createdAt: { $gte: today } }),
      // Bugün eklenen ürünlerin sayısı
      db.collection("products").countDocuments({ createdAt: { $gte: today } }),
    ]);

    // Toplam ciro için basit bir varsayım
    const revenueData = await db
      .collection("products")
      .aggregate([
        {
          $group: {
            _id: null,
            total: { $sum: { $multiply: ["$price", 0.5] } },
          },
        },
      ])
      .toArray();

    const stats = {
      userCount,
      productCount,
      totalStock: totalStockData[0]?.total || 0,
      estimatedRevenue: revenueData[0]?.total || 0,
      topCategory: categoryData[0]?._id || "N/A",
      // Simülasyon verileri yerine gerçek veriler
      dailyOrders: newProductsToday, // Artık "Bugün Eklenen Ürünler"
      dailyComplaints: newUsersToday, // Artık "Bugün Kaydolan Kullanıcılar"
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error("Dashboard Stats API error:", error);
    return NextResponse.json(
      { error: "İstatistikler getirilirken bir hata oluştu." },
      { status: 500 }
    );
  }
}
