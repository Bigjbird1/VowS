import Link from 'next/link'
import PlaceholderHeroBackground from './PlaceholderHeroBackground'

export default function Hero() {
  return (
    <div className="relative h-[600px] w-full overflow-hidden">
      <PlaceholderHeroBackground />
      
      {/* Hero Content */}
      <div className="relative z-10 flex h-full flex-col items-center justify-center px-4 text-center text-white">
        <h1 className="mb-6 text-5xl font-bold leading-tight md:text-6xl">
          Your Perfect Wedding Journey Starts Here
        </h1>
        <p className="mb-8 text-xl md:text-2xl">
          Discover unique wedding items and create your dream registry
        </p>
        <div className="flex flex-col space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0">
          <Link
            href="/products"
            className="rounded-full bg-white px-8 py-3 text-lg font-semibold text-gray-900 transition hover:bg-gray-100"
          >
            Explore Collections
          </Link>
          <Link
            href="/registry/new"
            className="rounded-full border-2 border-white bg-transparent px-8 py-3 text-lg font-semibold text-white transition hover:bg-white hover:text-gray-900"
          >
            Create Registry
          </Link>
        </div>
      </div>
    </div>
  )
}
