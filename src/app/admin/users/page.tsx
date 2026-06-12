"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Toast } from "@/components/Toast";

interface User {
  id: string;
  username: string;
  isAdmin: boolean;
  inviteToken: string | null;
  inviteExpiry: string | null;
  passwordHash: string | null;
  createdAt: string;
}

export default function AdminUsersPage() {
  const { user, loading: authLoading } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [newUsername, setNewUsername] = useState("");
  const [creating, setCreating] = useState(false);
  const [inviteUrl, setInviteUrl] = useState("");
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const fetchUsers = async () => {
    const res = await fetch("/api/admin/users");
    if (res.ok) {
      const data = await res.json();
      setUsers(data.users);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (!authLoading && user?.isAdmin) fetchUsers();
  }, [authLoading, user]);

  const handleCreateInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUsername.trim()) return;

    setCreating(true);
    try {
      const res = await fetch("/api/invite/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: newUsername.trim() }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setInviteUrl(data.inviteUrl);
      setNewUsername("");
      setToast({ message: "Đã tạo invite link!", type: "success" });
      fetchUsers();
    } catch (err) {
      setToast({ message: err instanceof Error ? err.message : "Lỗi", type: "error" });
    } finally {
      setCreating(false);
    }
  };

  const copyInvite = () => {
    navigator.clipboard.writeText(inviteUrl);
    setToast({ message: "Đã copy link!", type: "success" });
  };

  if (authLoading || loading) {
    return <div className="text-center py-10 text-gray-400">Đang tải...</div>;
  }

  if (!user?.isAdmin) {
    return <div className="text-center py-10 text-red-500">Không có quyền truy cập</div>;
  }

  return (
    <div>
      <h1 className="text-xl font-bold mb-6">👥 Quản lý người dùng</h1>

      {/* Create invite */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700 p-4 mb-6">
        <h2 className="text-sm font-medium mb-3">Tạo invite link</h2>
        <form onSubmit={handleCreateInvite} className="flex gap-2">
          <input
            type="text"
            value={newUsername}
            onChange={(e) => setNewUsername(e.target.value)}
            placeholder="Username mới..."
            className="flex-1 border rounded px-3 py-2 text-sm dark:bg-gray-700 dark:border-gray-600"
            required
          />
          <button
            type="submit"
            disabled={creating}
            className="bg-green-600 text-white px-4 py-2 rounded text-sm hover:bg-green-700 disabled:opacity-50"
          >
            {creating ? "..." : "Tạo"}
          </button>
        </form>

        {inviteUrl && (
          <div className="mt-3 p-3 bg-green-50 dark:bg-green-900/20 rounded border border-green-200 dark:border-green-800">
            <p className="text-xs text-gray-500 mb-1">Link mời (gửi cho bạn):</p>
            <div className="flex items-center gap-2">
              <code className="flex-1 text-xs break-all">{inviteUrl}</code>
              <button
                onClick={copyInvite}
                className="text-xs bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700 shrink-0"
              >
                Copy
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Users list */}
      <div className="space-y-2">
        {users.map((u) => (
          <div
            key={u.id}
            className="bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700 p-3 flex items-center justify-between"
          >
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{u.username}</span>
                {u.isAdmin && (
                  <span className="text-xs bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300 px-1.5 py-0.5 rounded">
                    Admin
                  </span>
                )}
              </div>
              <div className="text-xs text-gray-500 mt-0.5">
                {u.passwordHash ? "✅ Đã kích hoạt" : "⏳ Chờ kích hoạt"}
                {" • "}
                {new Date(u.createdAt).toLocaleDateString("vi-VN")}
              </div>
            </div>
          </div>
        ))}
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
