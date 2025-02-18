import Link from 'next/link';
import { Search, ShoppingCart } from 'lucide-react';

export default function Navbar() {
  return (
    <nav className="border-b bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <span className="text-xl font-bold text-gray-900">VowSwap</span>
          </Link>

          {/* Search */}
          <div className="hidden flex-1 items-center justify-center px-8 sm:flex">
            <div className="relative w-full max-w-lg">
              <input
                type="text"
                placeholder="Search for wedding items..."
                className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
              />
              <button className="absolute right-3 top-1/2 -translate-y-1/2">
                <Search className="h-5 w-5 text-gray-400" />
              </button>
            </div>
          </div>

          {/* Cart */}
          <div className="flex items-center">
            <button className="relative p-2">
              <ShoppingCart className="h-6 w-6 text-gray-600" />
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-xs text-white">
                0
              </span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
