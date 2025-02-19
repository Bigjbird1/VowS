import Image from 'next/image';
import Link from 'next/link';
import { Product } from '@/types/product';
import { formatCurrency } from '@/lib/utils';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  return (
    <Link
      href={`/products?id=${product.id}`}
      className="group relative flex flex-col overflow-hidden rounded-lg border border-gray-200 bg-white hover:shadow-lg transition-shadow duration-200"
    >
      {/* Product Image */}
      <div className="aspect-square bg-gray-200 relative overflow-hidden">
        <Image
          src={product.images[0] || '/placeholder.jpg'}
          alt={product.title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-200"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        {product.isOnSale && (
          <div className="absolute top-2 right-2 bg-red-600 text-white px-2 py-1 rounded-md text-xs font-medium">
            Sale
          </div>
        )}
        {product.freeShipping && (
          <div className="absolute top-2 left-2 bg-green-600 text-white px-2 py-1 rounded-md text-xs font-medium">
            Free Shipping
          </div>
        )}
        {product.inventory === 0 && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <span className="text-white font-medium px-4 py-2 bg-black bg-opacity-75 rounded-md">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="flex flex-1 flex-col p-4">
        <h3 className="text-sm font-medium text-gray-900 line-clamp-2">
          {product.title}
        </h3>

        {/* Category */}
        <p className="mt-1 text-sm text-gray-500 line-clamp-1">
          {product.subcategory ? `${product.category} > ${product.subcategory}` : product.category}
        </p>

        {/* Price */}
        <div className="mt-2 flex items-center">
          {product.isOnSale && product.salePrice ? (
            <>
              <span className="text-lg font-bold text-red-600">
                {formatCurrency(product.salePrice)}
              </span>
              <span className="ml-2 text-sm text-gray-500 line-through">
                {formatCurrency(product.price)}
              </span>
            </>
          ) : (
            <span className="text-lg font-bold text-gray-900">
              {formatCurrency(product.price)}
            </span>
          )}
        </div>

        {/* Rating */}
        <div className="mt-2 flex items-center">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <svg
                key={i}
                className={`h-4 w-4 ${
                  i < Math.floor(product.rating)
                    ? 'text-yellow-400'
                    : 'text-gray-200'
                }`}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 15.934l-6.18 3.254 1.18-6.883L.001 7.522l6.902-1.002L10 .278l3.097 6.242 6.902 1.002-4.999 4.783 1.18 6.883z"
                />
              </svg>
            ))}
          </div>
          <span className="ml-1 text-sm text-gray-500">
            ({product.reviewCount})
          </span>
        </div>

        {/* Tags */}
        {product.tags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {product.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800"
              >
                {tag}
              </span>
            ))}
            {product.tags.length > 3 && (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                +{product.tags.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Condition */}
        <div className="mt-2">
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
            {product.condition}
          </span>
        </div>
      </div>
    </Link>
  );
}
