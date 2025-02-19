import { Order } from "@/types/order";

interface OrderStatusBadgeProps {
  status: Order["status"];
  className?: string;
}

export default function OrderStatusBadge({
  status,
  className = "",
}: OrderStatusBadgeProps) {
  const baseClasses = "px-2 py-1 rounded-full text-sm font-medium";
  const statusClasses = {
    PENDING: "bg-yellow-100 text-yellow-800",
    PROCESSING: "bg-blue-100 text-blue-800",
    SHIPPED: "bg-purple-100 text-purple-800",
    DELIVERED: "bg-green-100 text-green-800",
    CANCELLED: "bg-red-100 text-red-800",
  };

  return (
    <span className={`${baseClasses} ${statusClasses[status]} ${className}`}>
      {status}
    </span>
  );
}
