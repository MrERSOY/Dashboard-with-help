// Dosya: app/api/products/[productId]/route.ts
import {
  type NextRequest as NextRequestProdId,
  NextResponse as NextResponseProdId,
  NextRequest,
} from "next/server";
import { getServerSession as getServerSessionProdId } from "next-auth/next";
import { authOptions as authOptionsProdId } from "@/lib/auth";
import prismaProdId from "@/lib/prisma";
import { z as zProdId } from "zod";
import { Prisma as PrismaProdId } from "@prisma/client";

const productUpdateSchemaProdId = zProdId.object({
  name: zProdId.string().min(3).optional(),
  description: zProdId.string().optional(),
  price: zProdId.coerce.number().min(0).optional(),
  stock: zProdId.coerce.number().int().optional(),
  categoryId: zProdId.string().cuid().optional(),
  images: zProdId.array(zProdId.string().url()).min(1).optional(),
  barcode: zProdId.string().optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  try {
    if (!(await params).productId)
      return new NextResponseProdId("Product ID is required", { status: 400 });
    const product = await prismaProdId.product.findUnique({
      where: { id: (await params).productId },
      include: { category: true },
    });
    if (!product)
      return new NextResponseProdId("Product not found", { status: 404 });
    return NextResponseProdId.json(product);
  } catch (error) {
    console.error(
      `GET /api/products/${(await params).productId} error:`,
      error
    );
    return new NextResponseProdId("Internal error", { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  try {
    const session = await getServerSessionProdId(authOptionsProdId);
    if (!session?.user?.id || !["ADMIN", "STAFF"].includes(session.user.role)) {
      return new NextResponseProdId("Unauthorized", { status: 401 });
    }
    if (!(await params).productId)
      return new NextResponseProdId("Product ID is required", { status: 400 });
    const body = await request.json();
    const validation = productUpdateSchemaProdId.safeParse(body);
    if (!validation.success)
      return new NextResponseProdId(validation.error.message, { status: 400 });
    const product = await prismaProdId.product.update({
      where: { id: (await params).productId },
      data: validation.data,
    });
    return NextResponseProdId.json(product);
  } catch (error) {
    console.error(
      `PATCH /api/products/${(await params).productId} error:`,
      error
    );
    return new NextResponseProdId("Internal error", { status: 500 });
  }
}

export async function DELETE(
  request: NextRequestProdId,
  { params }: { params: Promise<{ productId: string }> }
) {
  const { productId } = await params;
  try {
    const session = await getServerSessionProdId(authOptionsProdId);
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return new NextResponseProdId("Unauthorized: Admins only", {
        status: 401,
      });
    }
    if (!productId)
      return new NextResponseProdId("Product ID is required", { status: 400 });
    await prismaProdId.orderItem.deleteMany({
      where: { productId },
    });
    const product = await prismaProdId.product.delete({
      where: { id: productId },
    });
    return NextResponseProdId.json(product);
  } catch (error) {
    console.error(`DELETE /api/products/${productId} error:`, error);
    if (
      error instanceof PrismaProdId.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return new NextResponseProdId("Silinecek ürün bulunamadı.", {
        status: 404,
      });
    }
    return new NextResponseProdId("Internal error", { status: 500 });
  }
}
