export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { fetchLiveMatches } from "@/lib/football-api";

// GET: Lấy trận đang diễn ra với tỉ số và phút hiện tại
export async function GET() {
  try {
    const liveMatches = await fetchLiveMatches();

    const matches = liveMatches.map((m) => ({
      externalId: m.id,
      teamA: m.homeTeam.shortName || m.homeTeam.name,
      teamB: m.awayTeam.shortName || m.awayTeam.name,
      teamACrest: m.homeTeam.crest,
      teamBCrest: m.awayTeam.crest,
      scoreA: m.score.fullTime.home,
      scoreB: m.score.fullTime.away,
      minute: m.minute,
      status: m.status,
      stage: m.stage,
      group: m.group,
    }));

    return NextResponse.json({ matches });
  } catch (error) {
    console.error("[Live Matches Error]", error);
    return NextResponse.json({ matches: [], error: String(error) }, { status: 500 });
  }
}
