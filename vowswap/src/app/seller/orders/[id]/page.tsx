import { Metadata } from "next";
import OrderPageRoot from '@/components/orders/OrderPageRoot';

export const metadata: Metadata = {
  title: "Order Details - VowSwap Seller",
  description: "View and manage order details on VowSwap",
};

export default function OrderPage() {
  return <OrderPageRoot />;
}
