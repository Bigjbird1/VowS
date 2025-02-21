"use client";

import { Order, OrderStatus } from "@/types/order";
import { formatCurrency, formatDate } from "@/lib/utils";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

interface OrdersTableProps {
  orders: Order[];
}

export default function OrdersTable({ orders }: OrdersTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  // Rest of the component implementation
}
