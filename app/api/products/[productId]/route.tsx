// app/api/products/[productId]/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: { productId: string } }
) {
  try {
    const product = await prisma.product.findUnique({
      where: { id: params.productId },
    });
    if (!product)
      return NextResponse.json({ error: "Ürün bulunamadı." }, { status: 404 });
    return NextResponse.json(product);
  } catch (error) {
    return NextResponse.json({ error: "Sunucu hatası." }, { status: 500 });
  }
}
export async function PATCH(
  req: Request,
  { params }: { params: { productId: string } }
) {
  try {
    const body = await req.json();
    const product = await prisma.product.update({
      where: { id: params.productId },
      data: body,
    });
    return NextResponse.json(product);
  } catch (error) {
    return NextResponse.json({ error: "Güncelleme hatası." }, { status: 500 });
  }
}
export async function DELETE(
  req: Request,
  { params }: { params: { productId: string } }
) {
  try {
    await prisma.product.delete({ where: { id: params.productId } });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return NextResponse.json({ error: "Silme hatası." }, { status: 500 });
  }
}
