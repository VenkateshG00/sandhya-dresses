import { MapPin, Phone, Mail, MessageCircle, Clock, ExternalLink } from 'lucide-react'
import { useSiteConfig, getWhatsAppLink, getPhoneLink, getFullAddress } from '@/lib/config'
import Breadcrumbs from '@/components/ui/Breadcrumbs'

export default function Contact() {
  const { data: config } = useSiteConfig()

  const waLink = getWhatsAppLink(config)
  const phoneLink = getPhoneLink(config)
  const address = getFullAddress(config)
  const mapsUrl = config?.google_maps_url || 'https://maps.app.goo.gl/dMNkKumTVDBtwT3z8'

  return (
    <main>
      <div className="bg-cream border-b border-sand py-10">
        <div className="page-container">
          <Breadcrumbs crumbs={[{ label: 'Home', to: '/' }, { label: 'Contact' }]} className="mb-3" />
          <h1 className="font-serif text-display-sm text-charcoal-900">Contact & Location</h1>
        </div>
      </div>

      <div className="page-container py-12 lg:py-16">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16">
          {/* Contact info */}
          <div>
            <h2 className="font-serif text-2xl text-charcoal-900 mb-6">Get in Touch</h2>

            <ul className="space-y-5 mb-8">
              {/* Address */}
              <li>
                <a
                  href={mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-4 group"
                >
                  <div className="w-10 h-10 rounded-full bg-burgundy-50 flex items-center justify-center shrink-0">
                    <MapPin className="w-5 h-5 text-burgundy-500" aria-hidden />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-charcoal-400 uppercase tracking-wider mb-1">
                      Address
                    </p>
                    <address className="not-italic text-charcoal-700 text-sm leading-relaxed group-hover:text-burgundy-600 transition-colors">
                      {address}
                    </address>
                    <span className="inline-flex items-center gap-1 text-xs text-burgundy-500 mt-1 font-medium">
                      Open in Google Maps
                      <ExternalLink className="w-3 h-3" aria-hidden />
                    </span>
                  </div>
                </a>
              </li>

              {/* Phone */}
              {phoneLink && config?.store_phone && (
                <li>
                  <a
                    href={phoneLink}
                    className="flex items-start gap-4 group"
                  >
                    <div className="w-10 h-10 rounded-full bg-burgundy-50 flex items-center justify-center shrink-0">
                      <Phone className="w-5 h-5 text-burgundy-500" aria-hidden />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-charcoal-400 uppercase tracking-wider mb-1">
                        Phone
                      </p>
                      <p className="text-charcoal-700 text-sm group-hover:text-burgundy-600 transition-colors">
                        {config.store_phone}
                      </p>
                    </div>
                  </a>
                </li>
              )}

              {/* WhatsApp */}
              {waLink && config?.store_whatsapp && (
                <li>
                  <a
                    href={waLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-start gap-4 group"
                  >
                    <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center shrink-0">
                      <MessageCircle className="w-5 h-5 text-green-600" aria-hidden />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-charcoal-400 uppercase tracking-wider mb-1">
                        WhatsApp
                      </p>
                      <p className="text-charcoal-700 text-sm group-hover:text-green-600 transition-colors">
                        {config.store_whatsapp} — Message us directly
                      </p>
                    </div>
                  </a>
                </li>
              )}

              {/* Email */}
              {config?.store_email && (
                <li>
                  <a
                    href={`mailto:${config.store_email}`}
                    className="flex items-start gap-4 group"
                  >
                    <div className="w-10 h-10 rounded-full bg-burgundy-50 flex items-center justify-center shrink-0">
                      <Mail className="w-5 h-5 text-burgundy-500" aria-hidden />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-charcoal-400 uppercase tracking-wider mb-1">
                        Email
                      </p>
                      <p className="text-charcoal-700 text-sm group-hover:text-burgundy-600 transition-colors">
                        {config.store_email}
                      </p>
                    </div>
                  </a>
                </li>
              )}

              {/* Hours */}
              {config?.store_hours && (
                <li className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-burgundy-50 flex items-center justify-center shrink-0">
                    <Clock className="w-5 h-5 text-burgundy-500" aria-hidden />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-charcoal-400 uppercase tracking-wider mb-1">
                      Store Hours
                    </p>
                    <p className="text-charcoal-700 text-sm leading-relaxed">
                      {config.store_hours}
                    </p>
                  </div>
                </li>
              )}
            </ul>

            {/* No contact form — contact must be via phone/WhatsApp/email to avoid fake submission */}
            <div className="p-5 bg-ivory-100 rounded-xl border border-sand text-sm text-charcoal-600">
              <p className="font-medium text-charcoal-800 mb-1">How to reach us</p>
              <p>
                The best way to contact us is via WhatsApp or phone. We typically respond
                within a few hours during store hours.
              </p>
            </div>
          </div>

          {/* Map */}
          <div>
            <h2 className="font-serif text-2xl text-charcoal-900 mb-6">Find Our Store</h2>
            <div className="rounded-xl overflow-hidden bg-ivory-200 aspect-video lg:aspect-square border border-sand">
              <iframe
                title="Sandhya Dresses store location"
                src="https://maps.google.com/maps?q=Near+Union+Bank+Elabaka+Road+Challur+Telangana+505505&output=embed"
                className="w-full h-full border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
              />
            </div>
            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 mt-4 text-sm font-medium text-burgundy-600 hover:text-burgundy-700 transition-colors"
            >
              <ExternalLink className="w-4 h-4" aria-hidden />
              Open in Google Maps for turn-by-turn directions
            </a>
          </div>
        </div>
      </div>
    </main>
  )
}
