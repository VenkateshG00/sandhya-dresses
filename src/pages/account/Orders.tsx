import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { ShoppingBag, ChevronRight } from 'lucide-react'
import { customerGetOrders, type CustomerOrderSummary } from '@/lib/api'
import { formatPrice } from '@/lib/cart'

const statusColors: Record<string, string> = {
  placed: 'bg-blue-50 text-blue-700',
  confirmed: 'bg-indigo-50 text-indigo-700',
  processing: 'bg-yellow-50 text-yellow-700',
  shipped: 'bg-purple-50 text-purple-700',
  delivered: 'bg-green-50 text-green-700',
  cancelled: 'bg-red-50 text-red-700',
  refunded: 'bg-gray-50 text-gray-600',
}

const paymentColors: Record<string, string> = {
  pending: 'bg-yellow-50 text-yellow-700',
  paid: 'bg-green-50 text-green-700',
  failed: 'bg-red-50 text-red-700',
  cancelled: 'bg-gray-50 text-gray-600',
}

export default function AccountOrders() {
  const { data: orders, isLoading } = useQuery<CustomerOrderSummary[]>({
    queryKey: ['customer-orders'],
    queryFn: customerGetOrders,
  })

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-6">My Orders</h2>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-gray-100 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : !orders?.length ? (
        <div className="text-center py-12">
          <ShoppingBag className="mx-auto mb-3 text-gray-300" size={48} />
          <p className="text-gray-500">No orders yet</p>
          <Link
            to="/shop"
            className="mt-4 inline-block px-4 py-2 bg-burgundy-700 text-white text-sm rounded-lg hover:bg-burgundy-800"
          >
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="divide-y divide-gray-100">
          {orders.map((order) => (
            <Link
              key={order.id}
              to={`/account/orders/${order.id}`}
              className="flex items-center justify-between py-4 hover:bg-gray-50 -mx-2 px-2 rounded-lg transition-colors"
            >
              <div>
                <p className="font-medium text-gray-900 text-sm">#{order.order_number}</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {new Date(order.created_at).toLocaleDateString('en-IN', {
                    day: 'numeric', month: 'short', year: 'numeric',
                  })}
                </p>
                <div className="flex gap-2 mt-1.5">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[order.order_status] ?? 'bg-gray-50 text-gray-600'}`}>
                    {order.order_status.charAt(0).toUpperCase() + order.order_status.slice(1)}
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${paymentColors[order.payment_status] ?? 'bg-gray-50 text-gray-600'}`}>
                    {order.payment_status.charAt(0).toUpperCase() + order.payment_status.slice(1)}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-gray-900">{formatPrice(order.total)}</span>
                <ChevronRight size={16} className="text-gray-400" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
