"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Product, ProductStatus } from "@/types/product";
import { formatCurrency } from "@/lib/utils";


interface SellerProductListProps {
  products: Product[];
  sellerId: string;
}

export default function SellerProductList({ products, sellerId }: SellerProductListProps) {
  const [isUpdating, setIsUpdating] = useState<string | null>(null);

  const handleVisibilityToggle = async (productId: string, currentVisibility: boolean) => {
    setIsUpdating(productId);
    try {
      const response = await fetch(`/api/seller/products/${productId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isVisible: !currentVisibility }),
      });

      if (!response.ok) {
        throw new Error("Failed to update product visibility");
      }

      // Refresh the page to show updated data
      window.location.reload();
    } catch (error) {
      console.error("Error updating product:", error);
      alert("Failed to update product visibility");
    } finally {
      setIsUpdating(null);
    }
  };

  const getStatusColor = (status: ProductStatus) => {
    switch (status) {
      case "ACTIVE":
        return "bg-green-100 text-green-800";
      case "DRAFT":
        return "bg-yellow-100 text-yellow-800";
      case "ARCHIVED":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl md:col-span-2">
      <table className="min-w-full divide-y divide-gray-200">
        <thead>
          <tr>
            <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Product
            </th>
            <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Inventory
            </th>
            <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Price
            </th>
            <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Views
            </th>
            <th className="px-6 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {products.map((product) => (
            <tr key={product.id}>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="h-10 w-10 flex-shrink-0">
                    <Image
                      src={product.images[0] || "/placeholder.jpg"}
                      alt={product.title}
                      className="h-10 w-10 rounded-full object-cover"
                      width={40}
                      height={40}
                    />
                  </div>
                  <div className="ml-4">
                    <div className="text-sm font-medium text-gray-900">
                      {product.title}
                    </div>
                    <div className="text-sm text-gray-500">{product.category}</div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span
                  className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                    product.status
                  )}`}
                >
                  {product.status}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">{product.inventory}</div>
                {product.inventory <= 5 && (
                  <div className="text-xs text-red-500">Low stock</div>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {formatCurrency(product.price)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {product.viewCount}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div className="flex justify-end space-x-2">
                  <Link
                    href={`/seller/products/${product.id}/edit`}
                    className="text-blue-600 hover:text-blue-900"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() =>
                      handleVisibilityToggle(product.id, product.isVisible)
                    }
                    disabled={isUpdating === product.id}
                    className="text-gray-600 hover:text-gray-900 disabled:opacity-50"
                  >
                    {product.isVisible ? "Hide" : "Show"}
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {products.length === 0 && (
        <div className="text-center py-12">
          <h3 className="mt-2 text-sm font-semibold text-gray-900">
            No products
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by creating a new product.
          </p>
          <div className="mt-6">
            <Link
              href="/seller/products/new"
              className="inline-flex items-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
            >
              Add Product
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
