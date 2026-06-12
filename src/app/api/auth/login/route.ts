export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { signToken, setAuthCookie } from "@/lib/auth";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: "Username và password là bắt buộc" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({ where: { username } });

    if (!user || !user.passwordHash) {
      return NextResponse.json(
        { error: "Sai username hoặc password" },
        { status: 401 }
      );
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return NextResponse.json(
        { error: "Sai username hoặc password" },
        { status: 401 }
      );
    }

    const token = await signToken({
      id: user.id,
      username: user.username,
      isAdmin: user.isAdmin,
    });

    await setAuthCookie(token);

    return NextResponse.json({
      user: { id: user.id, username: user.username, isAdmin: user.isAdmin },
    });
  } catch {
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}
