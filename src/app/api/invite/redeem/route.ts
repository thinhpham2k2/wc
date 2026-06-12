export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { signToken, setAuthCookie } from "@/lib/auth";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  try {
    const { token, password } = await request.json();

    if (!token || !password) {
      return NextResponse.json(
        { error: "Token và password là bắt buộc" },
        { status: 400 }
      );
    }

    if (password.length < 4) {
      return NextResponse.json(
        { error: "Password phải có ít nhất 4 ký tự" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({ where: { inviteToken: token } });

    if (!user) {
      return NextResponse.json(
        { error: "Link mời không hợp lệ" },
        { status: 404 }
      );
    }

    if (user.inviteExpiry && user.inviteExpiry < new Date()) {
      return NextResponse.json(
        { error: "Link mời đã hết hạn" },
        { status: 410 }
      );
    }

    if (user.passwordHash) {
      return NextResponse.json(
        { error: "Tài khoản đã được kích hoạt" },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        inviteToken: null,
        inviteExpiry: null,
      },
    });

    const jwtToken = await signToken({
      id: user.id,
      username: user.username,
      isAdmin: user.isAdmin,
    });

    await setAuthCookie(jwtToken);

    return NextResponse.json({
      user: { id: user.id, username: user.username, isAdmin: user.isAdmin },
    });
  } catch {
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}
