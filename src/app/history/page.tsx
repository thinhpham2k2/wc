"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";

interface PredictionHistory {
  id: string;
  predictedScoreA: number;
  predictedScoreB: number;
  points: number | null;
  match: {
    teamA: string;
    teamB: string;
    teamACrest: string | null;
    teamBCrest: string | null;
    kickoffTime: string;
    scoreA: number | null;
    scoreB: number | null;
    isCompleted: boolean;
  };
}

export default function HistoryPage() {
  const { user, loading: authLoading } = useAuth();
  const [predictions, setPredictions] = useState<PredictionHistory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && user) {
      fetch("/api/predictions")
        .then((res) => res.json())
        .then((data) => setPredictions(data.predictions))
        .finally(() => setLoading(false));
    }
  }, [authLoading, user]);

  if (authLoading || loading) {
    return <div className="text-center py-10 text-gray-400">Đang tải...</div>;
  }

  if (!user) {
    return <div className="text-center py-10 text-gray-400">Vui lòng đăng nhập</div>;
  }

  const totalPoints = predictions.reduce((sum, p) => sum + (p.points || 0), 0);
  const correctResults = predictions.filter((p) => p.points !== null && p.points >= 1).length;
  const exactScores = predictions.filter((p) => p.points === 3).length;

  return (
    <div>
      <h1 className="text-xl font-bold mb-4">📋 Lịch sử dự đoán</h1>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700 p-3 text-center">
          <p className="text-2xl font-bold text-green-600">{totalPoints}</p>
          <p className="text-xs text-gray-500">Tổng điểm</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700 p-3 text-center">
          <p className="text-2xl font-bold text-blue-600">{correctResults}</p>
          <p className="text-xs text-gray-500">Đúng KQ</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700 p-3 text-center">
          <p className="text-2xl font-bold text-yellow-600">{exactScores}</p>
          <p className="text-xs text-gray-500">Đúng tỉ số</p>
        </div>
      </div>

      {/* Predictions list */}
      <div className="space-y-2">
        {predictions.map((p) => (
          <div
            key={p.id}
            className="bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700 p-3 flex items-center justify-between"
          >
            <div className="flex-1">
              <div className="flex items-center gap-2 text-sm">
                <span className="font-medium">{p.match.teamA}</span>
                <span className="text-gray-400">vs</span>
                <span className="font-medium">{p.match.teamB}</span>
              </div>
              <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                <span>
                  Dự đoán: <span className="font-medium">{p.predictedScoreA} - {p.predictedScoreB}</span>
                </span>
                {p.match.isCompleted && (
                  <span>
                    Kết quả: <span className="font-medium">{p.match.scoreA} - {p.match.scoreB}</span>
                  </span>
                )}
              </div>
            </div>

            {p.points !== null && (
              <span className={`text-sm font-bold px-2 py-1 rounded ${
                p.points === 3
                  ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300"
                  : p.points === 1
                  ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                  : "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
              }`}>
                {p.points === 3 && "⭐ "}
                {p.points === 1 && "✅ "}
                {p.points === 0 && "❌ "}
                +{p.points}
              </span>
            )}
            {!p.match.isCompleted && (
              <span className="text-xs text-gray-400">Chờ KQ</span>
            )}
          </div>
        ))}

        {predictions.length === 0 && (
          <div className="text-center py-10 text-gray-400">
            Bạn chưa dự đoán trận nào
          </div>
        )}
      </div>
    </div>
  );
}
