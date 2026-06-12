export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

// PUT: Cập nhật trận đấu
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;
    const data = await request.json();

    const match = await prisma.match.findUnique({ where: { id } });
    if (!match) {
      return NextResponse.json({ error: "Không tìm thấy trận" }, { status: 404 });
    }

    const updated = await prisma.match.update({
      where: { id },
      data: {
        teamA: data.teamA ?? match.teamA,
        teamB: data.teamB ?? match.teamB,
        kickoffTime: data.kickoffTime ? new Date(data.kickoffTime) : match.kickoffTime,
        allowDraw: data.allowDraw ?? match.allowDraw,
      },
    });

    return NextResponse.json({ match: updated });
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

// DELETE: Xóa trận đấu
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;

    const match = await prisma.match.findUnique({ where: { id } });
    if (!match) {
      return NextResponse.json({ error: "Không tìm thấy trận" }, { status: 404 });
    }

    // Xóa predictions trước rồi xóa match
    await prisma.prediction.deleteMany({ where: { matchId: id } });
    await prisma.match.delete({ where: { id } });

    return NextResponse.json({ message: "Đã xóa trận" });
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
