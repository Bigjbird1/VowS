import { Metadata } from 'next'
import Hero from '@/components/home/Hero'
import FeaturedSections from '@/components/home/FeaturedSections'
import Testimonials from '@/components/home/Testimonials'

export const metadata: Metadata = {
  title: 'VowSwap - Your Wedding Marketplace',
  description: 'Discover unique wedding items, create registries, and connect with trusted vendors on our comprehensive wedding marketplace.',
  openGraph: {
    title: 'VowSwap - Your Wedding Marketplace',
    description: 'Discover unique wedding items, create registries, and connect with trusted vendors on our comprehensive wedding marketplace.',
    type: 'website',
  },
}

export default function Home() {
  return (
    <main className="min-h-screen">
      <Hero />
      <FeaturedSections />
      <Testimonials />
    </main>
  )
}
