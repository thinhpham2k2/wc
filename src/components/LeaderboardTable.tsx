"use client";

import { LeaderboardEntry } from "@/types";

interface LeaderboardTableProps {
  entries: LeaderboardEntry[];
  compact?: boolean;
}

export const LeaderboardTable = ({ entries, compact = false }: LeaderboardTableProps) => {
  const displayEntries = compact ? entries.slice(0, 5) : entries;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-xs text-gray-500 dark:text-gray-400 border-b dark:border-gray-700">
            <th className="py-2 px-2">#</th>
            <th className="py-2 px-2">Tên</th>
            <th className="py-2 px-2 text-center">Điểm</th>
            {!compact && (
              <>
                <th className="py-2 px-2 text-center">Đúng KQ</th>
                <th className="py-2 px-2 text-center">Đúng tỉ số</th>
              </>
            )}
          </tr>
        </thead>
        <tbody>
          {displayEntries.map((entry, index) => (
            <tr
              key={entry.userId}
              className="border-b dark:border-gray-700 last:border-0"
            >
              <td className="py-2 px-2">
                {index === 0 && "🥇"}
                {index === 1 && "🥈"}
                {index === 2 && "🥉"}
                {index > 2 && index + 1}
              </td>
              <td className="py-2 px-2 font-medium">{entry.username}</td>
              <td className="py-2 px-2 text-center font-bold text-green-600 dark:text-green-400">
                {entry.totalPoints}
              </td>
              {!compact && (
                <>
                  <td className="py-2 px-2 text-center">{entry.correctResults}</td>
                  <td className="py-2 px-2 text-center">{entry.exactScores}</td>
                </>
              )}
            </tr>
          ))}
          {displayEntries.length === 0 && (
            <tr>
              <td colSpan={compact ? 3 : 5} className="py-4 text-center text-gray-400">
                Chưa có dữ liệu
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};
