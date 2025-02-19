import { ReactNode } from "react"
import Link from "next/link"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

interface RegistryLayoutProps {
  children: ReactNode
}

export default async function RegistryLayout({ children }: RegistryLayoutProps) {
  const session = await getServerSession(authOptions)

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {session?.user && (
          <nav className="py-4">
            <ul className="flex space-x-6 text-sm">
              <li>
                <Link
                  href="/registry/new"
                  className="text-gray-600 hover:text-gray-900"
                >
                  Create Registry
                </Link>
              </li>
              <li>
                <Link
                  href="/registry/manage"
                  className="text-gray-600 hover:text-gray-900"
                >
                  Manage Registries
                </Link>
              </li>
              <li>
                <Link
                  href="/registry/search"
                  className="text-gray-600 hover:text-gray-900"
                >
                  Find Registry
                </Link>
              </li>
            </ul>
          </nav>
        )}
        <main className="py-8">
          <div className="bg-white rounded-lg shadow-sm">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
