"use client";

import { useState } from "react";

interface AdminMatchFormProps {
  match?: {
    id: string;
    teamA: string;
    teamB: string;
    kickoffTime: string;
    allowDraw: boolean;
    scoreA: number | null;
    scoreB: number | null;
    penaltyA?: number | null;
    penaltyB?: number | null;
    isCompleted: boolean;
  };
  onSubmit: (data: {
    teamA: string;
    teamB: string;
    kickoffTime: string;
    allowDraw: boolean;
  }) => Promise<void>;
  onResult?: (matchId: string, scoreA: number, scoreB: number, penaltyA?: number, penaltyB?: number) => Promise<void>;
  onClose: () => void;
}

export const AdminMatchForm = ({ match, onSubmit, onResult, onClose }: AdminMatchFormProps) => {
  const [teamA, setTeamA] = useState(match?.teamA || "");
  const [teamB, setTeamB] = useState(match?.teamB || "");
  const [kickoffTime, setKickoffTime] = useState(
    match?.kickoffTime ? new Date(match.kickoffTime).toISOString().slice(0, 16) : ""
  );
  const [allowDraw, setAllowDraw] = useState(match?.allowDraw ?? true);
  const [scoreA, setScoreA] = useState(match?.scoreA ?? 0);
  const [scoreB, setScoreB] = useState(match?.scoreB ?? 0);
  const [penaltyA, setPenaltyA] = useState(match?.penaltyA ?? 0);
  const [penaltyB, setPenaltyB] = useState(match?.penaltyB ?? 0);
  const [hasPenalty, setHasPenalty] = useState(!!(match?.penaltyA || match?.penaltyB));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showResult, setShowResult] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await onSubmit({ teamA, teamB, kickoffTime, allowDraw });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  const handleResult = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!match || !onResult) return;
    setError("");
    setLoading(true);

    try {
      await onResult(match.id, scoreA, scoreB, hasPenalty ? penaltyA : undefined, hasPenalty ? penaltyB : undefined);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-bold mb-4">
          {match ? "Sửa trận đấu" : "Tạo trận đấu"}
        </h3>

        {!showResult ? (
          <form onSubmit={handleSubmit}>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-500">Đội A (Home)</label>
                <input
                  type="text"
                  value={teamA}
                  onChange={(e) => setTeamA(e.target.value)}
                  className="w-full border rounded px-3 py-2 mt-1 dark:bg-gray-700 dark:border-gray-600"
                  required
                />
              </div>
              <div>
                <label className="text-xs text-gray-500">Đội B (Away)</label>
                <input
                  type="text"
                  value={teamB}
                  onChange={(e) => setTeamB(e.target.value)}
                  className="w-full border rounded px-3 py-2 mt-1 dark:bg-gray-700 dark:border-gray-600"
                  required
                />
              </div>
              <div>
                <label className="text-xs text-gray-500">Giờ kick-off</label>
                <input
                  type="datetime-local"
                  value={kickoffTime}
                  onChange={(e) => setKickoffTime(e.target.value)}
                  className="w-full border rounded px-3 py-2 mt-1 dark:bg-gray-700 dark:border-gray-600"
                  required
                />
              </div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={allowDraw}
                  onChange={(e) => setAllowDraw(e.target.checked)}
                  className="rounded"
                />
                <span className="text-sm">Cho phép hòa</span>
              </label>
            </div>

            {error && <p className="text-xs text-red-500 mt-3">{error}</p>}

            <div className="flex gap-2 mt-4">
              <button type="button" onClick={onClose} className="flex-1 py-2 border rounded text-sm hover:bg-gray-50 dark:hover:bg-gray-700">
                Hủy
              </button>
              {match && !match.isCompleted && (
                <button type="button" onClick={() => setShowResult(true)} className="flex-1 py-2 bg-orange-500 text-white rounded text-sm hover:bg-orange-600">
                  Nhập KQ
                </button>
              )}
              <button type="submit" disabled={loading} className="flex-1 py-2 bg-green-600 text-white rounded text-sm hover:bg-green-700 disabled:opacity-50">
                {loading ? "..." : "Lưu"}
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleResult}>
            <p className="text-sm mb-3 text-center">
              {match?.teamA} vs {match?.teamB}
            </p>
            <div className="flex items-center justify-center gap-4 mb-4">
              <input
                type="number"
                min="0"
                value={scoreA}
                onChange={(e) => setScoreA(parseInt(e.target.value) || 0)}
                className="w-16 h-12 text-center text-xl font-bold border rounded dark:bg-gray-700 dark:border-gray-600"
              />
              <span className="text-lg font-bold">-</span>
              <input
                type="number"
                min="0"
                value={scoreB}
                onChange={(e) => setScoreB(parseInt(e.target.value) || 0)}
                className="w-16 h-12 text-center text-xl font-bold border rounded dark:bg-gray-700 dark:border-gray-600"
              />
            </div>

            <label className="flex items-center gap-2 mb-3">
              <input
                type="checkbox"
                checked={hasPenalty}
                onChange={(e) => setHasPenalty(e.target.checked)}
                className="rounded"
              />
              <span className="text-sm">Có luân lưu (penalty)</span>
            </label>

            {hasPenalty && (
              <div className="flex items-center justify-center gap-4 mb-4">
                <div className="text-center">
                  <label className="text-xs text-gray-500">Pen {match?.teamA}</label>
                  <input
                    type="number"
                    min="0"
                    value={penaltyA}
                    onChange={(e) => setPenaltyA(parseInt(e.target.value) || 0)}
                    className="w-16 h-10 text-center font-bold border rounded dark:bg-gray-700 dark:border-gray-600 mt-1"
                  />
                </div>
                <span className="text-lg font-bold mt-4">-</span>
                <div className="text-center">
                  <label className="text-xs text-gray-500">Pen {match?.teamB}</label>
                  <input
                    type="number"
                    min="0"
                    value={penaltyB}
                    onChange={(e) => setPenaltyB(parseInt(e.target.value) || 0)}
                    className="w-16 h-10 text-center font-bold border rounded dark:bg-gray-700 dark:border-gray-600 mt-1"
                  />
                </div>
              </div>
            )}

            {error && <p className="text-xs text-red-500 mb-3 text-center">{error}</p>}

            <div className="flex gap-2">
              <button type="button" onClick={() => setShowResult(false)} className="flex-1 py-2 border rounded text-sm">
                Quay lại
              </button>
              <button type="submit" disabled={loading} className="flex-1 py-2 bg-orange-500 text-white rounded text-sm hover:bg-orange-600 disabled:opacity-50">
                {loading ? "..." : "Cập nhật KQ"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
