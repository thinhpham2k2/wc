"use client";

import { useCountdown } from "@/hooks/useCountdown";

interface CountdownProps {
  targetDate: string | Date;
}

export const Countdown = ({ targetDate }: CountdownProps) => {
  const { days, hours, minutes, seconds, isExpired } = useCountdown(targetDate);

  if (isExpired) {
    return <span className="text-red-500 text-xs font-medium">🔒 Đã khóa</span>;
  }

  return (
    <div className="flex gap-1 text-xs">
      {days > 0 && (
        <span className="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded">
          {days}d
        </span>
      )}
      <span className="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded">
        {String(hours).padStart(2, "0")}h
      </span>
      <span className="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded">
        {String(minutes).padStart(2, "0")}m
      </span>
      <span className="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded">
        {String(seconds).padStart(2, "0")}s
      </span>
    </div>
  );
};
