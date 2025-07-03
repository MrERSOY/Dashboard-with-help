import { type NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { z } from "zod";
import { Prisma } from "@prisma/client";

const categorySchema = z.object({
  name: z
    .string()
    .min(2, { message: "Kategori adı en az 2 karakter olmalıdır." }),
});

// GET fonksiyonu
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ categoryId: string }> }
) {
  const { categoryId } = await params;
  try {
    if (!categoryId) {
      return new NextResponse("Category ID is required", { status: 400 });
    }
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
    });

    if (!category) {
      return new NextResponse("Category not found", { status: 404 });
    }

    return NextResponse.json(category);
  } catch (error) {
    console.error("[CATEGORY_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

// PATCH fonksiyonu
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ categoryId: string }> }
) {
  const { categoryId } = await params;
  try {
    // Sadece authOptions ile çağır!
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    if (!categoryId) {
      return new NextResponse("Category ID is required", { status: 400 });
    }
    const body = await request.json();
    const validation = categorySchema.safeParse(body);
    if (!validation.success) {
      return new NextResponse(validation.error.message, { status: 400 });
    }
    const category = await prisma.category.update({
      where: { id: categoryId },
      data: { name: validation.data.name },
    });
    return NextResponse.json(category);
  } catch (error) {
    console.error("[CATEGORY_PATCH]", error);
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return new NextResponse("Category not found to update", { status: 404 });
    }
    return new NextResponse("Internal error", { status: 500 });
  }
}

// DELETE fonksiyonu
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ categoryId: string }> }
) {
  const { categoryId } = await params;
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    if (!categoryId) {
      return new NextResponse("Category ID is required", { status: 400 });
    }
    await prisma.category.delete({
      where: { id: categoryId },
    });
    return new NextResponse(null, { status: 204 }); // Başarılı silme işlemi için standart yanıt
  } catch (error) {
    console.error("[CATEGORY_DELETE]", error);
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2025") {
        return new NextResponse("Category not found to delete", {
          status: 404,
        });
      }
      if (error.code === "P2003") {
        return new NextResponse(
          "Bu kategoriye atanmış ürünler olduğundan silinemez.",
          { status: 409 }
        );
      }
    }
    return new NextResponse("Internal error", { status: 500 });
  }
}
