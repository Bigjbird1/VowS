/* eslint-disable @typescript-eslint/no-explicit-any */
import { Metadata } from "next"
import { notFound, redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import RegistryDetails from "@/components/registry/RegistryDetails"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { Registry, RegistryItemWithProduct } from "@/types/registry"

type RegistryPageProps = {
  params: Promise<{ id: string }>;
  searchParams?: { [key: string]: string | string[] | undefined };
};

type PrismaProduct = {
  id: string
  title: string
  price: number
  images: string[]
  category: string
} | null

type PrismaRegistryItem = Omit<RegistryItemWithProduct, "product"> & {
  product: PrismaProduct
  contributions: {
    amount: number
  }[]
}

function isValidRegistryItem(
  item: PrismaRegistryItem
): item is Omit<PrismaRegistryItem, "product"> & {
  product: NonNullable<PrismaProduct>
} {
  return (
    item.product !== null &&
    typeof item.product.id === "string" &&
    typeof item.product.title === "string" &&
    typeof item.product.price === "number" &&
    Array.isArray(item.product.images) &&
    typeof item.product.category === "string"
  )
}

export async function generateMetadata({
  params,
}: RegistryPageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const registry = await prisma.registry.findUnique({
    where: { id: resolvedParams.id },
    select: { title: true, description: true },
  })

  if (!registry) {
    return {
      title: "Registry Not Found | VowSwap",
    }
  }

  return {
    title: `${registry.title} | VowSwap`,
    description: registry.description || undefined,
  }
}

export default async function RegistryPage({ params }: RegistryPageProps) {
  const resolvedParams = await params;
  const session = await getServerSession(authOptions)
  const registry = await prisma.registry.findUnique({
    where: { id: resolvedParams.id },
    include: {
      items: {
        include: {
          product: {
            select: {
              id: true,
              title: true,
              price: true,
              images: true,
              category: true,
            },
          },
          contributions: {
            select: {
              amount: true,
            },
          },
        },
      },
    },
  })

  if (!registry) {
    notFound()
  }

  // Check privacy settings
  if (
    registry.privacyStatus === "PRIVATE" &&
    registry.userId !== session?.user?.id
  ) {
    if (!session) {
      redirect("/auth/signin?callbackUrl=/registry/" + resolvedParams.id)
    }
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h1 className="text-xl font-semibold text-yellow-800 mb-2">
            Private Registry
          </h1>
          <p className="text-yellow-700">
            This registry is private and can only be viewed by its owner.
          </p>
        </div>
      </div>
    )
  }

  // Filter out items with missing products and transform to RegistryItemWithProduct
  const validItems = (registry.items as PrismaRegistryItem[])
    .filter(isValidRegistryItem)
    .map((item) => ({
      ...item,
      product: item.product,
    }))

  const registryWithItems = {
    ...registry,
    items: validItems,
  } as Registry & { items: RegistryItemWithProduct[] }

  return <RegistryDetails registry={registryWithItems} />
}
