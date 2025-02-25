'use client';

import { usePathname } from 'next/navigation';
import OrderPageClient from './OrderPageClient';

export default function OrderPageRoot() {
  const pathname = usePathname();
  const id = pathname?.split('/').pop() || '';
  
  return <OrderPageClient id={id} />;
}
