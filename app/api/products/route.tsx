// app/api/products/route.ts

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import { z } from "zod";

const productSchema = z.object({
  name: z.string().min(3, "Ürün adı en az 3 karakter olmalıdır."),
  description: z.string().optional(),
  price: z.coerce.number().min(0, "Fiyat 0'dan küçük olamaz."),
  stock: z.coerce.number().int("Stok tam sayı olmalıdır."),
  categoryId: z.string().cuid("Geçersiz kategori ID'si."),
  images: z
    .array(z.string().url("Geçersiz resim URL'i."))
    .min(1, "En az bir resim eklenmelidir."),
  barcode: z.string().optional(),
});

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const categoryId = searchParams.get("categoryId");
    const query = searchParams.get("query");

    const products = await prisma.product.findMany({
      where: {
        ...(query && {
          OR: [
            { name: { contains: query, mode: "insensitive" } },
            { description: { contains: query, mode: "insensitive" } },
          ],
        }),
        ...(categoryId && { categoryId }),
      },
      include: {
        category: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(products);
  } catch (error) {
    console.error("[PRODUCTS_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || !["ADMIN", "STAFF"].includes(session.user.role)) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const validation = productSchema.safeParse(body);

    if (!validation.success) {
      return new NextResponse(validation.error.message, { status: 400 });
    }

    const product = await prisma.product.create({ data: validation.data });

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error("[PRODUCTS_POST]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
