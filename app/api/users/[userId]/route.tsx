// Dosya: app/api/users/[userId]/route.ts
import {
  type NextRequest as NextRequestUserId,
  NextResponse as NextResponseUserId,
} from "next/server";
import { getServerSession as getServerSessionUserId } from "next-auth/next";
import { authOptions as authOptionsUserId } from "@/lib/auth";
import prismaUserId from "@/lib/prisma";
import { z as zUserId } from "zod";
import {
  UserRole as UserRoleUserId,
  Prisma as PrismaUserId,
} from "@prisma/client";

const userUpdateSchemaUserId = zUserId.object({
  role: zUserId.nativeEnum(UserRoleUserId),
});

export async function PATCH(
  req: NextRequestUserId,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params;
  try {
    const session = await getServerSessionUserId(authOptionsUserId);
    if (!session?.user || session.user.role !== "ADMIN") {
      return new NextResponseUserId("Unauthorized: Admins only", {
        status: 401,
      });
    }
    if (!userId) {
      return new NextResponseUserId("User ID is required", { status: 400 });
    }
    if (session.user.id === userId) {
      return new NextResponseUserId("Admin cannot change their own role.", {
        status: 403,
      });
    }
    const body = await req.json();
    const validation = userUpdateSchemaUserId.safeParse(body);
    if (!validation.success) {
      return new NextResponseUserId(validation.error.message, { status: 400 });
    }
    const updatedUser = await prismaUserId.user.update({
      where: { id: userId },
      data: { role: validation.data.role },
      select: { id: true, name: true, email: true, role: true, image: true },
    });
    return NextResponseUserId.json(updatedUser);
  } catch (error) {
    console.error("[USER_PATCH]", error);
    if (
      error instanceof PrismaUserId.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return new NextResponseUserId("User not found", { status: 404 });
    }
    return new NextResponseUserId("Internal error", { status: 500 });
  }
}
