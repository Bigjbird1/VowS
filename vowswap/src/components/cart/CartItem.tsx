"use client";

import { CartItem as CartItemType } from "@/types/cart";
import { useCart } from "@/contexts/cart";
import Image from "next/image";

interface CartItemProps {
  item: CartItemType;
}

export function CartItem({ item }: CartItemProps) {
  const { updateQuantity, removeItem } = useCart();
  const { product, quantity } = item;

  return (
    <div className="flex items-center gap-4 py-4 border-b">
      <div className="relative w-24 h-24">
        <Image
          src={product.images[0]}
          alt={product.title}
          fill
          className="object-cover rounded-md"
        />
      </div>
      <div className="flex-1">
        <h3 className="font-medium">{product.title}</h3>
        <p className="text-sm text-gray-500">Condition: {product.condition}</p>
        <div className="flex items-center gap-4 mt-2">
          <div className="flex items-center border rounded">
            <button
              onClick={() => updateQuantity(product.id, quantity - 1)}
              className="px-3 py-1 hover:bg-gray-100"
              aria-label="Decrease quantity"
            >
              -
            </button>
            <span className="px-3 py-1 border-x">{quantity}</span>
            <button
              onClick={() => updateQuantity(product.id, quantity + 1)}
              className="px-3 py-1 hover:bg-gray-100"
              aria-label="Increase quantity"
            >
              +
            </button>
          </div>
          <button
            onClick={() => removeItem(product.id)}
            className="text-sm text-red-600 hover:text-red-800"
          >
            Remove
          </button>
        </div>
      </div>
      <div className="text-right">
        <p className="font-medium">${product.price.toFixed(2)}</p>
        <p className="text-sm text-gray-500">
          Total: ${(product.price * quantity).toFixed(2)}
        </p>
      </div>
    </div>
  );
}
