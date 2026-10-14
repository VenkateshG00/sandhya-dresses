import { Suspense, lazy } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import LoadingState from '@/components/ui/LoadingState'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'

// Public pages
const Home = lazy(() => import('@/pages/Home'))
const Shop = lazy(() => import('@/pages/Shop'))
const ProductDetail = lazy(() => import('@/pages/ProductDetail'))
const About = lazy(() => import('@/pages/About'))
const Contact = lazy(() => import('@/pages/Contact'))
const FAQ = lazy(() => import('@/pages/FAQ'))
const Checkout = lazy(() => import('@/pages/Checkout'))
const OrderConfirmation = lazy(() => import('@/pages/OrderConfirmation'))
const NotFound = lazy(() => import('@/pages/NotFound'))

// Legal pages
const Privacy = lazy(() => import('@/pages/legal/Privacy'))
const Terms = lazy(() => import('@/pages/legal/Terms'))
const Returns = lazy(() => import('@/pages/legal/Returns'))

// Admin pages
const AdminLogin = lazy(() => import('@/pages/admin/Login'))
const AdminLayout = lazy(() => import('@/components/admin/AdminLayout'))
const AdminDashboard = lazy(() => import('@/pages/admin/Dashboard'))
const AdminProducts = lazy(() => import('@/pages/admin/Products'))
const AdminProductEdit = lazy(() => import('@/pages/admin/ProductEdit'))
const AdminOrders = lazy(() => import('@/pages/admin/Orders'))
const AdminSettings = lazy(() => import('@/pages/admin/Settings'))

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

function StoreFallback() {
  return (
    <div className="min-h-screen flex flex-col">
      <LoadingState />
    </div>
  )
}

function StoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main id="main-content" className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  )
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Suspense fallback={<StoreFallback />}>
        <Routes>
          {/* Public store */}
          <Route
            path="/"
            element={
              <StoreLayout>
                <Home />
              </StoreLayout>
            }
          />
          <Route
            path="/shop"
            element={
              <StoreLayout>
                <Shop />
              </StoreLayout>
            }
          />
          <Route
            path="/shop/:slug"
            element={
              <StoreLayout>
                <ProductDetail />
              </StoreLayout>
            }
          />
          <Route
            path="/about"
            element={
              <StoreLayout>
                <About />
              </StoreLayout>
            }
          />
          <Route
            path="/contact"
            element={
              <StoreLayout>
                <Contact />
              </StoreLayout>
            }
          />
          <Route
            path="/faq"
            element={
              <StoreLayout>
                <FAQ />
              </StoreLayout>
            }
          />
          <Route
            path="/checkout"
            element={
              <StoreLayout>
                <Checkout />
              </StoreLayout>
            }
          />
          <Route
            path="/order/:orderNumber"
            element={
              <StoreLayout>
                <OrderConfirmation />
              </StoreLayout>
            }
          />

          {/* Legal */}
          <Route
            path="/privacy"
            element={
              <StoreLayout>
                <Privacy />
              </StoreLayout>
            }
          />
          <Route
            path="/terms"
            element={
              <StoreLayout>
                <Terms />
              </StoreLayout>
            }
          />
          <Route
            path="/returns"
            element={
              <StoreLayout>
                <Returns />
              </StoreLayout>
            }
          />

          {/* Admin */}
          <Route path="/admin" element={<AdminLogin />} />
          <Route path="/admin/*" element={<AdminLayout />}>
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="products/:id" element={<AdminProductEdit />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="settings" element={<AdminSettings />} />
          </Route>

          {/* 404 */}
          <Route
            path="*"
            element={
              <StoreLayout>
                <NotFound />
              </StoreLayout>
            }
          />
        </Routes>
      </Suspense>
    </QueryClientProvider>
  )
}
