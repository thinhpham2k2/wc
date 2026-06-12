"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(username, password);
      router.push("/matches");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Đăng nhập thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-bold text-center mb-6">⚽ Đăng nhập</h1>

        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border dark:border-gray-700">
          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-600 dark:text-gray-400">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full border rounded px-3 py-2 mt-1 dark:bg-gray-700 dark:border-gray-600"
                required
                autoFocus
              />
            </div>
            <div>
              <label className="text-sm text-gray-600 dark:text-gray-400">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border rounded px-3 py-2 mt-1 dark:bg-gray-700 dark:border-gray-600"
                required
              />
            </div>
          </div>

          {error && <p className="text-sm text-red-500 mt-3">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-4 py-2.5 bg-green-600 text-white rounded font-medium hover:bg-green-700 disabled:opacity-50"
          >
            {loading ? "Đang xử lý..." : "Đăng nhập"}
          </button>
        </form>
      </div>
    </div>
  );
}
