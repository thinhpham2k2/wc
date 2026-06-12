"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { AdminMatchForm } from "@/components/AdminMatchForm";
import { Toast } from "@/components/Toast";

interface Match {
  id: string;
  teamA: string;
  teamB: string;
  kickoffTime: string;
  allowDraw: boolean;
  scoreA: number | null;
  scoreB: number | null;
  isCompleted: boolean;
  externalId: number | null;
  stage: string | null;
  group: string | null;
}

export default function AdminMatchesPage() {
  const { user, loading: authLoading } = useAuth();
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [inviteUsername, setInviteUsername] = useState("");
  const [inviteLink, setInviteLink] = useState("");
  const [showInvite, setShowInvite] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const fetchMatches = async () => {
    const res = await fetch("/api/matches");
    if (res.ok) {
      const data = await res.json();
      setMatches(data.matches);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (!authLoading && user?.isAdmin) fetchMatches();
  }, [authLoading, user]);

  const handleCreate = async (data: { teamA: string; teamB: string; kickoffTime: string; allowDraw: boolean }) => {
    const res = await fetch("/api/matches", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error);
    }
    setToast({ message: "Đã tạo trận!", type: "success" });
    fetchMatches();
  };

  const handleUpdate = async (data: { teamA: string; teamB: string; kickoffTime: string; allowDraw: boolean }) => {
    if (!selectedMatch) return;
    const res = await fetch(`/api/matches/${selectedMatch.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error);
    }
    setToast({ message: "Đã cập nhật trận!", type: "success" });
    fetchMatches();
  };

  const handleResult = async (matchId: string, scoreA: number, scoreB: number, penaltyA?: number, penaltyB?: number) => {
    const res = await fetch(`/api/matches/${matchId}/result`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ scoreA, scoreB, penaltyA, penaltyB }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error);
    }
    setToast({ message: "Đã cập nhật kết quả & tính điểm!", type: "success" });
    fetchMatches();
  };

  const handleDelete = async (matchId: string) => {
    if (!confirm("Bạn chắc muốn xóa trận này?")) return;
    const res = await fetch(`/api/matches/${matchId}`, { method: "DELETE" });
    if (res.ok) {
      setToast({ message: "Đã xóa trận!", type: "success" });
      fetchMatches();
    }
  };

  const handleForceSync = async () => {
    setSyncing(true);
    try {
      const res = await fetch("/api/sync");
      const data = await res.json();
      if (!res.ok) {
        setToast({ message: data.error || "Sync thất bại", type: "error" });
        return;
      }
      setToast({ message: `Sync: ${data.synced ?? 0} trận cập nhật`, type: "success" });
      fetchMatches();
    } catch {
      setToast({ message: "Sync thất bại", type: "error" });
    } finally {
      setSyncing(false);
    }
  };

  const handleInvite = async () => {
    if (!inviteUsername.trim()) return;
    try {
      const res = await fetch("/api/invite/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: inviteUsername.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setToast({ message: data.error || "Tạo invite thất bại", type: "error" });
        return;
      }
      setInviteLink(`${window.location.origin}/invite/${data.token}`);
      setToast({ message: "Đã tạo invite link!", type: "success" });
    } catch {
      setToast({ message: "Tạo invite thất bại", type: "error" });
    }
  };

  if (authLoading || loading) {
    return <div className="text-center py-10 text-gray-400">Đang tải...</div>;
  }

  if (!user?.isAdmin) {
    return <div className="text-center py-10 text-red-500">Không có quyền truy cập</div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold">⚙️ Quản lý trận đấu</h1>
        <div className="flex gap-2">
          <button
            onClick={() => { setShowInvite(true); setInviteLink(""); setInviteUsername(""); }}
            className="text-xs bg-purple-600 text-white px-3 py-1.5 rounded hover:bg-purple-700"
          >
            🎟️ Mời người chơi
          </button>
          <button
            onClick={handleForceSync}
            disabled={syncing}
            className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {syncing ? "Đang sync..." : "🔄 Force Sync"}
          </button>
          <button
            onClick={() => setShowCreate(true)}
            className="text-xs bg-green-600 text-white px-3 py-1.5 rounded hover:bg-green-700"
          >
            + Tạo trận
          </button>
        </div>
      </div>

      <div className="space-y-2">
        {matches.map((match) => (
          <div
            key={match.id}
            className="bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700 p-3 flex items-center justify-between"
          >
            <div className="flex-1">
              <div className="flex items-center gap-2 text-sm">
                <span className="font-medium">{match.teamA}</span>
                <span className="text-gray-400">vs</span>
                <span className="font-medium">{match.teamB}</span>
                {match.isCompleted && (
                  <span className="text-green-600 font-bold ml-2">
                    {match.scoreA} - {match.scoreB}
                  </span>
                )}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {new Date(match.kickoffTime).toLocaleString("vi-VN")}
                {match.group && ` • ${match.group}`}
                {match.externalId && ` • API #${match.externalId}`}
              </div>
            </div>

            <div className="flex gap-1">
              <button
                onClick={() => setSelectedMatch(match)}
                className="text-xs px-2 py-1 border rounded hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Sửa
              </button>
              {!match.externalId && (
                <button
                  onClick={() => handleDelete(match.id)}
                  className="text-xs px-2 py-1 border border-red-200 text-red-600 rounded hover:bg-red-50 dark:hover:bg-red-900/30"
                >
                  Xóa
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {showCreate && (
        <AdminMatchForm
          onSubmit={handleCreate}
          onClose={() => setShowCreate(false)}
        />
      )}

      {selectedMatch && (
        <AdminMatchForm
          match={selectedMatch}
          onSubmit={handleUpdate}
          onResult={handleResult}
          onClose={() => setSelectedMatch(null)}
        />
      )}

      {showInvite && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-sm mx-4">
            <h3 className="font-bold mb-4">🎟️ Mời người chơi</h3>
            <input
              type="text"
              placeholder="Username"
              value={inviteUsername}
              onChange={(e) => setInviteUsername(e.target.value)}
              className="w-full border dark:border-gray-600 rounded px-3 py-2 mb-3 text-sm dark:bg-gray-700"
            />
            {inviteLink && (
              <div className="mb-3 p-2 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700 rounded text-xs break-all">
                <p className="text-green-700 dark:text-green-300 font-medium mb-1">Invite link:</p>
                <p className="text-green-600 dark:text-green-400">{inviteLink}</p>
                <button
                  onClick={() => { navigator.clipboard.writeText(inviteLink); setToast({ message: "Đã copy!", type: "success" }); }}
                  className="mt-2 text-xs bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700"
                >
                  📋 Copy
                </button>
              </div>
            )}
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowInvite(false)}
                className="text-xs px-3 py-1.5 border rounded hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Đóng
              </button>
              <button
                onClick={handleInvite}
                className="text-xs bg-purple-600 text-white px-3 py-1.5 rounded hover:bg-purple-700"
              >
                Tạo invite
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
