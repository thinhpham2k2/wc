export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET: Bảng xếp hạng
export async function GET() {
  try {
    const users = await prisma.user.findMany({
      where: { isAdmin: false },
      include: {
        predictions: {
          where: { points: { not: null } },
          select: { points: true },
        },
      },
    });

    const leaderboard = users
      .map((user) => {
        const predictions = user.predictions;
        const totalPoints = predictions.reduce((sum, p) => sum + (p.points || 0), 0);
        const correctResults = predictions.filter((p) => p.points !== null && p.points >= 1).length;
        const exactScores = predictions.filter((p) => p.points === 3).length;

        return {
          userId: user.id,
          username: user.username,
          totalPoints,
          correctResults,
          exactScores,
          totalPredictions: predictions.length,
        };
      })
      .sort((a, b) => b.totalPoints - a.totalPoints);

    return NextResponse.json({ leaderboard });
  } catch {
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}
