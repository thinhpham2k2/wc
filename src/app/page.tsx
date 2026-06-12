"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { MatchCard } from "@/components/MatchCard";
import { LeaderboardTable } from "@/components/LeaderboardTable";
import { LeaderboardEntry } from "@/types";
import Link from "next/link";

interface MatchData {
  id: string;
  teamA: string;
  teamB: string;
  teamACrest: string | null;
  teamBCrest: string | null;
  kickoffTime: string;
  scoreA: number | null;
  scoreB: number | null;
  isCompleted: boolean;
  stage: string | null;
  group: string | null;
}

export default function HomePage() {
  const { user } = useAuth();
  const [live, setLive] = useState<MatchData[]>([]);
  const [upcoming, setUpcoming] = useState<MatchData[]>([]);
  const [recent, setRecent] = useState<MatchData[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);

  useEffect(() => {
    if (user) {
      fetch("/api/matches")
        .then((res) => res.json())
        .then((data) => {
          const now = new Date();
          const matches = data.matches || [];
          setLive(
            matches.filter((m: MatchData) => !m.isCompleted && new Date(m.kickoffTime) <= now)
          );
          setUpcoming(
            matches
              .filter((m: MatchData) => !m.isCompleted && new Date(m.kickoffTime) > now)
              .slice(0, 4)
          );
          setRecent(
            matches
              .filter((m: MatchData) => m.isCompleted)
              .reverse()
              .slice(0, 4)
          );
        });

      fetch("/api/leaderboard")
        .then((res) => res.json())
        .then((data) => setLeaderboard(data.leaderboard || []));
    }
  }, [user]);

  return (
    <div>
      {/* Hero */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">⚽ World Cup 2026</h1>
        <p className="text-gray-500 dark:text-gray-400">
          Dự đoán tỉ số cùng nhóm bạn — tích lũy điểm — tranh ngôi vương!
        </p>
      </div>

      {/* Luật chơi */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700 p-5 mb-6">
        <h2 className="font-bold mb-3">📖 Luật chơi</h2>
        <div className="text-sm space-y-2 text-gray-600 dark:text-gray-300">
          <p>1. Dự đoán tỉ số trước giờ kick-off của mỗi trận</p>
          <p>2. Đoán đúng kết quả (thắng/thua/hòa): <span className="text-green-600 font-medium">+1 điểm</span></p>
          <p>3. Đoán đúng tỉ số chính xác: <span className="text-yellow-600 font-medium">+3 điểm ⭐</span></p>
          <p>4. Đoán sai: <span className="text-red-500">0 điểm</span></p>
          <p>5. Vòng knockout: không cho phép dự đoán kết quả hòa</p>
        </div>
      </div>

      {!user && (
        <div className="text-center mb-6">
          <Link
            href="/login"
            className="inline-block bg-green-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-green-700"
          >
            Đăng nhập để bắt đầu
          </Link>
        </div>
      )}

      {user && (
        <>
          {/* Trận đang diễn ra */}
          {live.length > 0 && (
            <section className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-bold">🔴 Đang diễn ra</h2>
                <Link href="/matches" className="text-xs text-green-600 hover:underline">
                  Xem tất cả →
                </Link>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {live.map((match) => (
                  <MatchCard key={match.id} match={match} showPrediction={false} />
                ))}
              </div>
            </section>
          )}

          {/* Trận sắp diễn ra */}
          {upcoming.length > 0 && (
            <section className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-bold">⏰ Sắp diễn ra</h2>
                <Link href="/matches" className="text-xs text-green-600 hover:underline">
                  Xem tất cả →
                </Link>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {upcoming.map((match) => (
                  <MatchCard key={match.id} match={match} showPrediction={false} />
                ))}
              </div>
            </section>
          )}

          {/* Kết quả gần nhất */}
          {recent.length > 0 && (
            <section className="mb-6">
              <h2 className="font-bold mb-3">✅ Kết quả gần nhất</h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {recent.map((match) => (
                  <MatchCard key={match.id} match={match} showPrediction={false} />
                ))}
              </div>
            </section>
          )}

          {/* Bảng xếp hạng */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-bold">🏆 Top 5</h2>
              <Link href="/leaderboard" className="text-xs text-green-600 hover:underline">
                Xem đầy đủ →
              </Link>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700 p-4">
              <LeaderboardTable entries={leaderboard} compact />
            </div>
          </section>
        </>
      )}
    </div>
  );
}
