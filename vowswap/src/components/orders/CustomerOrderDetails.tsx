"use client";

import { useState } from "react";
import { Order, OrderStatus } from "@/types/order";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import Image from "next/image";

interface CustomerOrderDetailsProps {
  order: Order;
}

export default function CustomerOrderDetails({ order }: CustomerOrderDetailsProps) {
  const [isLoading, setIsLoading] = useState(false);
  // Rest of the component implementation
}
