"use client";

import { AuthProvider } from "@/hooks/useAuth";
import { Navbar } from "@/components/Navbar";

export const Providers = ({ children }: { children: React.ReactNode }) => {
  return (
    <AuthProvider>
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 py-6">
        {children}
      </main>
    </AuthProvider>
  );
};
