import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Download, Search } from 'lucide-react'
import { adminFetchOrders, adminUpdateOrder } from '@/lib/api'
import { formatPrice } from '@/lib/cart'
import { formatDateTime, debounce } from '@/lib/utils'
import LoadingState from '@/components/ui/LoadingState'
import ErrorState from '@/components/ui/ErrorState'
import Button from '@/components/ui/Button'

const ORDER_STATUSES = [
  { value: '', label: 'All' },
  { value: 'placed', label: 'Placed' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'processing', label: 'Processing' },
  { value: 'shipped', label: 'Shipped' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' },
]

export default function AdminOrders() {
  const qc = useQueryClient()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [orderStatus, setOrderStatus] = useState('')

  const debouncedSearch = debounce((v: unknown) => setSearch(v as string), 400)

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['admin-orders', page, search, orderStatus],
    queryFn: () => adminFetchOrders({ page, search, order_status: orderStatus }),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: unknown }) =>
      adminUpdateOrder(id, data),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['admin-orders'] }),
  })

  function exportCSV() {
    window.open('/api/admin/orders/export', '_blank')
  }

  if (isLoading) return <LoadingState />
  if (isError) return <ErrorState retry={() => void refetch()} />

  const orders = data?.orders ?? []
  const total = data?.pagination.total ?? 0
  const limit = data?.pagination.limit ?? 30
  const pages = Math.ceil(total / limit)

  return (
    <div className="p-6 lg:p-8 max-w-7xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-serif text-2xl text-charcoal-900">Orders ({total})</h1>
        <Button variant="secondary" size="sm" onClick={exportCSV}>
          <Download className="w-4 h-4" aria-hidden />
          Export CSV
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal-400 pointer-events-none" aria-hidden />
          <input
            type="search"
            placeholder="Search orders, customers…"
            onChange={(e) => debouncedSearch(e.target.value)}
            className="input-base pl-9 text-sm"
            aria-label="Search orders"
          />
        </div>
        <div className="flex gap-1 flex-wrap">
          {ORDER_STATUSES.map((s) => (
            <button
              key={s.value}
              type="button"
              onClick={() => { setOrderStatus(s.value); setPage(1) }}
              className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-colors ${
                orderStatus === s.value
                  ? 'bg-burgundy-500 text-white border-burgundy-500'
                  : 'border-sand text-charcoal-600 hover:border-burgundy-300'
              }`}
              aria-pressed={orderStatus === s.value}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="card p-12 text-center text-charcoal-400 text-sm">
          No orders found.
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-ivory-100 text-charcoal-500 text-xs uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">Order #</th>
                  <th className="px-4 py-3 text-left font-semibold">Customer</th>
                  <th className="px-4 py-3 text-left font-semibold">Phone</th>
                  <th className="px-4 py-3 text-right font-semibold">Total</th>
                  <th className="px-4 py-3 text-left font-semibold">Payment</th>
                  <th className="px-4 py-3 text-left font-semibold">Status</th>
                  <th className="px-4 py-3 text-left font-semibold">Date</th>
                  <th className="px-4 py-3 text-left font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sand">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-ivory-50 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-burgundy-600">
                      {order.order_number}
                    </td>
                    <td className="px-4 py-3 font-medium text-charcoal-800">
                      {order.customer_name}
                    </td>
                    <td className="px-4 py-3 text-charcoal-600">{order.phone}</td>
                    <td className="px-4 py-3 text-right font-medium">
                      {formatPrice(order.total)}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`tag ${
                        order.payment_status === 'paid'
                          ? 'bg-green-100 text-green-700'
                          : order.payment_status === 'failed'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-amber-100 text-amber-700'
                      }`}>
                        {order.payment_status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={order.order_status}
                        onChange={(e) =>
                          updateMutation.mutate({
                            id: order.id,
                            data: { order_status: e.target.value },
                          })
                        }
                        className="text-xs border border-sand rounded px-2 py-1 bg-white text-charcoal-700 cursor-pointer"
                        aria-label={`Order status for ${order.order_number}`}
                      >
                        {ORDER_STATUSES.slice(1).map((s) => (
                          <option key={s.value} value={s.value}>{s.label}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3 text-xs text-charcoal-400">
                      {formatDateTime(order.created_at)}
                    </td>
                    <td className="px-4 py-3">
                      {!order.whatsapp_sent && order.customer_name && (
                        <button
                          type="button"
                          onClick={() =>
                            updateMutation.mutate({
                              id: order.id,
                              data: { whatsapp_sent: 1 },
                            })
                          }
                          className="text-xs text-green-600 hover:text-green-700 font-medium"
                        >
                          Mark WA sent
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination */}
      {pages > 1 && (
        <nav aria-label="Orders pagination" className="flex items-center justify-center gap-2 mt-6">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            className="px-4 py-2 text-sm border border-sand rounded-lg disabled:opacity-40"
          >
            Previous
          </button>
          <span className="text-sm text-charcoal-500">Page {page} of {pages}</span>
          <button
            type="button"
            disabled={page >= pages}
            onClick={() => setPage((p) => p + 1)}
            className="px-4 py-2 text-sm border border-sand rounded-lg disabled:opacity-40"
          >
            Next
          </button>
        </nav>
      )}
    </div>
  )
}
