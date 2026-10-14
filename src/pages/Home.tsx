import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ArrowRight, MapPin, Phone, MessageCircle } from 'lucide-react'
import { fetchProducts } from '@/lib/api'
import { useSiteConfig, getWhatsAppLink, getPhoneLink } from '@/lib/config'
import ProductGrid from '@/components/product/ProductGrid'
import { ProductGridSkeleton } from '@/components/ui/LoadingState'

const CATEGORIES = [
  { slug: 'sarees', label: 'Sarees', description: 'Silk, cotton & designer sarees' },
  { slug: 'salwar-kameez', label: 'Salwar Kameez', description: 'Anarkali, straight & palazzo sets' },
  { slug: 'lehengas', label: 'Lehengas', description: 'Bridal & party lehengas' },
  { slug: 'kurtis', label: 'Kurtis', description: 'Casual & festive kurtis' },
  { slug: 'dress-materials', label: 'Dress Materials', description: 'Fabrics for custom stitching' },
]

export default function Home() {
  const { data: config } = useSiteConfig()

  const { data: newArrivals, isLoading } = useQuery({
    queryKey: ['products', 'home'],
    queryFn: () => fetchProducts({ limit: 8 }),
  })

  const waLink = getWhatsAppLink(config)
  const phoneLink = getPhoneLink(config)

  return (
    <main>
      {/* Hero */}
      <section
        className="relative min-h-[85vh] flex items-center bg-charcoal-900 overflow-hidden"
        aria-labelledby="hero-heading"
      >
        {/* Background texture */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `radial-gradient(circle at 20% 50%, #7B1D3A 0%, transparent 60%),
                              radial-gradient(circle at 80% 20%, #C9A84C 0%, transparent 50%)`,
          }}
          aria-hidden
        />

        <div className="page-container relative z-10 py-24">
          <div className="max-w-2xl">
            <p className="text-burgundy-400 text-sm tracking-[0.3em] uppercase font-medium mb-4">
              Premium Ethnic Wear · Challur, Karimnagar
            </p>
            <h1
              id="hero-heading"
              className="font-serif text-display-xl text-ivory-50 mb-6 text-balance leading-tight"
            >
              Discover Your{' '}
              <em className="not-italic text-gold-400">Perfect Look</em>
            </h1>
            <p className="text-charcoal-300 text-lg leading-relaxed mb-10 max-w-xl">
              Sarees, salwar kameez, lehengas, kurtis and dress materials — curated for every occasion.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/shop" className="btn-primary gap-2">
                Browse Collection
                <ArrowRight className="w-4 h-4" aria-hidden />
              </Link>
              {waLink && (
                <a
                  href={waLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 border border-ivory-50/30 text-ivory-50 text-sm font-medium rounded hover:bg-white/10 transition-colors"
                >
                  <MessageCircle className="w-4 h-4" aria-hidden />
                  WhatsApp Us
                </a>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="section bg-ivory-50" aria-labelledby="categories-heading">
        <div className="page-container">
          <div className="text-center mb-10">
            <h2 id="categories-heading" className="section-title">
              Shop by Category
            </h2>
            <p className="text-charcoal-500 max-w-md mx-auto">
              From everyday kurtis to bridal lehengas — find exactly what you're looking for.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 lg:gap-4">
            {CATEGORIES.map((cat) => (
              <Link
                key={cat.slug}
                to={`/shop?category=${cat.slug}`}
                className="group relative rounded-xl border border-sand bg-white p-5 text-center hover:border-burgundy-200 hover:shadow-card-hover transition-all duration-200"
              >
                <div className="w-10 h-10 rounded-full bg-burgundy-50 flex items-center justify-center mx-auto mb-3">
                  <span className="text-burgundy-500 text-lg" aria-hidden>✦</span>
                </div>
                <h3 className="font-medium text-sm text-charcoal-800 group-hover:text-burgundy-600 transition-colors mb-1">
                  {cat.label}
                </h3>
                <p className="text-xs text-charcoal-400 leading-snug">
                  {cat.description}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* New arrivals */}
      <section className="section bg-cream" aria-labelledby="new-arrivals-heading">
        <div className="page-container">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 id="new-arrivals-heading" className="section-title mb-2">
                New Arrivals
              </h2>
              <p className="text-charcoal-500">Fresh additions to our collection</p>
            </div>
            <Link
              to="/shop"
              className="hidden sm:inline-flex items-center gap-1.5 text-sm font-medium text-burgundy-600 hover:text-burgundy-700 transition-colors"
            >
              View all
              <ArrowRight className="w-4 h-4" aria-hidden />
            </Link>
          </div>

          {isLoading ? (
            <ProductGridSkeleton count={8} />
          ) : (
            <ProductGrid products={newArrivals?.products ?? []} />
          )}

          <div className="text-center mt-10">
            <Link to="/shop" className="btn-secondary">
              View all products
            </Link>
          </div>
        </div>
      </section>

      {/* Why shop with us */}
      <section className="section bg-ivory-50" aria-labelledby="why-heading">
        <div className="page-container">
          <div className="text-center mb-12">
            <h2 id="why-heading" className="section-title">
              Why Shop with Sandhya Dresses
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                title: 'Curated Selection',
                desc: 'Carefully chosen ethnic wear for every occasion, budget, and style.',
              },
              {
                title: 'Quality Fabrics',
                desc: 'Only quality materials — silks, cottons, and synthetics that look and feel premium.',
              },
              {
                title: 'Personal Assistance',
                desc: 'Visit our store or ask on WhatsApp — we help you find the right fit and style.',
              },
              {
                title: 'Local & Trusted',
                desc: 'Serving the Challur and Karimnagar community from our store on Elabaka Road.',
              },
            ].map((item) => (
              <div key={item.title} className="text-center">
                <div className="w-12 h-px bg-burgundy-300 mx-auto mb-4" aria-hidden />
                <h3 className="font-serif text-lg font-medium text-charcoal-900 mb-2">
                  {item.title}
                </h3>
                <p className="text-sm text-charcoal-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Store location */}
      <section className="section bg-charcoal-900 text-ivory-100" aria-labelledby="store-heading">
        <div className="page-container">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 id="store-heading" className="font-serif text-display-md text-ivory-50 mb-4">
                Visit Our Store
              </h2>
              <p className="text-charcoal-300 leading-relaxed mb-8">
                We're located near Union Bank on Elabaka Road, Challur. Come in and browse
                our full collection, get styling advice, and take your pick home.
              </p>

              <ul className="space-y-4 mb-8">
                <li className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 shrink-0 mt-0.5 text-burgundy-400" aria-hidden />
                  <div>
                    <p className="text-ivory-50 font-medium">Address</p>
                    <p className="text-charcoal-300 text-sm">
                      Near Union Bank, Elabaka Road, Challur,<br />
                      Veenavanka Mandal, Karimnagar District,<br />
                      Telangana — 505505
                    </p>
                  </div>
                </li>
                {config?.store_hours && (
                  <li className="flex items-start gap-3">
                    <span className="w-5 h-5 shrink-0 mt-0.5 text-burgundy-400 text-center">⏰</span>
                    <div>
                      <p className="text-ivory-50 font-medium">Store Hours</p>
                      <p className="text-charcoal-300 text-sm">{config.store_hours}</p>
                    </div>
                  </li>
                )}
              </ul>

              <div className="flex flex-wrap gap-3">
                <a
                  href={config?.google_maps_url || 'https://maps.app.goo.gl/dMNkKumTVDBtwT3z8'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-ivory-50 text-charcoal-900 text-sm font-medium rounded hover:bg-white transition-colors"
                >
                  <MapPin className="w-4 h-4" aria-hidden />
                  Get Directions
                </a>
                {phoneLink && config?.store_phone && (
                  <a
                    href={phoneLink}
                    className="inline-flex items-center gap-2 px-5 py-2.5 border border-ivory-50/30 text-ivory-50 text-sm font-medium rounded hover:bg-white/10 transition-colors"
                  >
                    <Phone className="w-4 h-4" aria-hidden />
                    {config.store_phone}
                  </a>
                )}
              </div>
            </div>

            {/* Map embed placeholder */}
            <div className="rounded-xl overflow-hidden bg-charcoal-800 aspect-video lg:aspect-square">
              <iframe
                title="Sandhya Dresses location map"
                src={`https://maps.google.com/maps?q=Near+Union+Bank+Elabaka+Road+Challur+Telangana+505505&output=embed`}
                className="w-full h-full border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
