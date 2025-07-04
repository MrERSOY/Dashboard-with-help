// app/api/orders/[orderId]/status/route.ts

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { z } from "zod";
import { OrderStatus, Prisma } from "@prisma/client";

const statusUpdateSchema = z.object({
  status: z.nativeEnum(OrderStatus),
});

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ orderId: string }> }
) {
  const { orderId } = await params;
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || !["ADMIN", "STAFF"].includes(session.user.role)) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    if (!orderId) {
      return new NextResponse("Order ID is required", { status: 400 });
    }
    const body = await req.json();
    const validation = statusUpdateSchema.safeParse(body);
    if (!validation.success) {
      return new NextResponse(validation.error.message, { status: 400 });
    }
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: { status: validation.data.status },
    });
    return NextResponse.json(updatedOrder);
  } catch (error) {
    console.error("[ORDER_STATUS_PATCH]", error);
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return new NextResponse("Order not found", { status: 404 });
    }
    return new NextResponse("Internal error", { status: 500 });
  }
}
