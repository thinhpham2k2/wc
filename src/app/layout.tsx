import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "WC Predict - Dự đoán World Cup 2026",
  description: "Ứng dụng dự đoán tỉ số World Cup 2026 cùng nhóm bạn",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className="dark">
      <body className="font-sans bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 min-h-screen">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
