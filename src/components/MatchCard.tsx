"use client";

import { Countdown } from "./Countdown";
import Image from "next/image";

interface MatchCardProps {
  match: {
    id: string;
    teamA: string;
    teamB: string;
    teamACrest: string | null;
    teamBCrest: string | null;
    kickoffTime: string;
    scoreA: number | null;
    scoreB: number | null;
    penaltyA?: number | null;
    penaltyB?: number | null;
    isCompleted: boolean;
    stage: string | null;
    group: string | null;
  };
  prediction?: {
    id: string;
    predictedScoreA: number;
    predictedScoreB: number;
    points: number | null;
  } | null;
  onPredict?: (matchId: string) => void;
  showPrediction?: boolean;
}

export const MatchCard = ({ match, prediction, onPredict, showPrediction = true }: MatchCardProps) => {
  const isLocked = new Date() >= new Date(match.kickoffTime);
  const stageLabel = match.group || match.stage?.replace(/_/g, " ") || "";

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-gray-500 dark:text-gray-400 uppercase">
          {stageLabel}
        </span>
        {!match.isCompleted && <Countdown targetDate={match.kickoffTime} />}
      </div>

      {/* Teams & Score */}
      <div className="flex items-center justify-between">
        <div className="flex-1 text-center">
          {match.teamACrest && (
            <Image src={match.teamACrest} alt={match.teamA} width={32} height={32} className="mx-auto mb-1" />
          )}
          <p className="text-sm font-medium truncate">{match.teamA}</p>
        </div>

        <div className="px-4 text-center">
          {match.isCompleted ? (
            <div>
              <div className="text-2xl font-bold">
                {match.scoreA} - {match.scoreB}
              </div>
              {match.penaltyA !== null && match.penaltyA !== undefined && (
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  (pen {match.penaltyA} - {match.penaltyB})
                </div>
              )}
            </div>
          ) : (
            <div className="text-sm text-gray-400">vs</div>
          )}
        </div>

        <div className="flex-1 text-center">
          {match.teamBCrest && (
            <Image src={match.teamBCrest} alt={match.teamB} width={32} height={32} className="mx-auto mb-1" />
          )}
          <p className="text-sm font-medium truncate">{match.teamB}</p>
        </div>
      </div>

      {/* Prediction */}
      {showPrediction && (
        <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
          {prediction ? (
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">
                Dự đoán: {prediction.predictedScoreA} - {prediction.predictedScoreB}
              </span>
              {prediction.points !== null && (
                <span className={`text-xs font-medium px-2 py-0.5 rounded ${
                  prediction.points === 3
                    ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300"
                    : prediction.points === 1
                    ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                    : "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
                }`}>
                  {prediction.points === 3 && "⭐ "}
                  {prediction.points === 1 && "✅ "}
                  {prediction.points === 0 && "❌ "}
                  +{prediction.points}
                </span>
              )}
            </div>
          ) : !isLocked ? (
            <button
              onClick={() => onPredict?.(match.id)}
              className="w-full text-xs bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 py-2 rounded hover:bg-green-100 dark:hover:bg-green-900/50"
            >
              Dự đoán ngay
            </button>
          ) : (
            <span className="text-xs text-gray-400">Không có dự đoán</span>
          )}
        </div>
      )}
    </div>
  );
};
