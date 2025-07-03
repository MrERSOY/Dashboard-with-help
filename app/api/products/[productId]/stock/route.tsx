// Dosya: app/api/products/[productId]/stock/route.ts
import {
  type NextRequest as NextRequestStock,
  NextResponse as NextResponseStock,
} from "next/server";
import { getServerSession as getServerSessionStock } from "next-auth/next";
import { authOptions as authOptionsStock } from "@/lib/auth";
import prismaStock from "@/lib/prisma";
import { z as zStock } from "zod";

const stockUpdateSchema = zStock.object({
  adjustment: zStock.number().int("Ayarlama değeri bir tam sayı olmalıdır."),
});

export async function PATCH(
  req: NextRequestStock,
  { params }: { params: Promise<{ productId: string }> }
) {
  const { productId } = await params;
  try {
    const session = await getServerSessionStock(authOptionsStock);
    if (!session?.user?.id || !["ADMIN", "STAFF"].includes(session.user.role)) {
      return new NextResponseStock("Unauthorized", { status: 401 });
    }
    if (!productId) {
      return new NextResponseStock("Product ID is required", { status: 400 });
    }
    const body = await req.json();
    const validation = stockUpdateSchema.safeParse(body);
    if (!validation.success) {
      return new NextResponseStock(validation.error.message, { status: 400 });
    }
    const { adjustment } = validation.data;
    const updatedProduct = await prismaStock.product.update({
      where: { id: productId },
      data: { stock: { increment: adjustment } },
    });
    if (updatedProduct.stock < 0) {
      await prismaStock.product.update({
        where: { id: productId },
        data: { stock: { decrement: adjustment } },
      });
      return new NextResponseStock("Stok miktarı sıfırın altına düşemez.", {
        status: 400,
      });
    }
    return NextResponseStock.json(updatedProduct);
  } catch (error) {
    console.error("[STOCK_PATCH]", error);
    return new NextResponseStock("Internal error", { status: 500 });
  }
}
