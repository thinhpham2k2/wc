"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { LeaderboardTable } from "@/components/LeaderboardTable";
import { LeaderboardEntry } from "@/types";

export default function LeaderboardPage() {
  const { user, loading: authLoading } = useAuth();
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && user) {
      fetch("/api/leaderboard")
        .then((res) => res.json())
        .then((data) => setEntries(data.leaderboard))
        .finally(() => setLoading(false));
    }
  }, [authLoading, user]);

  if (authLoading || loading) {
    return <div className="text-center py-10 text-gray-400">Đang tải...</div>;
  }

  if (!user) {
    return <div className="text-center py-10 text-gray-400">Vui lòng đăng nhập</div>;
  }

  return (
    <div>
      <h1 className="text-xl font-bold mb-6">🏆 Bảng xếp hạng</h1>
      <div className="bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700 p-4">
        <LeaderboardTable entries={entries} />
      </div>
    </div>
  );
}
