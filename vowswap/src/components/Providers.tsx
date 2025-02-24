"use client";

import { CartProvider } from '@/contexts/cart';
import { SearchProvider } from '@/contexts/search';
import { SessionProvider } from 'next-auth/react';
import { Session } from 'next-auth';
import { ReactNode } from 'react';

interface ProvidersProps {
  children: ReactNode;
  session?: Session | null;
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
