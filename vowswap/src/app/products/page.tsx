'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { sampleProducts } from '@/data/sample-products';
import ProductGrid from '@/components/ProductGrid';
import { ProductFilters } from '@/types/product';

export default function ProductsPage() {
  const searchParams = useSearchParams();
  const productId = searchParams.get('id');
  const [filters, setFilters] = useState<ProductFilters>({});

  // If product ID is provided, show product detail view
  if (productId) {
    const product = sampleProducts.find((p) => p.id === productId);

    if (!product) {
      return (
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900">Product not found</h2>
          <Link href="/products" className="mt-4 text-blue-600 hover:text-blue-800">
            Back to products
          </Link>
        </div>
      );
    }

    return (
      <div className="mx-auto max-w-2xl lg:max-w-7xl">
        <Link href="/products" className="inline-block mb-8 text-blue-600 hover:text-blue-800">
          ← Back to products
        </Link>
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Product Image */}
          <div className="aspect-square relative overflow-hidden rounded-lg bg-gray-100">
            <Image
              src={product.images[0] || '/next.svg'}
              alt={product.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
              priority
            />
          </div>

          {/* Product Details */}
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{product.title}</h1>
            <div className="mt-4">
              <span className="text-2xl font-bold text-gray-900">
                ${product.price.toFixed(2)}
              </span>
            </div>
            
            <div className="mt-4 space-y-6">
              <div>
                <h3 className="text-sm font-medium text-gray-900">Category</h3>
                <p className="mt-1 text-sm text-gray-500">{product.category}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-900">Condition</h3>
                <p className="mt-1 text-sm text-gray-500">{product.condition}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-900">Description</h3>
                <p className="mt-1 text-sm text-gray-500">{product.description}</p>
              </div>
            </div>

            <div className="mt-8 flex gap-4">
              <button className="flex-1 rounded-lg bg-blue-600 px-4 py-3 text-center text-sm font-semibold text-white hover:bg-blue-700">
                Add to Cart
              </button>
              <button className="rounded-lg border border-gray-300 px-4 py-3 text-center text-sm font-semibold text-gray-700 hover:bg-gray-50">
                Contact Seller
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show product listing view
  const categories = Array.from(new Set(sampleProducts.map(p => p.category)));

  return (
    <div>
      {/* Hero Section */}
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl">
          Find Your Perfect Wedding Items
        </h1>
        <p className="mt-4 text-lg text-gray-600">
          Browse our curated collection of pre-loved wedding items
        </p>
      </div>

      {/* Category Filter */}
      <div className="mb-8">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilters({})}
            className={`rounded-full px-4 py-2 text-sm font-medium ${
              !filters.category
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
            }`}
          >
            All
          </button>
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setFilters({ ...filters, category })}
              className={`rounded-full px-4 py-2 text-sm font-medium ${
                filters.category === category
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Product Grid */}
      <ProductGrid products={sampleProducts} filters={filters} />
    </div>
  );
}
