export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { calculatePoints } from "@/lib/scoring";

// PUT: Cập nhật kết quả trận đấu + tính điểm ngay lập tức
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;
    const { scoreA, scoreB, penaltyA, penaltyB } = await request.json();

    if (scoreA === undefined || scoreB === undefined) {
      return NextResponse.json(
        { error: "scoreA và scoreB là bắt buộc" },
        { status: 400 }
      );
    }

    if (scoreA < 0 || scoreB < 0) {
      return NextResponse.json(
        { error: "Tỉ số không được âm" },
        { status: 400 }
      );
    }

    if ((penaltyA !== undefined && penaltyA < 0) || (penaltyB !== undefined && penaltyB < 0)) {
      return NextResponse.json(
        { error: "Tỉ số penalty không được âm" },
        { status: 400 }
      );
    }

    const match = await prisma.match.findUnique({ where: { id } });
    if (!match) {
      return NextResponse.json({ error: "Không tìm thấy trận" }, { status: 404 });
    }

    // Cập nhật kết quả
    await prisma.match.update({
      where: { id },
      data: {
        scoreA,
        scoreB,
        penaltyA: penaltyA ?? null,
        penaltyB: penaltyB ?? null,
        isCompleted: true,
      },
    });

    // Tính điểm cho tất cả predictions của trận này
    const predictions = await prisma.prediction.findMany({
      where: { matchId: id },
    });

    for (const prediction of predictions) {
      const points = calculatePoints(
        prediction.predictedScoreA,
        prediction.predictedScoreB,
        scoreA,
        scoreB
      );

      await prisma.prediction.update({
        where: { id: prediction.id },
        data: { points },
      });
    }

    return NextResponse.json({
      message: "Đã cập nhật kết quả và tính điểm",
      matchId: id,
      scoreA,
      scoreB,
      penaltyA: penaltyA ?? null,
      penaltyB: penaltyB ?? null,
      predictionsScored: predictions.length,
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
