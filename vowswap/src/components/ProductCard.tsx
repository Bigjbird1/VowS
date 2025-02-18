import Image from 'next/image';
import Link from 'next/link';
import { Product } from '@/types/product';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  return (
    <div className="group relative overflow-hidden rounded-lg border bg-white shadow-sm transition-all hover:shadow-md">
      <Link href={`/products?id=${product.id}`} className="block aspect-square relative">
        <Image
          src={product.images[0] || '/next.svg'}
          alt={product.title}
          fill
          className="object-cover transition-transform group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      </Link>
      <div className="p-4">
        <Link href={`/products?id=${product.id}`} className="block">
          <h3 className="text-lg font-medium text-gray-900 truncate">{product.title}</h3>
          <p className="mt-1 text-sm text-gray-500 truncate">{product.category}</p>
          <p className="mt-2 font-semibold text-gray-900">${product.price.toFixed(2)}</p>
        </Link>
        <div className="mt-2">
          <span className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800">
            {product.condition}
          </span>
        </div>
      </div>
    </div>
  );
}
