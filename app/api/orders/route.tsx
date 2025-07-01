// app/api/orders/route.ts

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import { z } from "zod";
import { OrderOrigin } from "@prisma/client";

// Sipariş oluşturmak için veri doğrulama şeması
const createOrderSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string().cuid(),
        quantity: z.number().int().min(1),
      })
    )
    .min(1, "Sipariş en az bir ürün içermelidir."),
  // Mağaza içi satışta müşteri seçimi opsiyonel olabilir,
  // bu yüzden userId'yi de opsiyonel yapıyoruz.
  userId: z.string().cuid().optional(),
});

/**
 * GET: Tüm siparişleri listeler.
 * Sadece 'ADMIN' ve 'STAFF' rollerindeki kullanıcılar tarafından erişilebilir.
 */
export async function GET() {
  const session = await getServerSession(authOptions);
  const userRole = (session?.user as any)?.role;

  if (!session?.user || !["ADMIN", "STAFF"].includes(userRole)) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const orders = await prisma.order.findMany({
      include: {
        user: { select: { name: true, email: true } },
        items: { include: { product: { select: { name: true } } } },
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(orders);
  } catch (error) {
    console.error("[ORDERS_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

/**
 * POST: Yeni bir sipariş oluşturur (POS ve Manuel Sipariş için).
 * Stokları düşürür ve sipariş kaydı oluşturur.
 */
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  const userRole = (session?.user as any)?.role;
  const staffUserId = session?.user?.id;

  if (!staffUserId || !["ADMIN", "STAFF"].includes(userRole)) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const body = await req.json();
    const validation = createOrderSchema.safeParse(body);

    if (!validation.success) {
      return new NextResponse(validation.error.message, { status: 400 });
    }

    const { items, userId } = validation.data;
    const productIds = items.map((item) => item.productId);

    // Tüm işlemleri bir transaction içinde yaparak veri bütünlüğünü garantile
    const newOrder = await prisma.$transaction(async (tx) => {
      // 1. Siparişteki tüm ürünlerin bilgilerini ve stok durumunu çek
      const products = await tx.product.findMany({
        where: { id: { in: productIds } },
      });

      let total = 0;
      const orderItemsData = [];

      for (const item of items) {
        const product = products.find((p) => p.id === item.productId);
        if (!product) {
          throw new Error(`Ürün bulunamadı: ID ${item.productId}`);
        }
        if (product.stock < item.quantity) {
          throw new Error(
            `Yetersiz stok: ${product.name} (Stok: ${product.stock})`
          );
        }

        total += product.price * item.quantity;
        orderItemsData.push({
          productId: item.productId,
          quantity: item.quantity,
          price: product.price, // Satış anındaki fiyatı kaydet
        });
      }

      // 2. Stokları düşür
      for (const item of items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });
      }

      // 3. Siparişi oluştur
      // Eğer bir müşteri ID'si verilmediyse, işlemi yapan personeli atayalım.
      const orderUserId = userId || staffUserId;

      const createdOrder = await tx.order.create({
        data: {
          userId: orderUserId,
          total: total,
          origin: OrderOrigin.IN_STORE, // Bu API mağaza içi satışlar için
          status: "PAID", // Mağaza içi satışlar genellikle anında ödenir
          items: {
            create: orderItemsData,
          },
        },
      });

      return createdOrder;
    });

    return NextResponse.json(newOrder, { status: 201 });
  } catch (error: any) {
    console.error("[ORDER_POST]", error);
    // Stok yetersizliği gibi özel hataları yakala
    if (
      error.message.includes("Yetersiz stok") ||
      error.message.includes("Ürün bulunamadı")
    ) {
      return new NextResponse(error.message, { status: 409 }); // 409 Conflict
    }
    return new NextResponse("Internal error", { status: 500 });
  }
}
