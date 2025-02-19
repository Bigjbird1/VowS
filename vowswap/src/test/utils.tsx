import React from 'react';
import { render as rtlRender } from '@testing-library/react';
import { SessionProvider } from 'next-auth/react';
import { CartProvider } from '@/contexts/cart';
import { Product } from '@/types/product';
import { Cart, CartItem } from '@/types/cart';

function render(ui: React.ReactElement, { session = null, ...options } = {}) {
  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <SessionProvider session={session}>
        <CartProvider>
          {children}
        </CartProvider>
      </SessionProvider>
    );
  }
  return rtlRender(ui, { wrapper: Wrapper, ...options });
}

// Re-export everything
export * from '@testing-library/react';

// Override render method
export { render };

export const mockSession = {
  user: {
    id: '1',
    email: 'test@example.com',
    name: 'Test User',
  },
  expires: new Date(Date.now() + 2 * 86400).toISOString(),
};

export const mockProduct: Product = {
  id: '1',
  title: 'Test Product',
  description: 'Test Description',
  price: 99.99,
  salePrice: undefined,
  isOnSale: false,
  images: ['test-image.jpg'],
  category: 'test',
  subcategory: null,
  condition: 'new',
  tags: [],
  rating: 0,
  reviewCount: 0,
  inventory: 10,
  freeShipping: false,
  sellerId: '1',
  status: 'ACTIVE',
  salesCount: 0,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  isVisible: true,
  viewCount: 0
};

export const mockCartItem: CartItem = {
  id: '1',
  product: mockProduct,
  quantity: 1
};

export const mockCart: Cart = {
  items: [mockCartItem],
  total: 99.99
};
