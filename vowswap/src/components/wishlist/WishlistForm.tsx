"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"

const wishlistSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  isPublic: z.boolean().default(false),
})

type WishlistFormData = z.infer<typeof wishlistSchema>

export default function WishlistForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<WishlistFormData>({
    resolver: zodResolver(wishlistSchema),
    defaultValues: {
      isPublic: false,
    },
  })

  const onSubmit = async (data: WishlistFormData) => {
    try {
      setIsSubmitting(true)
      const response = await fetch("/api/wishlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error("Failed to create wishlist")
      }

      const wishlist = await response.json()
      router.push(`/wishlist/${wishlist.id}`)
    } catch (error) {
      console.error("Error creating wishlist:", error)
      // Handle error (show toast, etc.)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Wishlist Title
        </label>
        <input
          type="text"
          {...register("title")}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          placeholder="My Wedding Wishlist"
        />
        {errors.title && (
          <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Description (Optional)
        </label>
        <textarea
          {...register("description")}
          rows={4}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          placeholder="Add a description for your wishlist..."
        />
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          {...register("isPublic")}
          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
        <label className="ml-2 block text-sm text-gray-700">
          Make this wishlist public
        </label>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          {isSubmitting ? "Creating..." : "Create Wishlist"}
        </button>
      </div>
    </form>
  )
}
