import { useQuery } from '@tanstack/react-query'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { customerGetOrder } from '@/lib/api'
import { formatPrice } from '@/lib/cart'
import type { Order } from '@/types'

const statusColors: Record<string, string> = {
  placed: 'bg-blue-50 text-blue-700',
  confirmed: 'bg-indigo-50 text-indigo-700',
  processing: 'bg-yellow-50 text-yellow-700',
  shipped: 'bg-purple-50 text-purple-700',
  delivered: 'bg-green-50 text-green-700',
  cancelled: 'bg-red-50 text-red-700',
}

export default function AccountOrderDetail() {
  const { orderId } = useParams<{ orderId: string }>()
  const { data: order, isLoading } = useQuery<Order>({
    queryKey: ['customer-order', orderId],
    queryFn: () => customerGetOrder(Number(orderId)),
    enabled: !!orderId,
  })

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <div key={i} className="h-12 bg-gray-100 rounded animate-pulse" />)}
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6 text-center">
        <p className="text-gray-500">Order not found.</p>
        <Link to="/account/orders" className="text-burgundy-700 text-sm mt-2 inline-block">← Back to orders</Link>
      </div>
    )
  }

  const items = typeof order.items === 'string' ? JSON.parse(order.items) as Order['items'] : order.items
  const address = typeof order.address === 'string' ? JSON.parse(order.address) as Order['address'] : order.address

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center gap-3 mb-4">
          <Link to="/account/orders" className="text-gray-400 hover:text-gray-600">
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Order #{order.order_number}</h2>
            <p className="text-sm text-gray-500">
              {new Date(order.created_at).toLocaleDateString('en-IN', {
                weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
              })}
            </p>
          </div>
          <span className={`ml-auto text-xs px-3 py-1 rounded-full font-medium ${statusColors[order.order_status] ?? 'bg-gray-50 text-gray-600'}`}>
            {order.order_status.charAt(0).toUpperCase() + order.order_status.slice(1)}
          </span>
        </div>

        {/* Items */}
        <div className="divide-y divide-gray-100">
          {items.map((item, i) => (
            <div key={i} className="py-3 flex justify-between text-sm">
              <div>
                <p className="font-medium text-gray-900">{item.product_name}</p>
                {(item.variant_size || item.variant_color) && (
                  <p className="text-xs text-gray-500 mt-0.5">
                    {[item.variant_size, item.variant_color].filter(Boolean).join(' · ')}
                  </p>
                )}
                <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
              </div>
              <p className="font-medium text-gray-900">{formatPrice(item.unit_price * item.quantity)}</p>
            </div>
          ))}
        </div>

        {/* Totals */}
        <div className="mt-4 pt-4 border-t border-gray-100 space-y-1 text-sm">
          <div className="flex justify-between text-gray-600">
            <span>Subtotal</span>
            <span>{formatPrice(order.subtotal)}</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>Shipping</span>
            <span>{order.shipping === 0 ? 'Free' : formatPrice(order.shipping)}</span>
          </div>
          <div className="flex justify-between font-semibold text-gray-900 text-base pt-1">
            <span>Total</span>
            <span>{formatPrice(order.total)}</span>
          </div>
        </div>
      </div>

      {/* Delivery address */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="font-medium text-gray-900 mb-2">Delivery Address</h3>
        <p className="text-sm text-gray-600">
          {address.line1}{address.line2 ? `, ${address.line2}` : ''}<br />
          {address.city}, {address.state} — {address.pin}<br />
          {address.country}
        </p>
      </div>

      {/* Payment */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="font-medium text-gray-900 mb-2">Payment</h3>
        <div className="text-sm text-gray-600 space-y-1">
          <p>Method: <span className="capitalize">{order.payment_method}</span></p>
          <p>Status: <span className="capitalize">{order.payment_status}</span></p>
          {order.razorpay_payment_id && (
            <p>Payment ID: {order.razorpay_payment_id}</p>
          )}
        </div>
      </div>
    </div>
  )
}
