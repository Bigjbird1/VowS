"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

interface WishlistActionsProps {
  wishlistId: string
  itemId?: string
  isOwner: boolean
}

export default function WishlistActions({
  wishlistId,
  itemId,
  isOwner,
}: WishlistActionsProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const router = useRouter()

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this item?")) return

    setIsDeleting(true)
    try {
      const endpoint = itemId
        ? `/api/wishlist/${wishlistId}/items/${itemId}`
        : `/api/wishlist/${wishlistId}`

      const response = await fetch(endpoint, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete")
      }

      router.refresh()
      if (!itemId) {
        router.push("/wishlist")
      }
    } catch (error) {
      console.error("Error deleting:", error)
      // Handle error (show toast, etc.)
    } finally {
      setIsDeleting(false)
    }
  }

  const handleMoveToRegistry = async () => {
    if (!itemId) return

    // Get the user's registry ID
    const registryResponse = await fetch("/api/registry")
    if (!registryResponse.ok) {
      throw new Error("Failed to fetch registry")
    }
    const registries = await registryResponse.json()
    if (!registries.length) {
      alert("Please create a registry first")
      return
    }

    try {
      const response = await fetch(`/api/wishlist/${wishlistId}/items/${itemId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          registryId: registries[0].id,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to move item to registry")
      }

      router.refresh()
    } catch (error) {
      console.error("Error moving to registry:", error)
      // Handle error (show toast, etc.)
    }
  }

  if (!isOwner) return null

  return (
    <div className="flex space-x-4">
      {itemId && (
        <button
          type="button"
          onClick={handleMoveToRegistry}
          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
        >
          Move to Registry
        </button>
      )}
      <button
        type="button"
        onClick={handleDelete}
        disabled={isDeleting}
        className="text-red-600 hover:text-red-800 text-sm font-medium"
      >
        {isDeleting ? "Deleting..." : "Delete"}
      </button>
    </div>
  )
}
