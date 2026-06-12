"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";

export default function InvitePage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const params = useParams();
  const token = params.token as string;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password.length < 4) {
      setError("Password phải có ít nhất 4 ký tự");
      return;
    }

    if (password !== confirmPassword) {
      setError("Password không khớp");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/invite/redeem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Có lỗi xảy ra");
      }

      router.push("/matches");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-bold text-center mb-2">⚽ Chào mừng!</h1>
        <p className="text-sm text-gray-500 text-center mb-6">
          Đặt password để tham gia dự đoán World Cup
        </p>

        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border dark:border-gray-700">
          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-600 dark:text-gray-400">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border rounded px-3 py-2 mt-1 dark:bg-gray-700 dark:border-gray-600"
                required
                autoFocus
                minLength={4}
              />
            </div>
            <div>
              <label className="text-sm text-gray-600 dark:text-gray-400">Xác nhận password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full border rounded px-3 py-2 mt-1 dark:bg-gray-700 dark:border-gray-600"
                required
                minLength={4}
              />
            </div>
          </div>

          {error && <p className="text-sm text-red-500 mt-3">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-4 py-2.5 bg-green-600 text-white rounded font-medium hover:bg-green-700 disabled:opacity-50"
          >
            {loading ? "Đang xử lý..." : "Kích hoạt tài khoản"}
          </button>
        </form>
      </div>
    </div>
  );
}
