'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import OrderDetails from '@/components/admin/OrderDetails';
import type { Order } from '@/types/order';

export default function OrderPageClient({ id }: { id: string }) {
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) {
      router.push('/orders');
      return;
    }

    async function fetchOrder() {
      try {
        const response = await fetch(`/api/orders/auth/${id}`);
        if (!response.ok) {
          if (response.status === 401) {
            router.push('/auth/signin');
            return;
          }
          throw new Error('Failed to fetch order');
        }
        const data = await response.json();
        setOrder(data.order);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    }

    fetchOrder();
  }, [id, router]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!order) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <OrderDetails order={order} />
    </div>
  );
}
