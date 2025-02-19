import { useState } from "react"
import { RegistryItemWithProduct } from "@/types/registry"
import { useRouter } from "next/navigation"

interface ContributionModalProps {
  item: RegistryItemWithProduct
  onClose: () => void
  onSubmit: (amount: number, message?: string) => void
  maxAmount: number
}

function ContributionModal({
  item,
  onClose,
  onSubmit,
  maxAmount,
}: ContributionModalProps) {
  const [amount, setAmount] = useState<number>(maxAmount)
  const [message, setMessage] = useState<string>("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(amount, message)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h2 className="text-xl font-semibold mb-4">Contribute to Gift</h2>
        <p className="text-gray-600 mb-4">{item.product.title}</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contribution Amount
            </label>
            <div className="relative mt-1 rounded-md shadow-sm">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <span className="text-gray-500 sm:text-sm">$</span>
              </div>
              <input
                type="number"
                min={1}
                max={maxAmount}
                step={0.01}
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="block w-full rounded-md border-gray-300 pl-7 pr-12 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
            </div>
            <p className="mt-1 text-sm text-gray-500">
              Maximum contribution: ${maxAmount.toFixed(2)}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Message (Optional)
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              placeholder="Add a message to the couple..."
            />
          </div>
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Contribute
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

interface RegistryActionsProps {
  item: RegistryItemWithProduct
  isOwner: boolean
}

export default function RegistryActions({ item, isOwner }: RegistryActionsProps) {
  const [showContributionModal, setShowContributionModal] = useState(false)
  const router = useRouter()

  const handleAddToCart = async () => {
    try {
      const response = await fetch("/api/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId: item.product.id,
          quantity: 1,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to add to cart")
      }

      router.refresh()
    } catch (error) {
      console.error("Error adding to cart:", error)
      // Handle error (show toast, etc.)
    }
  }

  const handleContribute = async (amount: number, message?: string) => {
    try {
      const response = await fetch(`/api/registry/${item.registryId}/items/${item.id}/contribute`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount,
          message,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to contribute")
      }

      router.refresh()
    } catch (error) {
      console.error("Error contributing:", error)
      // Handle error (show toast, etc.)
    }
  }

  if (isOwner || item.status === "PURCHASED") {
    return null
  }

  const totalContributed = item.contributions.reduce(
    (sum: number, contribution: { amount: number }) => sum + contribution.amount,
    0
  )
  const remainingAmount = item.product.price - totalContributed

  return (
    <div className="flex space-x-2">
      <button
        onClick={handleAddToCart}
        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
      >
        Add to Cart
      </button>
      <button
        onClick={() => setShowContributionModal(true)}
        className="flex-1 px-4 py-2 border border-blue-600 text-blue-600 rounded-md hover:bg-blue-50"
      >
        Contribute
      </button>
      {showContributionModal && (
        <ContributionModal
          item={item}
          onClose={() => setShowContributionModal(false)}
          onSubmit={handleContribute}
          maxAmount={remainingAmount}
        />
      )}
    </div>
  )
}
