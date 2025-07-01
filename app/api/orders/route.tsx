// app/api/orders/route.ts

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import { z } from "zod";
import { OrderOrigin } from "@prisma/client";

const createOrderSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string().cuid(),
        quantity: z.number().int().min(1),
      })
    )
    .min(1, "Sipariş en az bir ürün içermelidir."),
  userId: z.string().cuid().optional(),
});

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || !["ADMIN", "STAFF"].includes(session.user.role)) {
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

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || !["ADMIN", "STAFF"].includes(session.user.role)) {
    return new NextResponse("Unauthorized", { status: 401 });
  }
  const staffUserId = session.user.id;
  try {
    const body = await req.json();
    const validation = createOrderSchema.safeParse(body);
    if (!validation.success) {
      return new NextResponse(validation.error.message, { status: 400 });
    }
    const { items, userId } = validation.data;
    const productIds = items.map((item) => item.productId);
    const newOrder = await prisma.$transaction(async (tx) => {
      const products = await tx.product.findMany({
        where: { id: { in: productIds } },
      });
      let total = 0;
      const orderItemsData = [];
      for (const item of items) {
        const product = products.find((p) => p.id === item.productId);
        if (!product) throw new Error(`Ürün bulunamadı: ID ${item.productId}`);
        if (product.stock < item.quantity)
          throw new Error(
            `Yetersiz stok: ${product.name} (Stok: ${product.stock})`
          );
        total += product.price * item.quantity;
        orderItemsData.push({
          productId: item.productId,
          quantity: item.quantity,
          price: product.price,
        });
      }
      for (const item of items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });
      }
      const orderUserId = userId || staffUserId;
      const createdOrder = await tx.order.create({
        data: {
          userId: orderUserId,
          total,
          origin: OrderOrigin.IN_STORE,
          status: "PAID",
          items: { create: orderItemsData },
        },
      });
      return createdOrder;
    });
    return NextResponse.json(newOrder, { status: 201 });
  } catch (error) {
    console.error("[ORDER_POST]", error);
    if (
      error instanceof Error &&
      (error.message.includes("Yetersiz stok") ||
        error.message.includes("Ürün bulunamadı"))
    ) {
      return new NextResponse(error.message, { status: 409 });
    }
    return new NextResponse("Internal error", { status: 500 });
  }
}
