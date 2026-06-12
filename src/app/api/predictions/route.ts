export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUser } from "@/lib/auth";

// GET: Lấy danh sách predictions của user hiện tại
export async function GET() {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
    }

    const predictions = await prisma.prediction.findMany({
      where: { userId: user.id },
      include: {
        match: {
          select: {
            teamA: true,
            teamB: true,
            kickoffTime: true,
            scoreA: true,
            scoreB: true,
            penaltyA: true,
            penaltyB: true,
            isCompleted: true,
            teamACrest: true,
            teamBCrest: true,
          },
        },
      },
      orderBy: { match: { kickoffTime: "desc" } },
    });

    return NextResponse.json({ predictions });
  } catch {
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}

// POST: Tạo dự đoán
export async function POST(request: Request) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
    }

    const { matchId, predictedScoreA, predictedScoreB } = await request.json();

    if (!matchId || predictedScoreA === undefined || predictedScoreB === undefined) {
      return NextResponse.json(
        { error: "matchId, predictedScoreA, predictedScoreB là bắt buộc" },
        { status: 400 }
      );
    }

    if (predictedScoreA < 0 || predictedScoreB < 0) {
      return NextResponse.json(
        { error: "Tỉ số không được âm" },
        { status: 400 }
      );
    }

    const match = await prisma.match.findUnique({ where: { id: matchId } });
    if (!match) {
      return NextResponse.json({ error: "Không tìm thấy trận" }, { status: 404 });
    }

    // Kiểm tra đã qua giờ kick-off chưa
    if (new Date() >= match.kickoffTime) {
      return NextResponse.json(
        { error: "Trận đã bắt đầu, không thể dự đoán" },
        { status: 403 }
      );
    }

    // Kiểm tra allowDraw
    if (!match.allowDraw && predictedScoreA === predictedScoreB) {
      return NextResponse.json(
        { error: "Trận này không cho phép kết quả hòa" },
        { status: 400 }
      );
    }

    // Kiểm tra đã dự đoán chưa
    const existing = await prisma.prediction.findUnique({
      where: { userId_matchId: { userId: user.id, matchId } },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Bạn đã dự đoán trận này rồi. Dùng PUT để sửa." },
        { status: 409 }
      );
    }

    const prediction = await prisma.prediction.create({
      data: {
        userId: user.id,
        matchId,
        predictedScoreA,
        predictedScoreB,
      },
    });

    return NextResponse.json({ prediction }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}
