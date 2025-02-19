import { Product } from "./product"
import { User } from "./db"
import { ItemPriority } from "./registry"

export interface Wishlist {
  id: string
  userId: string
  title: string
  description?: string | null
  isPublic: boolean
  createdAt: Date
  updatedAt: Date
  items: WishlistItem[]
  user: User
}

export interface WishlistItem {
  id: string
  wishlistId: string
  productId: string
  priority: ItemPriority
  note?: string | null
  createdAt: Date
  updatedAt: Date
  wishlist: Wishlist
  product: Product
}

// This type is used when we only need specific product fields
export type WishlistProductSummary = {
  id: string
  title: string
  price: number
  images: string[]
  category: string
}

export interface WishlistItemWithProduct extends Omit<WishlistItem, 'product'> {
  product: WishlistProductSummary
}

export interface CreateWishlistRequest {
  title: string
  description?: string
  isPublic?: boolean
}

export interface UpdateWishlistRequest {
  title?: string
  description?: string
  isPublic?: boolean
}

export interface AddWishlistItemRequest {
  productId: string
  priority?: ItemPriority
  note?: string
}

export interface UpdateWishlistItemRequest {
  priority?: ItemPriority
  note?: string
}

export interface MoveToRegistryRequest {
  registryId: string
  priority?: ItemPriority
  note?: string
}
