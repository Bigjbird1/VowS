"use client";

import { useCart } from "@/contexts/cart";
import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

// This is temporary until we implement the API
import { sampleProducts } from "@/data/sample-products";

export default function ProductPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);

  // Temporary: Get product from sample data
  const product = sampleProducts.find((p) => p.id === params.id);

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
          <p className="text-gray-600 mb-4">
            The product you&apos;re looking for doesn&apos;t exist.
          </p>
          <button
            onClick={() => router.push("/products")}
            className="text-blue-600 hover:text-blue-800"
          >
            Return to Products
          </button>
        </div>
      </div>
    );
  }

  const handleAddToCart = () => {
    addItem(product, quantity);
    router.push("/cart");
  };

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Product Images */}
        <div className="space-y-4">
          <div className="relative aspect-square">
            <Image
              src={product.images[selectedImage]}
              alt={product.title}
              fill
              className="object-cover rounded-lg"
            />
          </div>
          {product.images.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`relative aspect-square ${
                    selectedImage === index
                      ? "ring-2 ring-blue-600"
                      : "hover:opacity-75"
                  }`}
                >
                  <Image
                    src={image}
                    alt={`${product.title} - Image ${index + 1}`}
                    fill
                    className="object-cover rounded"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">{product.title}</h1>
            <p className="text-2xl font-medium text-blue-600 mt-2">
              ${product.price.toFixed(2)}
            </p>
          </div>

          <div>
            <h2 className="text-lg font-medium mb-2">Description</h2>
            <p className="text-gray-600">{product.description}</p>
          </div>

          <div>
            <h2 className="text-lg font-medium mb-2">Condition</h2>
            <p className="capitalize">{product.condition}</p>
          </div>

          <div className="space-y-4">
            <div>
              <label htmlFor="quantity" className="block text-sm font-medium mb-1">
                Quantity
              </label>
              <div className="flex items-center border rounded w-32">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3 py-1 hover:bg-gray-100"
                  aria-label="Decrease quantity"
                >
                  -
                </button>
                <input
                  type="number"
                  id="quantity"
                  value={quantity}
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    if (!isNaN(val) && val > 0) {
                      setQuantity(val);
                    }
                  }}
                  className="w-12 text-center border-x py-1"
                  min="1"
                />
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-3 py-1 hover:bg-gray-100"
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>
            </div>

            <button
              onClick={handleAddToCart}
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-md hover:bg-blue-700 transition-colors"
            >
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
