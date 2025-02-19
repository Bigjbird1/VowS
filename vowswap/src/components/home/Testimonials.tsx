export default function Testimonials() {
  const testimonials = [
    {
      quote: "VowSwap made our wedding planning so much easier. The registry feature was exactly what we needed!",
      author: "Sarah & James",
      role: "Newlyweds",
    },
    {
      quote: "As a wedding vendor, I love how easy it is to connect with couples and showcase my products.",
      author: "Emily Chen",
      role: "Wedding Vendor",
    },
    {
      quote: "The wishlist feature helped us organize everything we wanted for our special day.",
      author: "Michael & David",
      role: "Recently Married",
    },
  ]

  return (
    <div className="bg-gray-50 py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Loved by Couples & Vendors Alike
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-xl text-gray-500 sm:mt-4">
            Hear from our happy couples and trusted vendors
          </p>
        </div>

        <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="rounded-lg bg-white p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="relative">
                <svg
                  className="absolute -top-2 -left-2 h-8 w-8 text-gray-200"
                  fill="currentColor"
                  viewBox="0 0 32 32"
                  aria-hidden="true"
                >
                  <path d="M9.352 4C4.456 7.456 1 13.12 1 19.36c0 5.088 3.072 8.064 6.624 8.064 3.36 0 5.856-2.688 5.856-5.856 0-3.168-2.208-5.472-5.088-5.472-.576 0-1.344.096-1.536.192.48-3.264 3.552-7.104 6.624-9.024L9.352 4zm16.512 0c-4.8 3.456-8.256 9.12-8.256 15.36 0 5.088 3.072 8.064 6.624 8.064 3.264 0 5.856-2.688 5.856-5.856 0-3.168-2.304-5.472-5.184-5.472-.576 0-1.248.096-1.44.192.48-3.264 3.456-7.104 6.528-9.024L25.864 4z" />
                </svg>
                <p className="relative mt-4 text-lg text-gray-600">
                  {testimonial.quote}
                </p>
              </div>
              <div className="mt-6">
                <p className="font-medium text-gray-900">{testimonial.author}</p>
                <p className="text-sm text-gray-500">{testimonial.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
