export type OrderStatus = 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';

export interface OrderItem {
  id: string;
  productId: string;
  orderId: string;
  quantity: number;
  price: number;
  product: {
    title: string;
    images: string[];
  };
}

export interface Order {
  id: string;
  userId: string;
  total: number;
  status: OrderStatus;
  shippingAddress: string;
  paymentIntent?: string;
  paymentStatus: string;
  trackingNumber?: string;
  notes?: string;
  emailsSent: string[];
  createdAt: Date;
  updatedAt: Date;
  items: OrderItem[];
  statusHistory: OrderStatusHistory[];
  user: {
    name?: string;
    email?: string;
  };
}

export interface OrderStatusHistory {
  id: string;
  orderId: string;
  status: OrderStatus;
  note?: string;
  createdAt: Date;
  updatedBy: string;
  user: {
    name?: string;
    email?: string;
  };
}

export interface AdminAction {
  id: string;
  userId: string;
  action: string;
  details: string;
  createdAt: Date;
  user: {
    name?: string;
    email?: string;
  };
}

export interface OrderAnalytics {
  totalOrders: number;
  totalRevenue: number;
  popularProducts: {
    productId: string;
    title: string;
    totalOrders: number;
    revenue: number;
  }[];
}

export interface OrderUpdateInput {
  status?: OrderStatus;
  trackingNumber?: string;
  notes?: string;
}

export interface AdminDashboardStats {
  totalOrders: number;
  totalRevenue: number;
  recentOrders: Order[];
  popularProducts: {
    productId: string;
    title: string;
    totalOrders: number;
    revenue: number;
  }[];
  recentActions: AdminAction[];
}

export interface OrderListResponse {
  orders: Order[];
  pagination: {
    total: number;
    pages: number;
    current: number;
  };
}

export interface OrderFilterParams {
  status?: OrderStatus;
  page?: number;
  limit?: number;
  search?: string;
  startDate?: string;
  endDate?: string;
}
