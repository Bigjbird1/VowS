import { Metadata } from "next"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import WishlistForm from "@/components/wishlist/WishlistForm"

export const metadata: Metadata = {
  title: "Create Wishlist | VowSwap",
  description: "Create your personal wishlist on VowSwap",
}

export default async function NewWishlistPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect("/auth/signin?callbackUrl=/wishlist/new")
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold text-center mb-8">Create Your Wishlist</h1>
      <div className="max-w-2xl mx-auto">
        <WishlistForm />
      </div>
    </div>
  )
}
