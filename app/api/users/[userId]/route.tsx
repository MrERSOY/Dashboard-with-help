// app/api/users/[userId]/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import { z } from "zod";
import { UserRole, Prisma } from "@prisma/client";

const userUpdateSchema = z.object({
  role: z.nativeEnum(UserRole),
});

export async function PATCH(
  req: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "ADMIN") {
      return new NextResponse("Unauthorized: Admins only", { status: 401 });
    }
    if (!params.userId) {
      return new NextResponse("User ID is required", { status: 400 });
    }
    if (session.user.id === params.userId) {
      return new NextResponse("Admin cannot change their own role.", {
        status: 403,
      });
    }
    const body = await req.json();
    const validation = userUpdateSchema.safeParse(body);
    if (!validation.success) {
      return new NextResponse(validation.error.message, { status: 400 });
    }
    const updatedUser = await prisma.user.update({
      where: { id: params.userId },
      data: { role: validation.data.role },
      select: { id: true, name: true, email: true, role: true, image: true },
    });
    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("[USER_PATCH]", error);
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return new NextResponse("User not found", { status: 404 });
    }
    return new NextResponse("Internal error", { status: 500 });
  }
}
