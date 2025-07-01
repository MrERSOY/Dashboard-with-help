// app/api/users/[userId]/route.ts

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import { z } from "zod";
import { UserRole } from "@prisma/client"; // Enum'u Prisma'dan import et

// Rol güncelleme için veri doğrulama şeması
const userUpdateSchema = z.object({
  role: z.nativeEnum(UserRole), // Rolün sadece 'CUSTOMER', 'STAFF', 'ADMIN' olabileceğinden emin ol
});

/**
 * PATCH: Belirli bir kullanıcının rolünü günceller.
 * Sadece 'ADMIN' rolündeki kullanıcılar tarafından erişilebilir.
 */
export async function PATCH(
  req: Request,
  { params }: { params: { userId: string } }
) {
  try {
    // 1. Oturum ve Yetki Kontrolü
    const session = await getServerSession(authOptions);
    const user = session?.user as any;

    if (!user || user.role !== "ADMIN") {
      return new NextResponse("Unauthorized: Admins only", { status: 401 });
    }

    if (!params.userId) {
      return new NextResponse("User ID is required", { status: 400 });
    }

    // Bir adminin kendi rolünü değiştirmesini engelle
    if (user.id === params.userId) {
      return new NextResponse("Admin cannot change their own role.", {
        status: 403,
      });
    }

    // 2. Gelen Veriyi Doğrulama
    const body = await req.json();
    const validation = userUpdateSchema.safeParse(body);

    if (!validation.success) {
      return new NextResponse(validation.error.message, { status: 400 });
    }

    // 3. Veritabanı İşlemi
    const updatedUser = await prisma.user.update({
      where: {
        id: params.userId,
      },
      data: {
        role: validation.data.role,
      },
    });

    // Güvenlik için şifreyi yanıttan kaldır
    const { password, ...userWithoutPassword } = updatedUser;

    return NextResponse.json(userWithoutPassword);
  } catch (error) {
    console.error("[USER_PATCH]", error);
    // Kullanıcı bulunamazsa Prisma P2025 hatası verir
    if ((error as any).code === "P2025") {
      return new NextResponse("User not found", { status: 404 });
    }
    return new NextResponse("Internal error", { status: 500 });
  }
}
