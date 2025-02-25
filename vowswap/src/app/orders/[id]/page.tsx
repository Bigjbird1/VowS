import { Metadata } from "next";
import OrderPageRoot from '@/components/orders/OrderPageRoot';

export const metadata: Metadata = {
  title: "Order Details - VowSwap",
  description: "View your order details on VowSwap",
};

export default function OrderPage() {
  return <OrderPageRoot />;
}
