"use client";

import { CartProvider } from '@/contexts/cart';
import { SearchProvider } from '@/contexts/search';
import { SessionProvider } from 'next-auth/react';
import { ReactNode } from 'react';

interface ProvidersProps {
  children: ReactNode;
  session?: any; // For Next-Auth session
}

export default function Providers({ children, session }: ProvidersProps) {
  return (
    <SessionProvider session={session}>
      <CartProvider>
        <SearchProvider>
          {children}
        </SearchProvider>
      </CartProvider>
    </SessionProvider>
  );
}
