import { Metadata } from "next";
import OrderPageClient from '@/components/orders/OrderPageClient';

export const metadata: Metadata = {
  title: "Order Details - VowSwap Seller",
  description: "View and manage order details on VowSwap",
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default async function OrderLayout({ params }: any) {
  return <OrderPageClient id={params.id} />;
}
