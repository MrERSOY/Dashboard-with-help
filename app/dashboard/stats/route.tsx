// app/api/dashboard/stats/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma"; // Prisma istemcisini import ediyoruz

export async function GET() {
  try {
    // Bugünün başlangıcını temsil eden bir tarih objesi oluştur
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Aynı anda birden fazla sorgu çalıştırarak verileri topla
    const [
      userCount,
      productCount,
      totalStockData,
      categoryData,
      newUsersToday,
      newProductsToday,
      revenueData,
    ] = await prisma.$transaction([
      prisma.user.count(),
      prisma.product.count(),
      prisma.product.aggregate({
        _sum: {
          stock: true,
        },
      }),
      prisma.product.groupBy({
        by: ["category"],
        _count: {
          category: true,
        },
        orderBy: {
          _count: {
            category: "desc",
          },
        },
        take: 1,
      }),
      // Bugün kayıt olan kullanıcıların sayısı
      prisma.user.count({
        where: {
          createdAt: {
            gte: today,
          },
        },
      }),
      // Bugün eklenen ürünlerin sayısı
      prisma.product.count({
        where: {
          createdAt: {
            gte: today,
          },
        },
      }),
      // Toplam ciro için basit bir varsayım (tüm ürünlerin yarısının satıldığı varsayımı)
      // Gerçekte bu veri 'orders' tablosundan gelmelidir.
      prisma.product.aggregate({
        _sum: {
          price: true,
        },
      }),
    ]);

    const stats = {
      userCount,
      productCount,
      totalStock: totalStockData._sum.stock || 0,
      estimatedRevenue: (revenueData._sum.price || 0) * 0.5,
      topCategory: categoryData[0]?.category || "N/A",
      dailyOrders: newProductsToday,
      dailyComplaints: newUsersToday,
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
