import { Link } from 'react-router-dom'
import { MapPin, Phone, Mail, MessageCircle, Clock, ExternalLink } from 'lucide-react'
import { useSiteConfig } from '@/lib/config'
import { getWhatsAppLink, getPhoneLink, getFullAddress } from '@/lib/config'

export default function Footer() {
  const { data: config } = useSiteConfig()

  const waLink = getWhatsAppLink(config)
  const phoneLink = getPhoneLink(config)
  const address = getFullAddress(config)
  const mapsUrl = config?.google_maps_url || 'https://maps.app.goo.gl/dMNkKumTVDBtwT3z8'

  const year = new Date().getFullYear()

  return (
    <footer className="bg-charcoal-900 text-charcoal-300 mt-auto">
      {/* Main footer */}
      <div className="page-container py-12 lg:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="mb-4">
              <span className="font-serif text-2xl font-semibold text-ivory-50 block">
                Sandhya
              </span>
              <span className="text-[0.6rem] tracking-[0.3em] text-burgundy-400 uppercase font-medium">
                Dresses
              </span>
            </div>
            <p className="text-sm leading-relaxed text-charcoal-400 mb-6 max-w-xs">
              Premium ethnic wear boutique in Challur, Karimnagar. Sarees, salwar
              kameez, lehengas, kurtis and dress materials.
            </p>
            {waLink && (
              <a
                href={waLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded transition-colors"
              >
                <MessageCircle className="w-4 h-4" aria-hidden />
                WhatsApp Us
              </a>
            )}
          </div>

          {/* Quick links */}
          <div>
            <h3 className="text-sm font-semibold text-ivory-50 uppercase tracking-wider mb-4">
              Quick Links
            </h3>
            <ul className="space-y-2.5">
              {[
                { to: '/', label: 'Home' },
                { to: '/shop', label: 'Shop' },
                { to: '/about', label: 'About Us' },
                { to: '/contact', label: 'Contact' },
                { to: '/faq', label: 'FAQ' },
              ].map((l) => (
                <li key={l.to}>
                  <Link
                    to={l.to}
                    className="text-sm text-charcoal-400 hover:text-ivory-100 transition-colors"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-sm font-semibold text-ivory-50 uppercase tracking-wider mb-4">
              Categories
            </h3>
            <ul className="space-y-2.5">
              {[
                { slug: 'sarees', label: 'Sarees' },
                { slug: 'salwar-kameez', label: 'Salwar Kameez' },
                { slug: 'lehengas', label: 'Lehengas' },
                { slug: 'kurtis', label: 'Kurtis' },
                { slug: 'dress-materials', label: 'Dress Materials' },
              ].map((c) => (
                <li key={c.slug}>
                  <Link
                    to={`/shop?category=${c.slug}`}
                    className="text-sm text-charcoal-400 hover:text-ivory-100 transition-colors"
                  >
                    {c.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-sm font-semibold text-ivory-50 uppercase tracking-wider mb-4">
              Visit Us
            </h3>
            <ul className="space-y-3">
              <li>
                <a
                  href={mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-2.5 text-sm text-charcoal-400 hover:text-ivory-100 transition-colors group"
                >
                  <MapPin className="w-4 h-4 shrink-0 mt-0.5 text-burgundy-400" aria-hidden />
                  <span>{address}</span>
                  <ExternalLink className="w-3 h-3 shrink-0 mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity" aria-hidden />
                </a>
              </li>
              {config?.store_hours && (
                <li className="flex items-start gap-2.5 text-sm text-charcoal-400">
                  <Clock className="w-4 h-4 shrink-0 mt-0.5 text-burgundy-400" aria-hidden />
                  <span>{config.store_hours}</span>
                </li>
              )}
              {phoneLink && config?.store_phone && (
                <li>
                  <a
                    href={phoneLink}
                    className="flex items-center gap-2.5 text-sm text-charcoal-400 hover:text-ivory-100 transition-colors"
                  >
                    <Phone className="w-4 h-4 shrink-0 text-burgundy-400" aria-hidden />
                    <span>{config.store_phone}</span>
                  </a>
                </li>
              )}
              {config?.store_email && (
                <li>
                  <a
                    href={`mailto:${config.store_email}`}
                    className="flex items-center gap-2.5 text-sm text-charcoal-400 hover:text-ivory-100 transition-colors"
                  >
                    <Mail className="w-4 h-4 shrink-0 text-burgundy-400" aria-hidden />
                    <span>{config.store_email}</span>
                  </a>
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-charcoal-800">
        <div className="page-container py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-charcoal-500">
          <p>© {year} Sandhya Dresses. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link to="/privacy" className="hover:text-charcoal-300 transition-colors">
              Privacy Policy
            </Link>
            <Link to="/terms" className="hover:text-charcoal-300 transition-colors">
              Terms
            </Link>
            <Link to="/returns" className="hover:text-charcoal-300 transition-colors">
              Returns
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
