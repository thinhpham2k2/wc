export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUser, requireAdmin } from "@/lib/auth";

// GET: Lấy danh sách trận đấu
export async function GET() {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
    }

    const matches = await prisma.match.findMany({
      orderBy: { kickoffTime: "asc" },
      include: {
        predictions: user
          ? { where: { userId: user.id }, select: { id: true, predictedScoreA: true, predictedScoreB: true, points: true } }
          : undefined,
      },
    });

    return NextResponse.json({ matches });
  } catch {
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}

// POST: Tạo trận đấu (Admin)
export async function POST(request: Request) {
  try {
    await requireAdmin();

    const { teamA, teamB, kickoffTime, allowDraw } = await request.json();

    if (!teamA || !teamB || !kickoffTime) {
      return NextResponse.json(
        { error: "teamA, teamB, kickoffTime là bắt buộc" },
        { status: 400 }
      );
    }

    const match = await prisma.match.create({
      data: {
        teamA,
        teamB,
        kickoffTime: new Date(kickoffTime),
        allowDraw: allowDraw ?? true,
      },
    });

    return NextResponse.json({ match }, { status: 201 });
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
