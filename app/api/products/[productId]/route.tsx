// app/api/products/[productId]/route.ts

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import { z } from "zod";
import { Prisma } from "@prisma/client";

const productUpdateSchema = z.object({
  name: z.string().min(3, "Ürün adı en az 3 karakter olmalıdır.").optional(),
  description: z.string().optional(),
  price: z.coerce.number().min(0, "Fiyat 0'dan küçük olamaz.").optional(),
  stock: z.coerce.number().int("Stok tam sayı olmalıdır.").optional(),
  categoryId: z.string().cuid("Geçersiz kategori ID'si.").optional(),
  images: z
    .array(z.string().url("Geçersiz resim URL'i."))
    .min(1, "En az bir resim eklenmelidir.")
    .optional(),
  barcode: z.string().optional(),
});

export async function GET(
  req: Request,
  { params }: { params: { productId: string } }
) {
  try {
    if (!params.productId) {
      return new NextResponse("Product ID is required", { status: 400 });
    }
    const product = await prisma.product.findUnique({
      where: { id: params.productId },
      include: { category: true },
    });
    if (!product) {
      return new NextResponse("Product not found", { status: 404 });
    }
    return NextResponse.json(product);
  } catch (error) {
    console.error(`GET /api/products/${params.productId} error:`, error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { productId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || !["ADMIN", "STAFF"].includes(session.user.role)) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    if (!params.productId) {
      return new NextResponse("Product ID is required", { status: 400 });
    }
    const body = await req.json();
    const validation = productUpdateSchema.safeParse(body);
    if (!validation.success) {
      return new NextResponse(validation.error.message, { status: 400 });
    }
    const product = await prisma.product.update({
      where: { id: params.productId },
      data: validation.data,
    });
    return NextResponse.json(product);
  } catch (error) {
    console.error(`PATCH /api/products/${params.productId} error:`, error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { productId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return new NextResponse("Unauthorized: Admins only", { status: 401 });
    }
    if (!params.productId) {
      return new NextResponse("Product ID is required", { status: 400 });
    }
    await prisma.orderItem.deleteMany({
      where: { productId: params.productId },
    });
    const product = await prisma.product.delete({
      where: { id: params.productId },
    });
    return NextResponse.json(product);
  } catch (error) {
    console.error(`DELETE /api/products/${params.productId} error:`, error);
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return new NextResponse("Silinecek ürün bulunamadı.", { status: 404 });
    }
    return new NextResponse("Internal error", { status: 500 });
  }
}
