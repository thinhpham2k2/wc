"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { MatchCard } from "@/components/MatchCard";
import { PredictionForm } from "@/components/PredictionForm";
import { Toast } from "@/components/Toast";

interface MatchWithPrediction {
  id: string;
  teamA: string;
  teamB: string;
  teamACrest: string | null;
  teamBCrest: string | null;
  kickoffTime: string;
  allowDraw: boolean;
  scoreA: number | null;
  scoreB: number | null;
  isCompleted: boolean;
  stage: string | null;
  group: string | null;
  predictions: { id: string; predictedScoreA: number; predictedScoreB: number; points: number | null }[];
}

export default function MatchesPage() {
  const { user, loading: authLoading } = useAuth();
  const [matches, setMatches] = useState<MatchWithPrediction[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMatch, setSelectedMatch] = useState<MatchWithPrediction | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const fetchMatches = async () => {
    try {
      const res = await fetch("/api/matches");
      if (res.ok) {
        const data = await res.json();
        setMatches(data.matches);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && user) fetchMatches();
  }, [authLoading, user]);

  const handlePredict = async (data: {
    matchId: string;
    predictedScoreA: number;
    predictedScoreB: number;
    predictionId?: string;
  }) => {
    const isUpdate = !!data.predictionId;
    const url = isUpdate ? `/api/predictions/${data.predictionId}` : "/api/predictions";
    const method = isUpdate ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error);
    }

    setToast({ message: isUpdate ? "Đã cập nhật dự đoán!" : "Đã lưu dự đoán!", type: "success" });
    fetchMatches();
  };

  if (authLoading || loading) {
    return <div className="text-center py-10 text-gray-400">Đang tải...</div>;
  }

  if (!user) {
    return <div className="text-center py-10 text-gray-400">Vui lòng đăng nhập</div>;
  }

  const now = new Date();
  const upcoming = matches.filter((m) => !m.isCompleted && new Date(m.kickoffTime) > now);
  const live = matches.filter((m) => !m.isCompleted && new Date(m.kickoffTime) <= now);
  const completed = matches.filter((m) => m.isCompleted);

  return (
    <div>
      <h1 className="text-xl font-bold mb-6">Trận đấu</h1>

      {live.length > 0 && (
        <section className="mb-8">
          <h2 className="text-sm font-medium text-red-500 mb-3 uppercase">🔴 Đang diễn ra</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {live.map((match) => (
              <MatchCard
                key={match.id}
                match={match}
                prediction={match.predictions[0] || null}
              />
            ))}
          </div>
        </section>
      )}

      {upcoming.length > 0 && (
        <section className="mb-8">
          <h2 className="text-sm font-medium text-green-600 dark:text-green-400 mb-3 uppercase">
            Sắp diễn ra ({upcoming.length})
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {upcoming.map((match) => (
              <MatchCard
                key={match.id}
                match={match}
                prediction={match.predictions[0] || null}
                onPredict={() => setSelectedMatch(match)}
              />
            ))}
          </div>
        </section>
      )}

      {completed.length > 0 && (
        <section>
          <h2 className="text-sm font-medium text-gray-500 mb-3 uppercase">
            Đã kết thúc ({completed.length})
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {completed.map((match) => (
              <MatchCard
                key={match.id}
                match={match}
                prediction={match.predictions[0] || null}
              />
            ))}
          </div>
        </section>
      )}

      {selectedMatch && (
        <PredictionForm
          match={selectedMatch}
          existingPrediction={selectedMatch.predictions[0] || null}
          onSubmit={handlePredict}
          onClose={() => setSelectedMatch(null)}
        />
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
