"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ProductFormData, ProductStatus } from "@/types/product";
import { formatCurrency } from "@/lib/utils";

interface ProductFormProps {
  initialData?: ProductFormData & { id?: string };
  sellerId: string;
  mode: "create" | "edit";
}

export default function ProductForm({ initialData, sellerId, mode }: ProductFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [images, setImages] = useState<string[]>(initialData?.images || []);
  const [tags, setTags] = useState<string[]>(initialData?.tags || []);
  const [isOnSale, setIsOnSale] = useState(initialData?.isOnSale || false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const data: ProductFormData = {
      title: formData.get("title") as string,
      description: formData.get("description") as string,
      price: parseFloat(formData.get("price") as string),
      category: formData.get("category") as string,
      subcategory: formData.get("subcategory") as string,
      condition: formData.get("condition") as string,
      inventory: parseInt(formData.get("inventory") as string),
      status: formData.get("status") as ProductStatus,
      images,
      tags,
      freeShipping: formData.get("freeShipping") === "true",
      isOnSale,
      salePrice: isOnSale ? parseFloat(formData.get("salePrice") as string) : undefined,
    };

    // Validate sale price
    if (isOnSale && (!data.salePrice || data.salePrice >= data.price)) {
      setError("Sale price must be lower than regular price");
      setIsSubmitting(false);
      return;
    }

    try {
      const url = mode === "create" 
        ? "/api/seller/products" 
        : `/api/seller/products/${initialData?.id}`;
      
      const response = await fetch(url, {
        method: mode === "create" ? "POST" : "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...data, sellerId }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to save product");
      }

      router.push("/seller/products");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;

    // TODO: Implement image upload to cloud storage
    // For now, we'll just use placeholder images
    setImages(prev => [...prev, "/placeholder.jpg"]);
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleTagInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const input = e.currentTarget;
      const value = input.value.trim();
      if (value && !tags.includes(value)) {
        setTags(prev => [...prev, value]);
        input.value = '';
      }
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(prev => prev.filter(tag => tag !== tagToRemove));
  };

  const getSubcategories = (category: string) => {
    switch (category) {
      case "Dresses":
        return ["Wedding Dresses", "Bridesmaid Dresses", "Reception Dresses", "Other Dresses"];
      case "Accessories":
        return ["Veils", "Hair Accessories", "Belts", "Other Accessories"];
      case "Shoes":
        return ["Bridal Shoes", "Bridesmaid Shoes", "Evening Shoes", "Other Shoes"];
      case "Jewelry":
        return ["Bridal Sets", "Necklaces", "Earrings", "Bracelets", "Other Jewelry"];
      case "Decorations":
        return ["Centerpieces", "Flowers", "Lighting", "Signs", "Other Decorations"];
      default:
        return [];
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">
            Title
          </label>
          <input
            type="text"
            name="title"
            id="title"
            required
            defaultValue={initialData?.title}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            Description
          </label>
          <textarea
            name="description"
            id="description"
            rows={4}
            required
            defaultValue={initialData?.description}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="price" className="block text-sm font-medium text-gray-700">
              Price
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500 sm:text-sm">$</span>
              </div>
              <input
                type="number"
                name="price"
                id="price"
                required
                min="0"
                step="0.01"
                defaultValue={initialData?.price}
                className="pl-7 mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label htmlFor="inventory" className="block text-sm font-medium text-gray-700">
              Inventory
            </label>
            <input
              type="number"
              name="inventory"
              id="inventory"
              required
              min="0"
              defaultValue={initialData?.inventory}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700">
              Category
            </label>
            <select
              name="category"
              id="category"
              required
              defaultValue={initialData?.category}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="">Select a category</option>
              <option value="Dresses">Dresses</option>
              <option value="Accessories">Accessories</option>
              <option value="Shoes">Shoes</option>
              <option value="Jewelry">Jewelry</option>
              <option value="Decorations">Decorations</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label htmlFor="subcategory" className="block text-sm font-medium text-gray-700">
              Subcategory
            </label>
            <select
              name="subcategory"
              id="subcategory"
              defaultValue={initialData?.subcategory}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="">Select a subcategory</option>
              {getSubcategories(initialData?.category || '').map(sub => (
                <option key={sub} value={sub}>{sub}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="condition" className="block text-sm font-medium text-gray-700">
              Condition
            </label>
            <select
              name="condition"
              id="condition"
              required
              defaultValue={initialData?.condition}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="">Select condition</option>
              <option value="New">New</option>
              <option value="Like New">Like New</option>
              <option value="Good">Good</option>
              <option value="Fair">Fair</option>
            </select>
          </div>

          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700">
              Status
            </label>
            <select
              name="status"
              id="status"
              required
              defaultValue={initialData?.status || "DRAFT"}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="DRAFT">Draft</option>
              <option value="ACTIVE">Active</option>
              <option value="ARCHIVED">Archived</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Tags</label>
          <div className="mt-2">
            <input
              type="text"
              placeholder="Type a tag and press Enter or comma"
              onKeyDown={handleTagInput}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          {tags.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {tags.map(tag => (
                <span
                  key={tag}
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="ml-1 inline-flex items-center p-0.5 text-blue-400 hover:text-blue-600"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="flex items-center">
            <input
              type="checkbox"
              name="freeShipping"
              id="freeShipping"
              value="true"
              defaultChecked={initialData?.freeShipping}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="freeShipping" className="ml-2 block text-sm text-gray-700">
              Offer free shipping
            </label>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="isOnSale"
              checked={isOnSale}
              onChange={(e) => setIsOnSale(e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="isOnSale" className="ml-2 block text-sm text-gray-700">
              Put item on sale
            </label>
          </div>

          {isOnSale && (
            <div>
              <label htmlFor="salePrice" className="block text-sm font-medium text-gray-700">
                Sale Price
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">$</span>
                </div>
                <input
                  type="number"
                  name="salePrice"
                  id="salePrice"
                  required
                  min="0"
                  step="0.01"
                  defaultValue={initialData?.salePrice}
                  className="pl-7 mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Images</label>
          <div className="mt-2 flex items-center space-x-4">
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageUpload}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>
          {images.length > 0 && (
            <div className="mt-4 grid grid-cols-3 gap-4">
              {images.map((image, index) => (
                <div key={index} className="relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={image}
                    alt={`Product image ${index + 1}`}
                    className="h-24 w-24 object-cover rounded-md"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                  >
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {isSubmitting ? "Saving..." : mode === "create" ? "Create Product" : "Save Changes"}
        </button>
      </div>
    </form>
  );
}
