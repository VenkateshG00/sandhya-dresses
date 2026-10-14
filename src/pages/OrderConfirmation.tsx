import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { CheckCircle, MessageCircle, Package, Home } from 'lucide-react'
import { fetchOrderStatus } from '@/lib/api'
import { useSiteConfig } from '@/lib/config'
import { formatPrice } from '@/lib/cart'
import LoadingState from '@/components/ui/LoadingState'

export default function OrderConfirmation() {
  const { orderNumber } = useParams<{ orderNumber: string }>()
  const { data: config } = useSiteConfig()

  const { data: order, isLoading } = useQuery({
    queryKey: ['order', orderNumber],
    queryFn: () => fetchOrderStatus(orderNumber!),
    enabled: !!orderNumber,
    retry: 2,
  })

  const waNumber = config?.store_whatsapp?.replace(/\D/g, '')
  const intlNumber = waNumber ? (waNumber.startsWith('91') ? waNumber : `91${waNumber}`) : null

  function buildWhatsAppConfirmation(): string | null {
    if (!intlNumber || !order || !orderNumber) return null
    const total = order.total ? formatPrice(order.total) : ''
    const method = order.payment_method ?? 'unknown'
    const msg = [
      `*Order Placed — Sandhya Dresses*`,
      `Order #: ${orderNumber}`,
      total ? `Total: ${total}` : '',
      `Payment: ${method.toUpperCase()}`,
      '',
      'Please confirm my order. Thank you!',
    ]
      .filter(Boolean)
      .join('\n')
    return `https://wa.me/${intlNumber}?text=${encodeURIComponent(msg)}`
  }

  const waConfirmLink = buildWhatsAppConfirmation()

  if (isLoading) {
    return <LoadingState message="Loading your order…" className="min-h-[60vh]" />
  }

  return (
    <main className="min-h-[70vh] flex items-center justify-center">
      <div className="page-container py-16">
        <div className="max-w-lg mx-auto text-center">
          <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-8 h-8 text-green-600" aria-hidden />
          </div>

          <h1 className="font-serif text-display-sm text-charcoal-900 mb-2">
            Order Placed!
          </h1>
          <p className="text-charcoal-500 mb-2">
            Thank you for your order.
          </p>
          {orderNumber && (
            <p className="font-medium text-charcoal-800 mb-8">
              Order #:{' '}
              <span className="font-mono text-burgundy-600">{orderNumber}</span>
            </p>
          )}

          {order && (
            <div className="card p-5 text-left mb-8 text-sm">
              <h2 className="font-medium text-charcoal-800 mb-3">Order Details</h2>
              <dl className="space-y-2 text-charcoal-600">
                {order.payment_method && (
                  <div className="flex justify-between">
                    <dt>Payment</dt>
                    <dd className="font-medium text-charcoal-800">
                      {order.payment_method === 'cod'
                        ? 'Cash on Delivery'
                        : order.payment_method === 'upi'
                        ? 'UPI'
                        : 'Online Payment'}
                    </dd>
                  </div>
                )}
                {order.payment_status && (
                  <div className="flex justify-between">
                    <dt>Payment Status</dt>
                    <dd className={`font-medium capitalize ${
                      order.payment_status === 'paid' ? 'text-green-600' : 'text-amber-600'
                    }`}>
                      {order.payment_status}
                    </dd>
                  </div>
                )}
                {order.order_status && (
                  <div className="flex justify-between">
                    <dt>Order Status</dt>
                    <dd className="font-medium text-charcoal-800 capitalize">{order.order_status}</dd>
                  </div>
                )}
                {order.total !== undefined && (
                  <div className="flex justify-between">
                    <dt>Total</dt>
                    <dd className="font-semibold text-charcoal-900">{formatPrice(order.total)}</dd>
                  </div>
                )}
              </dl>
            </div>
          )}

          {/* What happens next */}
          <div className="card p-5 text-left mb-8">
            <h2 className="font-medium text-charcoal-800 mb-3 flex items-center gap-2">
              <Package className="w-4 h-4 text-burgundy-500" aria-hidden />
              What happens next?
            </h2>
            <ol className="space-y-2 text-sm text-charcoal-600 list-decimal list-inside">
              <li>We will review your order and confirm it shortly.</li>
              {order?.payment_method === 'upi' && (
                <li>Please complete your UPI payment to confirm the order.</li>
              )}
              <li>Once confirmed, we will prepare your order for dispatch.</li>
              <li>You will be contacted on your mobile number with updates.</li>
            </ol>
          </div>

          {/* WhatsApp confirmation link */}
          {waConfirmLink && (
            <a
              href={waConfirmLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-3 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded transition-colors mb-4 w-full justify-center"
            >
              <MessageCircle className="w-4 h-4" aria-hidden />
              Confirm Order on WhatsApp
            </a>
          )}

          <div className="flex flex-wrap gap-3 justify-center">
            <Link to="/" className="btn-secondary gap-2">
              <Home className="w-4 h-4" aria-hidden />
              Back to Home
            </Link>
            <Link to="/shop" className="btn-primary">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
