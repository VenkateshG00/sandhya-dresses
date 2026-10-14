import { useQuery } from '@tanstack/react-query'
import { TrendingUp, ShoppingCart, AlertTriangle, Package } from 'lucide-react'
import { adminFetchDashboard } from '@/lib/api'
import { formatPrice } from '@/lib/cart'
import { formatDateTime } from '@/lib/utils'
import LoadingState from '@/components/ui/LoadingState'
import ErrorState from '@/components/ui/ErrorState'

function StatCard({
  label,
  count,
  revenue,
  icon: Icon,
}: {
  label: string
  count: number
  revenue: number
  icon: React.ElementType
}) {
  return (
    <div className="card p-5">
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-xs font-semibold text-charcoal-400 uppercase tracking-wider">{label}</p>
          <p className="font-serif text-2xl font-medium text-charcoal-900 mt-1">
            {formatPrice(revenue)}
          </p>
          <p className="text-sm text-charcoal-500 mt-0.5">{count} order{count !== 1 ? 's' : ''}</p>
        </div>
        <div className="w-10 h-10 rounded-full bg-burgundy-50 flex items-center justify-center shrink-0">
          <Icon className="w-5 h-5 text-burgundy-500" aria-hidden />
        </div>
      </div>
    </div>
  )
}

const ORDER_STATUS_LABELS: Record<string, string> = {
  placed: 'Placed',
  confirmed: 'Confirmed',
  processing: 'Processing',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
  refunded: 'Refunded',
}

export default function AdminDashboard() {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: adminFetchDashboard,
    refetchInterval: 60_000,
  })

  if (isLoading) return <LoadingState />
  if (isError || !data) {
    return <ErrorState retry={() => void refetch()} />
  }

  const { stats, recent_orders, low_stock } = data

  return (
    <div className="p-6 lg:p-8 max-w-7xl">
      <h1 className="font-serif text-2xl text-charcoal-900 mb-8">Dashboard</h1>

      {/* Stats */}
      <section aria-labelledby="stats-heading" className="mb-10">
        <h2 id="stats-heading" className="text-xs font-semibold text-charcoal-400 uppercase tracking-wider mb-4">
          Revenue
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard label="Today" count={stats.today?.count ?? 0} revenue={stats.today?.revenue ?? 0} icon={TrendingUp} />
          <StatCard label="This Week" count={stats.week?.count ?? 0} revenue={stats.week?.revenue ?? 0} icon={TrendingUp} />
          <StatCard label="This Month" count={stats.month?.count ?? 0} revenue={stats.month?.revenue ?? 0} icon={TrendingUp} />
        </div>
      </section>

      {/* Low stock alerts */}
      {Array.isArray(low_stock) && low_stock.length > 0 && (
        <section aria-labelledby="low-stock-heading" className="mb-10">
          <h2 id="low-stock-heading" className="flex items-center gap-2 text-sm font-semibold text-amber-700 mb-3">
            <AlertTriangle className="w-4 h-4" aria-hidden />
            Low Stock Alert ({low_stock.length})
          </h2>
          <div className="card overflow-hidden">
            <ul className="divide-y divide-sand">
              {(low_stock as { id: number; name: string; stock: number; sku?: string }[]).map((item) => (
                <li key={item.id} className="flex items-center justify-between px-4 py-3 text-sm">
                  <div>
                    <p className="font-medium text-charcoal-800">{item.name}</p>
                    {item.sku && <p className="text-xs text-charcoal-400">SKU: {item.sku}</p>}
                  </div>
                  <span
                    className={`font-semibold ${
                      item.stock === 0 ? 'text-red-600' : 'text-amber-600'
                    }`}
                  >
                    {item.stock === 0 ? 'Out of stock' : `${item.stock} left`}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* Recent orders */}
      <section aria-labelledby="recent-orders-heading">
        <div className="flex items-center justify-between mb-4">
          <h2 id="recent-orders-heading" className="text-sm font-semibold text-charcoal-600 uppercase tracking-wider flex items-center gap-2">
            <ShoppingCart className="w-4 h-4" aria-hidden />
            Recent Orders
          </h2>
        </div>

        {Array.isArray(recent_orders) && recent_orders.length > 0 ? (
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-ivory-100 text-charcoal-500 text-xs uppercase tracking-wider">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold">Order #</th>
                    <th className="px-4 py-3 text-left font-semibold">Customer</th>
                    <th className="px-4 py-3 text-right font-semibold">Total</th>
                    <th className="px-4 py-3 text-left font-semibold">Status</th>
                    <th className="px-4 py-3 text-left font-semibold">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-sand">
                  {(recent_orders as {
                    order_number: string
                    customer_name: string
                    total: number
                    order_status: string
                    created_at: string
                  }[]).map((order) => (
                    <tr key={order.order_number} className="hover:bg-ivory-50 transition-colors">
                      <td className="px-4 py-3 font-mono text-burgundy-600 text-xs">
                        {order.order_number}
                      </td>
                      <td className="px-4 py-3 text-charcoal-800">{order.customer_name}</td>
                      <td className="px-4 py-3 text-right font-medium">{formatPrice(order.total)}</td>
                      <td className="px-4 py-3">
                        <span className="tag tag-burgundy capitalize">
                          {ORDER_STATUS_LABELS[order.order_status] ?? order.order_status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-charcoal-400 text-xs">
                        {formatDateTime(order.created_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="card p-8 text-center text-charcoal-400 text-sm">
            <Package className="w-8 h-8 mx-auto mb-2 opacity-40" aria-hidden />
            No orders yet.
          </div>
        )}
      </section>
    </div>
  )
}
