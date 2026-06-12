"use client";

import { useState } from "react";

interface PredictionFormProps {
  match: {
    id: string;
    teamA: string;
    teamB: string;
    allowDraw: boolean;
  };
  existingPrediction?: {
    id: string;
    predictedScoreA: number;
    predictedScoreB: number;
  } | null;
  onSubmit: (data: { matchId: string; predictedScoreA: number; predictedScoreB: number; predictionId?: string }) => Promise<void>;
  onClose: () => void;
}

export const PredictionForm = ({ match, existingPrediction, onSubmit, onClose }: PredictionFormProps) => {
  const [scoreA, setScoreA] = useState(existingPrediction?.predictedScoreA ?? 0);
  const [scoreB, setScoreB] = useState(existingPrediction?.predictedScoreB ?? 0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!match.allowDraw && scoreA === scoreB) {
      setError("Trận này không cho phép kết quả hòa");
      return;
    }

    setLoading(true);
    try {
      await onSubmit({
        matchId: match.id,
        predictedScoreA: scoreA,
        predictedScoreB: scoreB,
        predictionId: existingPrediction?.id,
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-sm">
        <h3 className="text-lg font-bold mb-4 text-center">Dự đoán tỉ số</h3>

        <form onSubmit={handleSubmit}>
          <div className="flex items-center justify-between gap-4 mb-4">
            <div className="text-center flex-1">
              <p className="text-sm font-medium mb-2">{match.teamA}</p>
              <input
                type="number"
                min="0"
                max="20"
                value={scoreA}
                onChange={(e) => setScoreA(parseInt(e.target.value) || 0)}
                className="w-16 h-12 text-center text-xl font-bold border rounded mx-auto block dark:bg-gray-700 dark:border-gray-600"
              />
            </div>

            <span className="text-gray-400 text-lg font-bold">-</span>

            <div className="text-center flex-1">
              <p className="text-sm font-medium mb-2">{match.teamB}</p>
              <input
                type="number"
                min="0"
                max="20"
                value={scoreB}
                onChange={(e) => setScoreB(parseInt(e.target.value) || 0)}
                className="w-16 h-12 text-center text-xl font-bold border rounded mx-auto block dark:bg-gray-700 dark:border-gray-600"
              />
            </div>
          </div>

          {!match.allowDraw && (
            <p className="text-xs text-orange-500 text-center mb-3">
              ⚠️ Trận này không cho phép hòa (vòng knockout)
            </p>
          )}

          {error && (
            <p className="text-xs text-red-500 text-center mb-3">{error}</p>
          )}

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 border rounded text-sm hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2 bg-green-600 text-white rounded text-sm hover:bg-green-700 disabled:opacity-50"
            >
              {loading ? "..." : existingPrediction ? "Cập nhật" : "Xác nhận"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
