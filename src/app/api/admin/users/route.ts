export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

// GET: Danh sách tất cả users (Admin)
export async function GET() {
  try {
    await requireAdmin();

    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        username: true,
        isAdmin: true,
        inviteToken: true,
        inviteExpiry: true,
        passwordHash: true,
        createdAt: true,
      },
    });

    // Không trả về passwordHash thật, chỉ trả boolean
    const sanitized = users.map((u) => ({
      ...u,
      passwordHash: u.passwordHash ? "[set]" : null,
    }));

    return NextResponse.json({ users: sanitized });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
    }
    if (error instanceof Error && error.message === "Forbidden") {
      return NextResponse.json({ error: "Không có quyền" }, { status: 403 });
    }
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}
