import { Product } from "./product"
import { User } from "./db"

export type RegistryStatus = "ACTIVE" | "ARCHIVED"
export type PrivacyStatus = "PUBLIC" | "PRIVATE"
export type EventType = "WEDDING" | "ENGAGEMENT" | "ANNIVERSARY" | "OTHER"
export type ItemPriority = "HIGH" | "MEDIUM" | "LOW"
export type ItemStatus = "AVAILABLE" | "RESERVED" | "PURCHASED"

export interface Registry {
  id: string
  userId: string
  title: string
  eventDate: Date
  eventType: EventType
  description?: string | null
  privacyStatus: PrivacyStatus
  status: RegistryStatus
  coupleName1: string
  coupleName2?: string | null
  eventLocation: string
  coverImage?: string | null
  thankyouMessage?: string | null
  uniqueUrl: string
  createdAt: Date
  updatedAt: Date
  items: RegistryItem[]
  user: User
}

export interface RegistryItem {
  id: string
  registryId: string
  productId: string
  quantity: number
  priority: ItemPriority
  status: ItemStatus
  note?: string | null
  customItem: boolean
  customItemDetails?: any | null
  createdAt: Date
  updatedAt: Date
  registry: Registry
  product: Product
  contributions: GiftContribution[]
}

// This type is used when we only need specific product fields
export type RegistryProductSummary = {
  id: string
  title: string
  price: number
  images: string[]
  category: string
}

export interface RegistryItemWithProduct extends Omit<RegistryItem, 'product'> {
  product: RegistryProductSummary
}

export interface GiftContribution {
  id: string
  registryItemId: string
  userId: string
  amount: number
  message?: string | null
  anonymous: boolean
  createdAt: Date
  registryItem: RegistryItem
  user: User
}

export interface CreateRegistryRequest {
  title: string
  eventDate: string | Date
  eventType: EventType
  description?: string
  privacyStatus: PrivacyStatus
  coupleName1: string
  coupleName2?: string
  eventLocation: string
  coverImage?: string
  thankyouMessage?: string
}

export interface UpdateRegistryRequest {
  title?: string
  eventDate?: string | Date
  eventType?: EventType
  description?: string
  privacyStatus?: PrivacyStatus
  status?: RegistryStatus
  coupleName1?: string
  coupleName2?: string
  eventLocation?: string
  coverImage?: string
  thankyouMessage?: string
}

export interface AddRegistryItemRequest {
  productId: string
  quantity?: number
  priority?: ItemPriority
  note?: string
  customItem?: boolean
  customItemDetails?: any
}

export interface UpdateRegistryItemRequest {
  quantity?: number
  priority?: ItemPriority
  status?: ItemStatus
  note?: string
  customItemDetails?: any
}

export interface AddGiftContributionRequest {
  amount: number
  message?: string
  anonymous?: boolean
}
