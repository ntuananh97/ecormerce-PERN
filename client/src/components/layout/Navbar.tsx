"use client";

import Link from "next/link";
import { ShoppingCart, Menu, X, User, LogOut } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useUserStore, useIsAuthenticated, useIsHydrated } from "@/stores/userStore";
import { useAuth } from "@/hooks/useAuth";

interface NavbarProps {
  cartItemCount?: number;
}

export function Navbar({ cartItemCount = 0 }: NavbarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Use Zustand store for authentication state
  const user = useUserStore((state) => state.user);
  console.log("user", user);
  
  const isAuthenticated = useIsAuthenticated();
  const isHydrated = useIsHydrated();

  // Use useAuth hook for logout (handles clearing store, cache, and redirect)
  const { logout, isLoading: isLoggingOut } = useAuth();

  // Handle logout
  const handleLogout = async () => {
    try {
      await logout();
      setIsMobileMenuOpen(false);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/products", label: "Products" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <span className="text-lg font-bold text-primary-foreground">S</span>
            </div>
            <span className="text-xl font-bold tracking-tight">Store</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Cart & Auth & Mobile Menu Button */}
          <div className="flex items-center gap-4">
            <Link href="/cart" className="relative">
              <Button variant="ghost" size="icon" aria-label="Shopping cart">
                <ShoppingCart className="h-5 w-5" />
              </Button>
              {cartItemCount > 0 && (
                <Badge
                  variant="destructive"
                  className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full p-0 text-xs"
                >
                  {cartItemCount > 99 ? "99+" : cartItemCount}
                </Badge>
              )}
            </Link>

            {/* Auth Section - Only show after hydration to prevent flash */}
            {!isHydrated ? (
              // Skeleton while hydrating
              <div className="hidden md:block h-8 w-8 rounded-full bg-muted animate-pulse" />
            ) : !isAuthenticated ? (
              <div className="hidden md:flex items-center gap-2 text-sm">
                <Link
                  href="/register"
                  className="font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                  Register
                </Link>
                <span className="text-muted-foreground">|</span>
                <Link
                  href="/login"
                  className="font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                  Login
                </Link>
              </div>
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="cursor-pointer relative"
                    aria-label="User menu"
                    disabled={isLoggingOut}
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-medium">
                        {user?.name || <User className="h-4 w-4" />}
                      </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  {/* User info header */}
                  <div className="px-2 py-1.5 text-sm font-medium border-b mb-1">
                    {user?.name || "User"}
                  </div>
                  <DropdownMenuItem
                    className="cursor-pointer text-red-600 focus:text-red-600"
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    {isLoggingOut ? "Logging out..." : "Logout"}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="border-t pb-4 pt-4 md:hidden">
            <div className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              {/* Mobile Auth Links */}
              {isHydrated && !isAuthenticated ? (
                <>
                  <Link
                    href="/register"
                    className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Register
                  </Link>
                  <Link
                    href="/login"
                    className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Login
                  </Link>
                </>
              ) : isHydrated && isAuthenticated ? (
                <>
                  {/* User info in mobile menu */}
                  <div className="flex items-center gap-2 pb-2 border-b">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-medium">
                        {user?.name?.charAt(0).toUpperCase() || "U"}
                      </div>
                    <span className="text-sm font-medium">{user?.name || "User"}</span>
                  </div>
                  <button
                    className="text-left text-sm font-medium text-red-600 transition-colors hover:text-red-700 disabled:opacity-50"
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                  >
                    {isLoggingOut ? "Logging out..." : "Logout"}
                  </button>
                </>
              ) : null}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}

export default Navbar;
