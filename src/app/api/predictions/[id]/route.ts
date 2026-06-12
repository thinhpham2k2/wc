export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUser } from "@/lib/auth";

// PUT: Sửa dự đoán
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
    }

    const { id } = await params;
    const { predictedScoreA, predictedScoreB } = await request.json();

    if (predictedScoreA === undefined || predictedScoreB === undefined) {
      return NextResponse.json(
        { error: "predictedScoreA và predictedScoreB là bắt buộc" },
        { status: 400 }
      );
    }

    if (predictedScoreA < 0 || predictedScoreB < 0) {
      return NextResponse.json(
        { error: "Tỉ số không được âm" },
        { status: 400 }
      );
    }

    const prediction = await prisma.prediction.findUnique({
      where: { id },
      include: { match: true },
    });

    if (!prediction) {
      return NextResponse.json({ error: "Không tìm thấy dự đoán" }, { status: 404 });
    }

    if (prediction.userId !== user.id) {
      return NextResponse.json({ error: "Không có quyền" }, { status: 403 });
    }

    // Kiểm tra đã qua giờ kick-off chưa
    if (new Date() >= prediction.match.kickoffTime) {
      return NextResponse.json(
        { error: "Trận đã bắt đầu, không thể sửa dự đoán" },
        { status: 403 }
      );
    }

    // Kiểm tra allowDraw
    if (!prediction.match.allowDraw && predictedScoreA === predictedScoreB) {
      return NextResponse.json(
        { error: "Trận này không cho phép kết quả hòa" },
        { status: 400 }
      );
    }

    const updated = await prisma.prediction.update({
      where: { id },
      data: { predictedScoreA, predictedScoreB },
    });

    return NextResponse.json({ prediction: updated });
  } catch {
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}
