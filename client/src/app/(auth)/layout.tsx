/**
 * Auth Layout
 * Shared layout for authentication pages (login, register, forgot-password)
 * Provides a clean, centered layout with optional background styling
 */

import { Metadata } from 'next';

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

interface AuthLayoutProps {
  children: React.ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Background Pattern (optional decorative element) */}
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.02] pointer-events-none" />
      
      {/* Main Content */}
      <main className="relative z-10">
        {children}
      </main>
    </div>
  );
}
