"use client";

import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";

export const Navbar = () => {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  return (
    <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="text-lg font-bold text-green-600 dark:text-green-400">
          ⚽ WC Predict
        </Link>

        {user ? (
          <div className="flex items-center gap-4">
            <Link href="/matches" className="text-sm hover:text-green-600 dark:hover:text-green-400">
              Trận đấu
            </Link>
            <Link href="/leaderboard" className="text-sm hover:text-green-600 dark:hover:text-green-400">
              Xếp hạng
            </Link>
            <Link href="/history" className="text-sm hover:text-green-600 dark:hover:text-green-400">
              Lịch sử
            </Link>
            {user.isAdmin && (
              <Link href="/admin/matches" className="text-sm text-orange-600 hover:text-orange-700">
                Admin
              </Link>
            )}
            <div className="flex items-center gap-2 ml-2">
              <span className="text-xs text-gray-500 dark:text-gray-400">{user.username}</span>
              <button
                onClick={handleLogout}
                className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
              >
                Đăng xuất
              </button>
            </div>
          </div>
        ) : (
          <Link
            href="/login"
            className="text-sm bg-green-600 text-white px-3 py-1.5 rounded hover:bg-green-700"
          >
            Đăng nhập
          </Link>
        )}
      </div>
    </nav>
  );
};
