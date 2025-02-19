"use client"

import { WishlistItemWithProduct } from "@/types/wishlist"
import { formatCurrency } from "@/lib/utils"
import Image from "next/image"
import { ItemPriority } from "@/types/registry"

interface WishlistDetailsProps {
  wishlist: {
    id: string
    title: string
    description: string | null
    isPublic: boolean
    items: WishlistItemWithProduct[]
    user: {
      name: string | null
      email: string | null
    }
  }
}

const priorityLabels: Record<ItemPriority, string> = {
  HIGH: "Must Have",
  MEDIUM: "Would Like",
  LOW: "Nice to Have",
}

const priorityColors: Record<ItemPriority, string> = {
  HIGH: "bg-red-100 text-red-800",
  MEDIUM: "bg-yellow-100 text-yellow-800",
  LOW: "bg-green-100 text-green-800",
}

export default function WishlistDetails({ wishlist }: WishlistDetailsProps) {
  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">{wishlist.title}</h2>
        {wishlist.description && (
          <p className="mt-2 text-gray-600">{wishlist.description}</p>
        )}
        <div className="mt-4 flex items-center text-sm text-gray-500">
          <span>Created by {wishlist.user.name || wishlist.user.email}</span>
          <span className="mx-2">•</span>
          <span>{wishlist.isPublic ? "Public" : "Private"} Wishlist</span>
        </div>
      </div>

      <div className="divide-y divide-gray-200">
        {wishlist.items.map((item) => (
          <div key={item.id} className="py-6 flex">
            <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
              <Image
                src={item.product.images[0] || "/placeholder.jpg"}
                alt={item.product.title}
                fill
                className="object-cover object-center"
              />
            </div>
            <div className="ml-4 flex flex-1 flex-col">
              <div>
                <div className="flex justify-between">
                  <h3 className="text-lg font-medium text-gray-900">
                    {item.product.title}
                  </h3>
                  <p className="ml-4 text-lg font-medium text-gray-900">
                    {formatCurrency(item.product.price)}
                  </p>
                </div>
                <p className="mt-1 text-sm text-gray-500">
                  {item.product.category}
                </p>
              </div>
              <div className="mt-4 flex items-center">
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    priorityColors[item.priority]
                  }`}
                >
                  {priorityLabels[item.priority]}
                </span>
                {item.note && (
                  <span className="ml-4 text-sm text-gray-500">{item.note}</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {wishlist.items.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No items in this wishlist yet.</p>
        </div>
      )}
    </div>
  )
}
