import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { ShoppingBag, User, MapPin, Heart, Lock, LogOut } from 'lucide-react'
import { useCustomerStore } from '@/lib/customerStore'
import { authLogout } from '@/lib/api'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'

const navItems = [
  { to: '/account/orders', label: 'My Orders', icon: ShoppingBag },
  { to: '/account/profile', label: 'Profile', icon: User },
  { to: '/account/address', label: 'Saved Addresses', icon: MapPin },
  { to: '/account/wishlist', label: 'Wishlist', icon: Heart },
  { to: '/account/password', label: 'Change Password', icon: Lock },
]

export function AccountLayout() {
  const { customer, clearCustomer } = useCustomerStore()
  const navigate = useNavigate()

  async function handleLogout() {
    await authLogout().catch(() => {})
    clearCustomer()
    navigate('/')
  }

  return (
    <div className="min-h-screen flex flex-col bg-ivory-50">
      <Header />
      <div className="flex-1">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Sidebar */}
          <aside className="md:w-60 shrink-0">
            <div className="bg-white rounded-xl shadow-sm p-4 mb-4">
              <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-100">
                <div className="w-10 h-10 rounded-full bg-burgundy-100 flex items-center justify-center text-burgundy-700 font-semibold text-lg">
                  {customer?.name?.charAt(0)?.toUpperCase() ?? 'U'}
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-gray-900 truncate">{customer?.name}</p>
                  <p className="text-xs text-gray-500 truncate">{customer?.email}</p>
                </div>
              </div>
              <nav className="space-y-1">
                {navItems.map(({ to, label, icon: Icon }) => (
                  <NavLink
                    key={to}
                    to={to}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                        isActive
                          ? 'bg-burgundy-50 text-burgundy-700 font-medium'
                          : 'text-gray-600 hover:bg-gray-50'
                      }`
                    }
                  >
                    <Icon size={16} />
                    {label}
                  </NavLink>
                ))}
              </nav>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogOut size={16} />
              Logout
            </button>
          </aside>

          {/* Main content */}
          <main className="flex-1 min-w-0">
            <Outlet />
          </main>
        </div>
      </div>
      </div>
      <Footer />
    </div>
  )
}
