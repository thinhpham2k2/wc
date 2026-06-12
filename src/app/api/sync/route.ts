export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { fetchFinishedMatches } from "@/lib/football-api";
import { calculatePoints } from "@/lib/scoring";
import { requireAdmin } from "@/lib/auth";

// GET: Cron job sync kết quả từ football-data.org
// Có thể gọi qua Vercel Cron (dùng CRON_SECRET) hoặc admin đã login
export async function GET(request: Request) {
  try {
    // Verify: cron secret HOẶC admin đã login
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      // Không có cron secret hợp lệ → kiểm tra admin session
      try {
        await requireAdmin();
      } catch {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }

    // Lấy trận đã kết thúc từ API
    const finishedMatches = await fetchFinishedMatches();

    if (finishedMatches.length === 0) {
      return NextResponse.json({ message: "Không có trận mới kết thúc", synced: 0 });
    }

    let syncedCount = 0;

    for (const apiMatch of finishedMatches) {
      const scoreA = apiMatch.score.fullTime.home;
      const scoreB = apiMatch.score.fullTime.away;
      const penaltyA = apiMatch.score.penalties?.home ?? null;
      const penaltyB = apiMatch.score.penalties?.away ?? null;

      if (scoreA === null || scoreB === null) continue;

      // Tìm trận trong DB theo externalId, chưa có kết quả
      const match = await prisma.match.findFirst({
        where: {
          externalId: apiMatch.id,
          isCompleted: false,
        },
      });

      if (!match) continue;

      // Cập nhật kết quả
      await prisma.match.update({
        where: { id: match.id },
        data: { scoreA, scoreB, penaltyA, penaltyB, isCompleted: true },
      });

      // Tính điểm cho TẤT CẢ predictions của trận này ngay lập tức
      const predictions = await prisma.prediction.findMany({
        where: { matchId: match.id },
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

      syncedCount++;
      console.log(
        `[Sync] ${match.teamA} ${scoreA}-${scoreB} ${match.teamB} | ${predictions.length} predictions scored`
      );
    }

    return NextResponse.json({
      message: `Sync hoàn tất`,
      synced: syncedCount,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[Sync Error]", error);
    return NextResponse.json(
      { error: "Sync thất bại", detail: String(error) },
      { status: 500 }
    );
  }
}
