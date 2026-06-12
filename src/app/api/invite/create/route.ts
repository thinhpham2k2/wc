export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import crypto from "crypto";

export async function POST(request: Request) {
  try {
    await requireAdmin();

    const { username } = await request.json();

    if (!username) {
      return NextResponse.json(
        { error: "Username là bắt buộc" },
        { status: 400 }
      );
    }

    const existing = await prisma.user.findUnique({ where: { username } });
    if (existing) {
      return NextResponse.json(
        { error: "Username đã tồn tại" },
        { status: 409 }
      );
    }

    const inviteToken = crypto.randomUUID();
    const inviteExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 ngày

    const user = await prisma.user.create({
      data: {
        username,
        inviteToken,
        inviteExpiry,
      },
    });

    const inviteUrl = `${process.env.NEXT_PUBLIC_APP_URL}/invite/${inviteToken}`;

    return NextResponse.json({
      user: { id: user.id, username: user.username },
      inviteUrl,
      expiresAt: inviteExpiry.toISOString(),
    });
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
