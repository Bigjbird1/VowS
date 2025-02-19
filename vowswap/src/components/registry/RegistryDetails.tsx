import { Registry, RegistryItemWithProduct } from "@/types/registry"
import Image from "next/image"
import Link from "next/link"
import { formatDate } from "@/lib/utils"
import { useSession } from "next-auth/react"
import { useState } from "react"
import RegistryActions from "./RegistryActions"

interface RegistryDetailsProps {
  registry: Registry & {
    items: RegistryItemWithProduct[]
  }
}

export default function RegistryDetails({ registry }: RegistryDetailsProps) {
  const { data: session } = useSession()
  const isOwner = session?.user?.id === registry.userId
  const [selectedCategory, setSelectedCategory] = useState<string>("all")

  const getItemProgress = (item: RegistryItemWithProduct) => {
    const totalContributed = item.contributions.reduce(
      (sum: number, contribution: { amount: number }) => sum + contribution.amount,
      0
    )
    return {
      total: totalContributed,
      percentage: Math.min((totalContributed / item.product.price) * 100, 100),
      remaining: Math.max(item.product.price - totalContributed, 0),
    }
  }

  const categories = [
    "all",
    ...new Set(registry.items.map((item) => item.product.category)),
  ]

  const filteredItems = registry.items.filter((item) =>
    selectedCategory === "all" ? true : item.product.category === selectedCategory
  )

  const priorityOrder = {
    "HIGH": 0,
    "MEDIUM": 1,
    "LOW": 2,
  } as const

  const sortedItems = [...filteredItems].sort((a, b) => {
    // First sort by priority
    const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority]
    if (priorityDiff !== 0) return priorityDiff

    // Then sort by status (available first)
    if (a.status !== b.status) {
      return a.status === "AVAILABLE" ? -1 : 1
    }

    // Finally sort by price
    return b.product.price - a.product.price
  })

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Registry Header */}
      <div className="mb-8">
        {registry.coverImage && (
          <div className="relative h-64 w-full mb-6 rounded-lg overflow-hidden">
            <Image
              src={registry.coverImage}
              alt={registry.title}
              fill
              className="object-cover"
            />
          </div>
        )}
        <h1 className="text-3xl font-bold mb-4">{registry.title}</h1>
        <div className="flex items-center space-x-4 text-gray-600 mb-4">
          <span>{formatDate(registry.eventDate)}</span>
          <span>•</span>
          <span>{registry.eventLocation}</span>
        </div>
        <p className="text-gray-600 mb-6">{registry.description}</p>
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <h2 className="font-semibold">{registry.coupleName1}</h2>
            {registry.coupleName2 && (
              <>
                <span className="mx-2">&</span>
                <h2 className="font-semibold">{registry.coupleName2}</h2>
              </>
            )}
          </div>
          {isOwner && (
            <Link
              href={`/registry/${registry.id}/edit`}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Edit Registry
            </Link>
          )}
        </div>
      </div>

      {/* Category Filter */}
      <div className="mb-8">
        <div className="flex space-x-4 overflow-x-auto pb-2">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full whitespace-nowrap ${
                selectedCategory === category
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedItems.map((item) => {
          const progress = getItemProgress(item)
          return (
            <div
              key={item.id}
              className="border rounded-lg overflow-hidden bg-white"
            >
              <div className="relative h-48">
                <Image
                  src={item.product.images[0] || "/placeholder.jpg"}
                  alt={item.product.title}
                  fill
                  className="object-cover"
                />
                {item.priority === "HIGH" && (
                  <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs">
                    High Priority
                  </div>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-semibold mb-2">{item.product.title}</h3>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">
                    ${item.product.price.toFixed(2)}
                  </span>
                  <span
                    className={`text-sm ${
                      item.status === "PURCHASED"
                        ? "text-green-600"
                        : item.status === "RESERVED"
                        ? "text-orange-600"
                        : "text-blue-600"
                    }`}
                  >
                    {item.status}
                  </span>
                </div>
                {item.status !== "PURCHASED" && (
                  <div className="mb-4">
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-600"
                        style={{ width: `${progress.percentage}%` }}
                      />
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      ${progress.remaining.toFixed(2)} remaining
                    </div>
                  </div>
                )}
                {item.note && (
                  <p className="text-sm text-gray-600 mb-4">{item.note}</p>
                )}
                <RegistryActions item={item} isOwner={isOwner} />
              </div>
            </div>
          )
        })}
      </div>

      {/* Empty State */}
      {sortedItems.length === 0 && (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No items found
          </h3>
          <p className="text-gray-600">
            {selectedCategory === "all"
              ? "This registry has no items yet."
              : "No items found in this category."}
          </p>
        </div>
      )}
    </div>
  )
}
