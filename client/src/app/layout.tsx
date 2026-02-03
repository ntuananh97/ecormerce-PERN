import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { cookies } from "next/headers";
import "./globals.css";

import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { QueryProvider } from "@/providers/QueryProvider";
import { UserInitializer } from "@/components/features/auth/UserInitializer";
import { STORAGE_KEYS } from "@/constants/api.constants";
import type { UserInfo } from "@/types/api.types";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Store - Modern E-commerce",
  description: "A modern e-commerce store built with Next.js and shadcn/ui",
};

/**
 * Helper: Parse user_info from cookie string
 */
function parseUserInfo(cookieValue: string | undefined): UserInfo | null {
  if (!cookieValue) return null;

  try {
    return JSON.parse(cookieValue) as UserInfo;
  } catch (error) {
    console.error("[RootLayout] Failed to parse user_info cookie:", error);
    return null;
  }
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Read user_info cookie on the server for SSR hydration
  // This enables "Optimistic UI" - user sees their avatar immediately
  const cookieStore = await cookies();
  const userInfoCookie = cookieStore.get(STORAGE_KEYS.USER_INFO);
  const initialUser = parseUserInfo(userInfoCookie?.value);

  // Mock cart item count - in a real app this would come from state/context
  const cartItemCount = 3;

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}
        suppressHydrationWarning
      >
        <QueryProvider>
          {/* UserInitializer hydrates the store and triggers background revalidation */}
          <UserInitializer initialUser={initialUser} />
          <div className="flex min-h-screen flex-col">
            <Navbar cartItemCount={cartItemCount} />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
        </QueryProvider>
      </body>
    </html>
  );
}
