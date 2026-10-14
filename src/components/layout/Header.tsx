import { useState, useEffect } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { ShoppingBag, Menu, Search, X } from 'lucide-react'
import { useCartStore } from '@/lib/cart'
import { useSiteConfig } from '@/lib/config'
import MobileNav from './MobileNav'
import CartDrawer from '@/components/cart/CartDrawer'

const NAV_LINKS = [
  { to: '/', label: 'Home' },
  { to: '/shop', label: 'Shop' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
]

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [cartOpen, setCartOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { data: config } = useSiteConfig()
  const itemCount = useCartStore((s) => s.itemCount())
  const location = useLocation()

  useEffect(() => {
    setMobileOpen(false)
    setCartOpen(false)
  }, [location.pathname])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const isTransparent = location.pathname === '/' && !scrolled && !mobileOpen

  return (
    <>
      {/* Announcement bar */}
      {config?.announcement_active === 'true' && config.announcement_text && (
        <div className="bg-burgundy-600 text-ivory-50 text-xs text-center py-2 px-4 font-medium tracking-wide">
          {config.announcement_text}
        </div>
      )}

      <header
        className={`sticky top-0 z-40 transition-all duration-300 ${
          isTransparent
            ? 'bg-transparent'
            : 'bg-ivory-50/95 backdrop-blur-sm border-b border-sand shadow-sm'
        }`}
      >
        <div className="page-container">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo */}
            <Link
              to="/"
              className="flex flex-col leading-none group"
              aria-label="Sandhya Dresses — Home"
            >
              <span className="font-serif text-xl lg:text-2xl font-semibold text-charcoal-900 group-hover:text-burgundy-600 transition-colors">
                Sandhya
              </span>
              <span className="text-[0.6rem] tracking-[0.25em] text-burgundy-500 uppercase font-medium -mt-0.5">
                Dresses
              </span>
            </Link>

            {/* Desktop nav */}
            <nav className="hidden lg:flex items-center gap-8" aria-label="Main navigation">
              {NAV_LINKS.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.to === '/'}
                  className={({ isActive }) =>
                    `text-sm font-medium tracking-wide transition-colors duration-150 relative pb-0.5 ${
                      isActive
                        ? 'text-burgundy-600 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-px after:bg-burgundy-600'
                        : 'text-charcoal-700 hover:text-burgundy-600'
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              ))}
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-1">
              <Link
                to="/shop"
                className="btn-ghost p-2 rounded-full"
                aria-label="Search products"
              >
                <Search className="w-5 h-5" aria-hidden />
              </Link>

              <button
                type="button"
                onClick={() => setCartOpen(true)}
                className="btn-ghost p-2 rounded-full relative"
                aria-label={`Cart — ${itemCount} item${itemCount !== 1 ? 's' : ''}`}
              >
                <ShoppingBag className="w-5 h-5" aria-hidden />
                {itemCount > 0 && (
                  <span
                    className="absolute -top-0.5 -right-0.5 w-4.5 h-4.5 min-w-[1.1rem] flex items-center justify-center bg-burgundy-500 text-white text-[10px] font-bold rounded-full leading-none px-1"
                    aria-hidden
                  >
                    {itemCount > 99 ? '99+' : itemCount}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setMobileOpen((v) => !v)}
                className="lg:hidden btn-ghost p-2 rounded-full"
                aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
                aria-expanded={mobileOpen}
              >
                {mobileOpen ? (
                  <X className="w-5 h-5" aria-hidden />
                ) : (
                  <Menu className="w-5 h-5" aria-hidden />
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      <MobileNav open={mobileOpen} onClose={() => setMobileOpen(false)} links={NAV_LINKS} />
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  )
}
