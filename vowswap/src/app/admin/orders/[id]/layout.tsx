import { Metadata } from "next";
import OrderPageClient from '@/components/orders/OrderPageClient';

export const metadata: Metadata = {
  title: "Order Management - VowSwap Admin",
  description: "Manage order details on VowSwap",
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default async function OrderLayout({ params }: any) {
  return <OrderPageClient id={params.id} />;
}
