import { Metadata } from "next";
import OrderPageRoot from '@/components/orders/OrderPageRoot';

export const metadata: Metadata = {
  title: "Order Management - VowSwap Admin",
  description: "Manage order details on VowSwap",
};

export default function OrderPage() {
  return <OrderPageRoot />;
}
