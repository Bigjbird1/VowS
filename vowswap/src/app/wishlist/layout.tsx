import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Wishlist | VowSwap",
  description: "Create and manage your wishlists on VowSwap",
}

export default function WishlistLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      {children}
    </div>
  )
}
