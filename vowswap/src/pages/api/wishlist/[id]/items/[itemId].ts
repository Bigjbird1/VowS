import { NextApiRequest, NextApiResponse } from "next"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { UpdateWishlistItemRequest } from "@/types/wishlist"

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, authOptions)
  if (!session?.user) {
    return res.status(401).json({ message: "Unauthorized" })
  }

  const { id, itemId } = req.query as { id: string; itemId: string }

  switch (req.method) {
    case "PATCH":
      try {
        const wishlist = await prisma.wishlist.findUnique({
          where: { id },
        })

        if (!wishlist) {
          return res.status(404).json({ message: "Wishlist not found" })
        }

        if (wishlist.userId !== session.user.id) {
          return res.status(401).json({ message: "Unauthorized" })
        }

        const body = req.body as UpdateWishlistItemRequest

        const item = await prisma.wishlistItem.update({
          where: { id: itemId },
          data: body,
          include: {
            product: true,
          },
        })

        return res.json(item)
      } catch (error) {
        console.error("[WISHLIST_ITEM_UPDATE]", error)
        return res.status(500).json({ message: "Internal error" })
      }

    case "DELETE":
      try {
        const wishlist = await prisma.wishlist.findUnique({
          where: { id },
        })

        if (!wishlist) {
          return res.status(404).json({ message: "Wishlist not found" })
        }

        if (wishlist.userId !== session.user.id) {
          return res.status(401).json({ message: "Unauthorized" })
        }

        await prisma.wishlistItem.delete({
          where: { id: itemId },
        })

        return res.status(204).end()
      } catch (error) {
        console.error("[WISHLIST_ITEM_DELETE]", error)
        return res.status(500).json({ message: "Internal error" })
      }

    case "POST":
      try {
        const wishlist = await prisma.wishlist.findUnique({
          where: { id },
          include: {
            items: {
              where: { id: itemId },
              include: { product: true },
            },
          },
        })

        if (!wishlist || !wishlist.items[0]) {
          return res.status(404).json({ message: "Item not found" })
        }

        if (wishlist.userId !== session.user.id) {
          return res.status(401).json({ message: "Unauthorized" })
        }

        const { registryId } = req.body

        const registry = await prisma.registry.findFirst({
          where: {
            id: registryId,
            userId: session.user.id,
          },
        })

        if (!registry) {
          return res.status(404).json({ message: "Registry not found" })
        }

        const registryItem = await prisma.registryItem.create({
          data: {
            registryId,
            productId: wishlist.items[0].productId,
            quantity: 1,
            priority: wishlist.items[0].priority,
            note: wishlist.items[0].note,
          },
          include: {
            product: true,
          },
        })

        await prisma.wishlistItem.delete({
          where: { id: itemId },
        })

        return res.json(registryItem)
      } catch (error) {
        console.error("[WISHLIST_ITEM_MOVE]", error)
        return res.status(500).json({ message: "Internal error" })
      }

    default:
      res.setHeader("Allow", ["PATCH", "DELETE", "POST"])
      return res.status(405).json({ message: `Method ${req.method} Not Allowed` })
  }
}
