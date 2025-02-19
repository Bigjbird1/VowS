import Link from 'next/link'
import { ShoppingBag, Gift, Store, Heart } from 'lucide-react'

const features = [
  {
    icon: ShoppingBag,
    title: 'Curated Collections',
    description: 'Discover handpicked wedding essentials and unique items.',
    link: '/products',
  },
  {
    icon: Gift,
    title: 'Wedding Registry',
    description: 'Create and manage your perfect wedding registry.',
    link: '/registry/new',
  },
  {
    icon: Store,
    title: 'Trusted Vendors',
    description: 'Connect with verified wedding vendors and artisans.',
    link: '/seller',
  },
  {
    icon: Heart,
    title: 'Wishlist',
    description: 'Save your favorite items for later.',
    link: '/wishlist',
  },
]

export default function FeaturedSections() {
  return (
    <div className="bg-white py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Everything You Need for Your Special Day
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-xl text-gray-500 sm:mt-4">
            Discover our comprehensive wedding marketplace features
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => {
            const Icon = feature.icon
            return (
              <Link
                key={feature.title}
                href={feature.link}
                className="group relative rounded-lg border border-gray-200 p-6 text-center hover:border-gray-300"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gray-50 text-gray-600 mx-auto group-hover:bg-gray-100 group-hover:text-gray-700">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="mt-4 text-lg font-medium text-gray-900">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm text-gray-500">
                  {feature.description}
                </p>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
