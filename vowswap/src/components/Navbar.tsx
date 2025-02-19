"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { CartPreview } from "./cart/CartPreview";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const { data: session } = useSession();
  const pathname = usePathname();

  const isAdmin = session?.user?.role === "admin";
  const isActive = (path: string) => pathname === path;

  return (
    <nav className="bg-white shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Main Nav */}
          <div className="flex items-center gap-8">
            <Link href="/" className="text-xl font-bold text-blue-600">
              VowSwap
            </Link>
            <div className="hidden md:flex items-center gap-6">
              <Link
                href="/products"
                className={`text-sm font-medium ${
                  isActive("/products")
                    ? "text-blue-600"
                    : "text-gray-700 hover:text-blue-600"
                }`}
              >
                Products
              </Link>
              {session?.user && (
                <>
                  <Link
                    href="/orders"
                    className={`text-sm font-medium ${
                      isActive("/orders")
                        ? "text-blue-600"
                        : "text-gray-700 hover:text-blue-600"
                    }`}
                  >
                    My Orders
                  </Link>
                  <Link
                    href="/registry"
                    className={`text-sm font-medium ${
                      pathname.startsWith("/registry")
                        ? "text-blue-600"
                        : "text-gray-700 hover:text-blue-600"
                    }`}
                  >
                    Registry
                  </Link>
                  <Link
                    href="/wishlist"
                    className={`text-sm font-medium ${
                      pathname.startsWith("/wishlist")
                        ? "text-blue-600"
                        : "text-gray-700 hover:text-blue-600"
                    }`}
                  >
                    Wishlist
                  </Link>
                </>
              )}
              {isAdmin && (
                <Link
                  href="/admin"
                  className={`text-sm font-medium ${
                    pathname.startsWith("/admin")
                      ? "text-blue-600"
                      : "text-gray-700 hover:text-blue-600"
                  }`}
                >
                  Admin
                </Link>
              )}
            </div>
          </div>

          {/* Auth and Cart */}
          <div className="flex items-center gap-4">
            {session?.user ? (
              <div className="flex items-center gap-4">
                <CartPreview />
                <div className="relative group">
                  <button className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-blue-600">
                    {session.user.name || session.user.email}
                  </button>
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 hidden group-hover:block">
                    <Link
                      href="/profile"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Profile
                    </Link>
                    <Link
                      href="/orders"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Orders
                    </Link>
                    <Link
                      href="/registry"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Registry
                    </Link>
                    <Link
                      href="/wishlist"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Wishlist
                    </Link>
                    {isAdmin && (
                      <Link
                        href="/admin"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Admin Dashboard
                      </Link>
                    )}
                    <Link
                      href="/auth/signout"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Sign Out
                    </Link>
                  </div>
                </div>
              </div>
            ) : (
              <Link
                href="/auth/signin"
                className="text-sm font-medium text-gray-700 hover:text-blue-600"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
