import { useEffect, useState } from 'react'
import { Link, NavLink, useNavigate, Outlet } from 'react-router-dom'
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Settings,
  LogOut,
  Menu,
  X,
} from 'lucide-react'
import { adminVerify, adminLogout } from '@/lib/api'
import LoadingState from '@/components/ui/LoadingState'

const NAV = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/admin/products', label: 'Products', icon: Package },
  { to: '/admin/orders', label: 'Orders', icon: ShoppingCart },
  { to: '/admin/settings', label: 'Settings', icon: Settings },
]

export default function AdminLayout() {
  const navigate = useNavigate()
  const [authed, setAuthed] = useState<boolean | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    adminVerify().then((ok) => {
      if (!ok) void navigate('/admin', { replace: true })
      else setAuthed(true)
    })
  }, [navigate])

  async function logout() {
    await adminLogout()
    void navigate('/admin', { replace: true })
  }

  if (authed === null) return <LoadingState />

  return (
    <div className="min-h-screen bg-charcoal-50 flex">
      {/* Sidebar — desktop */}
      <aside className="hidden lg:flex flex-col w-56 bg-charcoal-900 text-charcoal-300 fixed top-0 bottom-0 left-0 z-30">
        <div className="px-5 py-5 border-b border-charcoal-800">
          <Link to="/admin/dashboard" className="block">
            <span className="font-serif text-ivory-50 text-lg font-semibold block">Sandhya</span>
            <span className="text-[0.6rem] tracking-[0.25em] text-burgundy-400 uppercase">Admin</span>
          </Link>
        </div>

        <nav className="flex-1 py-4 px-3 space-y-1" aria-label="Admin navigation">
          {NAV.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-burgundy-600 text-ivory-50'
                    : 'hover:bg-charcoal-800 hover:text-ivory-100'
                }`
              }
            >
              <Icon className="w-4 h-4" aria-hidden />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="p-3 border-t border-charcoal-800">
          <Link
            to="/"
            target="_blank"
            className="flex items-center gap-3 px-3 py-2 text-xs text-charcoal-500 hover:text-charcoal-300 transition-colors rounded"
          >
            View store ↗
          </Link>
          <button
            type="button"
            onClick={() => void logout()}
            className="w-full flex items-center gap-3 px-3 py-2 text-sm text-charcoal-400 hover:text-red-400 transition-colors rounded"
          >
            <LogOut className="w-4 h-4" aria-hidden />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-30 flex items-center justify-between h-14 px-4 bg-charcoal-900 border-b border-charcoal-800">
        <Link to="/admin/dashboard" className="font-serif text-ivory-50 text-lg font-semibold">
          Admin
        </Link>
        <button
          type="button"
          onClick={() => setSidebarOpen((v) => !v)}
          aria-label={sidebarOpen ? 'Close menu' : 'Open menu'}
          className="p-2 text-charcoal-300 hover:text-ivory-50 transition-colors"
        >
          {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile sidebar */}
      {sidebarOpen && (
        <>
          <div
            className="fixed inset-0 z-20 bg-charcoal-900/60 lg:hidden"
            onClick={() => setSidebarOpen(false)}
            aria-hidden
          />
          <div className="fixed top-14 left-0 bottom-0 z-30 w-56 bg-charcoal-900 flex flex-col lg:hidden">
            <nav className="flex-1 py-4 px-3 space-y-1">
              {NAV.map(({ to, label, icon: Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-charcoal-300 transition-colors ${
                      isActive ? 'bg-burgundy-600 text-ivory-50' : 'hover:bg-charcoal-800'
                    }`
                  }
                >
                  <Icon className="w-4 h-4" aria-hidden />
                  {label}
                </NavLink>
              ))}
            </nav>
            <div className="p-3 border-t border-charcoal-800">
              <button
                type="button"
                onClick={() => void logout()}
                className="w-full flex items-center gap-3 px-3 py-2 text-sm text-charcoal-400 hover:text-red-400 transition-colors"
              >
                <LogOut className="w-4 h-4" aria-hidden />
                Sign Out
              </button>
            </div>
          </div>
        </>
      )}

      {/* Main content */}
      <div className="flex-1 lg:ml-56 pt-14 lg:pt-0 min-h-screen">
        <Outlet />
      </div>
    </div>
  )
}
