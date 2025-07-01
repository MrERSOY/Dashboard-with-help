// app/api/dashboard/stats/route.ts

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { OrderStatus } from "@prisma/client";

export async function GET() {
  try {
    // Bugünün başlangıç ve bitiş zamanlarını hesapla
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    // Tüm istatistikleri tek bir veritabanı sorgusu paketiyle (transaction) çek
    const [userCount, productCount, orderData, salesTodayData] =
      await prisma.$transaction([
        // Toplam kullanıcı sayısı
        prisma.user.count(),
        // Toplam ürün sayısı
        prisma.product.count(),
        // Toplam ciro ve sipariş sayısı için PAID veya DELIVERED durumundaki siparişleri topla
        prisma.order.aggregate({
          _sum: { total: true },
          _count: { id: true },
          where: {
            status: {
              in: [OrderStatus.PAID, OrderStatus.DELIVERED],
            },
          },
        }),
        // Bugünkü satış verileri
        prisma.order.aggregate({
          _sum: { total: true },
          _count: { id: true },
          where: {
            createdAt: {
              gte: todayStart,
              lte: todayEnd,
            },
            status: {
              in: [OrderStatus.PAID, OrderStatus.DELIVERED],
            },
          },
        }),
      ]);

    // Sonuçları anlamlı bir nesneye dönüştür
    const stats = {
      userCount: userCount,
      productCount: productCount,
      totalRevenue: orderData._sum.total ?? 0,
      totalOrders: orderData._count.id ?? 0,
      salesToday: salesTodayData._sum.total ?? 0,
      ordersToday: salesTodayData._count.id ?? 0,
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
