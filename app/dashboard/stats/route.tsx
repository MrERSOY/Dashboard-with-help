// app/api/dashboard/stats/route.ts

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Veri toplama sorgularını bir transaction içinde çalıştır
    const [
      userCount,
      productCount,
      totalStockData,
      categoryGroup, // Bu sorgu düzeltildi
      newUsersToday,
      newProductsToday,
      revenueData,
    ] = await prisma.$transaction([
      prisma.user.count(),
      prisma.product.count(),
      prisma.product.aggregate({
        _sum: { stock: true },
      }),
      // DÜZELTME: groupBy, ilişki alanı yerine scalar ID alanı ('categoryId') üzerinden yapıldı.
      prisma.product.groupBy({
        by: ["categoryId"],
        _count: {
          categoryId: true,
        },
        where: {
          categoryId: {
            not: null, // Kategorisi olmayan ürünleri sayma
          },
        },
        orderBy: {
          _count: {
            categoryId: "desc",
          },
        },
        take: 1,
      }),
      prisma.user.count({
        where: { createdAt: { gte: today } },
      }),
      prisma.product.count({
        where: { createdAt: { gte: today } },
      }),
      // Not: Bu ciro hesaplaması geçicidir. Gerçek bir sipariş sisteminde
      // bu veri 'Order' tablosundan gelmelidir.
      prisma.product.aggregate({
        _sum: { price: true },
      }),
    ]);

    let topCategoryName = "N/A";
    // Eğer en çok tekrar eden bir kategori bulunduysa, adını veritabanından çek
    if (categoryGroup.length > 0 && categoryGroup[0].categoryId) {
      const topCategory = await prisma.category.findUnique({
        where: { id: categoryGroup[0].categoryId },
      });
      if (topCategory) {
        topCategoryName = topCategory.name;
      }
    }

    const stats = {
      userCount,
      productCount,
      totalStock: totalStockData._sum.stock || 0,
      estimatedRevenue: (revenueData._sum.price || 0) * 0.5, // Geçici ciro mantığı
      topCategory: topCategoryName,
      dailyOrders: newProductsToday, // Bugün eklenen ürün sayısını temsil eder
      dailyComplaints: newUsersToday, // Bugün eklenen kullanıcı sayısını temsil eder
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
