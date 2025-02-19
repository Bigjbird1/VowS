import { Seller, SellerSettings, SellerAnalytics, SellerNotification, Product } from "@prisma/client";
import { OrderStatus, SellerVerificationStatus, PayoutSchedule, ProductStatus, NotificationType } from "@prisma/client";

export type SellerWithRelations = Seller & {
  products: Product[];
  settings: SellerSettings | null;
  analytics: SellerAnalytics[];
  notifications: SellerNotification[];
};

export type DashboardMetrics = {
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  productsSold: number;
  topProducts: {
    id: string;
    title: string;
    sales: number;
    revenue: number;
  }[];
  recentOrders: {
    id: string;
    date: Date;
    total: number;
    status: OrderStatus;
  }[];
  performanceMetrics: {
    viewCount: number;
    conversionRate: number;
    averageRating: number;
  };
};

export type SellerFormData = {
  storeName: string;
  description?: string;
  contactEmail: string;
  phoneNumber?: string;
};

export type ProductFormData = {
  title: string;
  description: string;
  price: number;
  images: string[];
  category: string;
  condition: string;
  inventory: number;
  status: ProductStatus;
};

export type SellerSettingsFormData = {
  payoutSchedule: PayoutSchedule;
  notifyNewOrders: boolean;
  notifyLowStock: boolean;
  lowStockThreshold: number;
  autoRelist: boolean;
};
