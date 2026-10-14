import { useEffect, useRef } from 'react'
import { NavLink } from 'react-router-dom'
import { X, MapPin, Phone, MessageCircle } from 'lucide-react'
import { useSiteConfig } from '@/lib/config'
import { getWhatsAppLink, getPhoneLink } from '@/lib/config'

interface Props {
  open: boolean
  onClose: () => void
  links: { to: string; label: string }[]
}

export default function MobileNav({ open, onClose, links }: Props) {
  const { data: config } = useSiteConfig()
  const overlayRef = useRef<HTMLDivElement>(null)
  const firstLinkRef = useRef<HTMLAnchorElement>(null)

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
      firstLinkRef.current?.focus()
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [open])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  const waLink = getWhatsAppLink(config)
  const phoneLink = getPhoneLink(config)

  if (!open) return null

  return (
    <>
      {/* Backdrop */}
      <div
        ref={overlayRef}
        className="fixed inset-0 z-40 bg-charcoal-900/50 backdrop-blur-sm lg:hidden"
        onClick={onClose}
        aria-hidden
      />

      {/* Drawer */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
        className="fixed top-0 left-0 bottom-0 z-50 w-[min(85vw,320px)] bg-ivory-50 flex flex-col shadow-modal lg:hidden animate-slide-in-left"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-sand">
          <div className="flex flex-col leading-none">
            <span className="font-serif text-xl font-semibold text-charcoal-900">Sandhya</span>
            <span className="text-[0.6rem] tracking-[0.25em] text-burgundy-500 uppercase font-medium">
              Dresses
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="btn-ghost p-2 rounded-full"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" aria-hidden />
          </button>
        </div>

        {/* Nav links */}
        <nav className="flex-1 overflow-y-auto py-6 px-6" aria-label="Mobile navigation">
          <ul className="space-y-1">
            {links.map((link, i) => (
              <li key={link.to}>
                <NavLink
                  ref={i === 0 ? firstLinkRef : undefined}
                  to={link.to}
                  end={link.to === '/'}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `block px-4 py-3 text-base font-medium rounded-lg transition-colors duration-150 ${
                      isActive
                        ? 'text-burgundy-600 bg-burgundy-50'
                        : 'text-charcoal-700 hover:text-burgundy-600 hover:bg-ivory-100'
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              </li>
            ))}
          </ul>

          <div className="divider mt-6 mb-4" />

          <ul className="space-y-1">
            <li>
              <NavLink
                to="/faq"
                onClick={onClose}
                className={({ isActive }) =>
                  `block px-4 py-3 text-sm text-charcoal-600 rounded-lg transition-colors hover:text-burgundy-600 hover:bg-ivory-100 ${isActive ? 'text-burgundy-600' : ''}`
                }
              >
                FAQ
              </NavLink>
            </li>
          </ul>
        </nav>

        {/* Contact strip */}
        <div className="border-t border-sand px-6 py-5 space-y-3">
          {config?.google_maps_url && (
            <a
              href={config.google_maps_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 text-sm text-charcoal-600 hover:text-burgundy-600 transition-colors"
            >
              <MapPin className="w-4 h-4 shrink-0 text-burgundy-500" aria-hidden />
              <span>Near Union Bank, Challur, Karimnagar</span>
            </a>
          )}
          {phoneLink && config?.store_phone && (
            <a
              href={phoneLink}
              className="flex items-center gap-3 text-sm text-charcoal-600 hover:text-burgundy-600 transition-colors"
            >
              <Phone className="w-4 h-4 shrink-0 text-burgundy-500" aria-hidden />
              <span>{config.store_phone}</span>
            </a>
          )}
          {waLink && (
            <a
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 text-sm text-charcoal-600 hover:text-green-600 transition-colors"
            >
              <MessageCircle className="w-4 h-4 shrink-0 text-green-600" aria-hidden />
              <span>WhatsApp us</span>
            </a>
          )}
        </div>
      </div>
    </>
  )
}
