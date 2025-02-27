import { Product } from '@/types/product';

export const sampleProducts: Product[] = [
  {
    id: '1',
    title: 'Vintage Wedding Dress',
    description: 'Beautiful vintage-style wedding dress in excellent condition',
    price: 1200.00,
    salePrice: 999.99,
    isOnSale: true,
    images: ['/placeholder.jpg'],
    category: 'Dresses',
    subcategory: 'Wedding Dresses',
    condition: 'Like New',
    tags: ['vintage', 'wedding dress', 'ivory', 'lace'],
    rating: 4.5,
    reviewCount: 12,
    inventory: 1,
    freeShipping: true,
    sellerId: 'seller1',
    status: 'ACTIVE',
    salesCount: 0,
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
    isVisible: true,
    viewCount: 245,
  },
  {
    id: '2',
    title: 'Crystal Wedding Tiara',
    description: 'Elegant crystal tiara perfect for your special day',
    price: 299.99,
    isOnSale: false,
    images: ['/placeholder.jpg'],
    category: 'Accessories',
    subcategory: 'Hair Accessories',
    condition: 'New',
    tags: ['tiara', 'crystal', 'bridal', 'accessories'],
    rating: 5,
    reviewCount: 8,
    inventory: 3,
    freeShipping: true,
    sellerId: 'seller2',
    status: 'ACTIVE',
    salesCount: 2,
    createdAt: '2025-01-02T00:00:00Z',
    updatedAt: '2025-01-02T00:00:00Z',
    isVisible: true,
    viewCount: 156,
  },
  {
    id: '3',
    title: 'Wedding Table Centerpieces',
    description: 'Set of 10 elegant floral centerpieces',
    price: 450.00,
    salePrice: 375.00,
    isOnSale: true,
    images: ['/placeholder.jpg'],
    category: 'Decorations',
    subcategory: 'Centerpieces',
    condition: 'New',
    tags: ['centerpieces', 'floral', 'table decor'],
    rating: 4.8,
    reviewCount: 15,
    inventory: 2,
    freeShipping: false,
    sellerId: 'seller1',
    status: 'ACTIVE',
    salesCount: 3,
    createdAt: '2025-01-03T00:00:00Z',
    updatedAt: '2025-01-03T00:00:00Z',
    isVisible: true,
    viewCount: 320,
  },
  {
    id: '4',
    title: 'Bridesmaid Dresses Set',
    description: 'Set of 6 matching bridesmaid dresses in blush pink',
    price: 1800.00,
    isOnSale: false,
    images: ['/placeholder.jpg'],
    category: 'Dresses',
    subcategory: 'Bridesmaid Dresses',
    condition: 'Used - Good',
    tags: ['bridesmaid', 'dress set', 'blush pink'],
    rating: 4.2,
    reviewCount: 3,
    inventory: 1,
    freeShipping: true,
    sellerId: 'seller3',
    status: 'ACTIVE',
    salesCount: 0,
    createdAt: '2025-01-04T00:00:00Z',
    updatedAt: '2025-01-04T00:00:00Z',
    isVisible: true,
    viewCount: 178,
  },
  {
    id: '5',
    title: 'Wedding Arch',
    description: 'Beautiful metal wedding arch with floral design',
    price: 599.99,
    salePrice: 499.99,
    isOnSale: true,
    images: ['/placeholder.jpg'],
    category: 'Decorations',
    subcategory: 'Ceremony Decor',
    condition: 'Like New',
    tags: ['arch', 'ceremony', 'metal', 'floral'],
    rating: 4.7,
    reviewCount: 6,
    inventory: 0,
    freeShipping: false,
    sellerId: 'seller2',
    status: 'ACTIVE',
    salesCount: 1,
    createdAt: '2025-01-05T00:00:00Z',
    updatedAt: '2025-01-05T00:00:00Z',
    isVisible: true,
    viewCount: 289,
  },
  {
    id: '6',
    title: 'Wedding Guest Book',
    description: 'Handcrafted leather guest book with gold embossing',
    price: 89.99,
    isOnSale: false,
    images: ['/placeholder.jpg'],
    category: 'Stationery',
    subcategory: 'Guest Books',
    condition: 'New',
    tags: ['guest book', 'leather', 'handcrafted'],
    rating: 5,
    reviewCount: 4,
    inventory: 5,
    freeShipping: true,
    sellerId: 'seller1',
    status: 'ACTIVE',
    salesCount: 2,
    createdAt: '2025-01-06T00:00:00Z',
    updatedAt: '2025-01-06T00:00:00Z',
    isVisible: true,
    viewCount: 134,
  }
];
