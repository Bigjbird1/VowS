import { Product, ProductFilters } from '@/types/product';
import ProductCard from './ProductCard';

interface ProductGridProps {
  products: Product[];
  filters?: ProductFilters;
}

export default function ProductGrid({ products, filters }: ProductGridProps) {
  // Apply filters if they exist
  const filteredProducts = products.filter((product) => {
    if (filters?.category && product.category !== filters.category) return false;
    if (filters?.condition && product.condition !== filters.condition) return false;
    if (filters?.minPrice && product.price < filters.minPrice) return false;
    if (filters?.maxPrice && product.price > filters.maxPrice) return false;
    return true;
  });

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {filteredProducts.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
      {filteredProducts.length === 0 && (
        <div className="col-span-full py-10 text-center">
          <p className="text-gray-500">No products found matching your criteria.</p>
        </div>
      )}
    </div>
  );
}
