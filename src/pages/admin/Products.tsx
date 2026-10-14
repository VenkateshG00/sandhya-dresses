import { useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Search, Edit2, Trash2, Upload } from 'lucide-react'
import { adminFetchProducts, adminDeleteProduct } from '@/lib/api'
import { imageUrl } from '@/lib/api'
import { formatPrice } from '@/lib/cart'
import { debounce } from '@/lib/utils'
import LoadingState from '@/components/ui/LoadingState'
import ErrorState from '@/components/ui/ErrorState'
import Button from '@/components/ui/Button'

export default function AdminProducts() {
  const qc = useQueryClient()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [csvLoading, setCsvLoading] = useState(false)
  const csvInputRef = useRef<HTMLInputElement>(null)

  const debouncedSearch = debounce((v: unknown) => { setSearch(v as string); setPage(1) }, 400)

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['admin-products', page, search, status],
    queryFn: () => adminFetchProducts({ page, search, status }),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => adminDeleteProduct(id),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['admin-products'] }),
  })

  async function handleCsvUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setCsvLoading(true)

    try {
      const form = new FormData()
      form.append('file', file)
      const res = await fetch('/api/admin/products/bulk', {
        method: 'POST',
        credentials: 'include',
        body: form,
      })
      const json = await res.json() as { created: number; skipped: number; errors: string[] }
      alert(`Bulk upload: ${json.created} created, ${json.skipped} skipped.\n${json.errors.join('\n')}`)
      void qc.invalidateQueries({ queryKey: ['admin-products'] })
    } catch {
      alert('CSV upload failed.')
    } finally {
      setCsvLoading(false)
      if (csvInputRef.current) csvInputRef.current.value = ''
    }
  }

  function confirmDelete(id: number, name: string) {
    if (confirm(`Delete "${name}"? This cannot be undone.`)) {
      deleteMutation.mutate(id)
    }
  }

  if (isLoading) return <LoadingState />
  if (isError) return <ErrorState retry={() => void refetch()} />

  const products = data?.products ?? []
  const total = data?.pagination.total ?? 0

  return (
    <div className="p-6 lg:p-8 max-w-7xl">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h1 className="font-serif text-2xl text-charcoal-900">Products ({total})</h1>
        <div className="flex items-center gap-2">
          <input
            ref={csvInputRef}
            type="file"
            accept=".csv"
            onChange={(e) => void handleCsvUpload(e)}
            className="sr-only"
            id="csv-upload"
            aria-label="Upload CSV"
          />
          <Button
            variant="secondary"
            size="sm"
            loading={csvLoading}
            onClick={() => csvInputRef.current?.click()}
          >
            <Upload className="w-4 h-4" aria-hidden />
            CSV Upload
          </Button>
          <Link to="/admin/products/new" className="btn-primary text-sm px-4 py-2 inline-flex items-center gap-2">
            <Plus className="w-4 h-4" aria-hidden />
            Add Product
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal-400 pointer-events-none" aria-hidden />
          <input
            type="search"
            placeholder="Search products…"
            onChange={(e) => debouncedSearch(e.target.value)}
            className="input-base pl-9 text-sm"
            aria-label="Search products"
          />
        </div>
        {['', 'active', 'draft', 'archived'].map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => { setStatus(s); setPage(1) }}
            className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-colors ${
              status === s
                ? 'bg-burgundy-500 text-white border-burgundy-500'
                : 'border-sand text-charcoal-600 hover:border-burgundy-300'
            }`}
          >
            {s === '' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      {/* CSV format hint */}
      <details className="mb-4 text-xs text-charcoal-500">
        <summary className="cursor-pointer hover:text-charcoal-700">CSV format guide</summary>
        <p className="mt-2 font-mono bg-ivory-100 p-3 rounded text-[11px] overflow-x-auto">
          name,slug,price,status,description,sale_price,sizes,colors,sku,stock,care_instructions<br />
          "Red Saree",red-saree,150000,active,"Beautiful silk saree",,S;M;L,Red;Maroon,,10,""
        </p>
        <p className="mt-1">Prices in <strong>paise</strong>. Sizes and colors separated by <code>;</code>. Existing slugs are skipped.</p>
      </details>

      {products.length === 0 ? (
        <div className="card p-12 text-center text-charcoal-400 text-sm">
          No products found.{' '}
          <Link to="/admin/products/new" className="text-burgundy-600 hover:underline">
            Add your first product.
          </Link>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-ivory-100 text-charcoal-500 text-xs uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3 text-left font-semibold">Product</th>
                <th className="px-4 py-3 text-left font-semibold">Category</th>
                <th className="px-4 py-3 text-right font-semibold">Price</th>
                <th className="px-4 py-3 text-right font-semibold">Stock</th>
                <th className="px-4 py-3 text-left font-semibold">Status</th>
                <th className="px-4 py-3 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sand">
              {products.map((product) => {
                const img = product.primary_image
                  ? imageUrl(product.primary_image)
                  : '/placeholder-product.svg'

                return (
                  <tr key={product.id} className="hover:bg-ivory-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={img}
                          alt={product.name}
                          className="w-10 h-12 object-cover rounded shrink-0 bg-ivory-200"
                        />
                        <div className="min-w-0">
                          <p className="font-medium text-charcoal-800 truncate max-w-[200px]">
                            {product.name}
                          </p>
                          <p className="text-xs text-charcoal-400 font-mono">{product.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-charcoal-600">
                      {product.category_name ?? '—'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div>
                        <p className="font-medium">{formatPrice(product.price)}</p>
                        {product.sale_price && (
                          <p className="text-xs text-burgundy-500">{formatPrice(product.sale_price)}</p>
                        )}
                      </div>
                    </td>
                    <td className={`px-4 py-3 text-right font-medium ${
                      product.stock === 0 ? 'text-red-600' : product.stock <= 5 ? 'text-amber-600' : 'text-green-600'
                    }`}>
                      {product.stock}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`tag capitalize ${
                        product.status === 'active'
                          ? 'bg-green-100 text-green-700'
                          : product.status === 'draft'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-charcoal-100 text-charcoal-600'
                      }`}>
                        {product.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          to={`/admin/products/${product.id}`}
                          className="p-1.5 rounded text-charcoal-400 hover:text-burgundy-600 hover:bg-burgundy-50 transition-colors"
                          aria-label={`Edit ${product.name}`}
                        >
                          <Edit2 className="w-4 h-4" aria-hidden />
                        </Link>
                        <button
                          type="button"
                          onClick={() => confirmDelete(product.id, product.name)}
                          disabled={deleteMutation.isPending}
                          className="p-1.5 rounded text-charcoal-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                          aria-label={`Delete ${product.name}`}
                        >
                          <Trash2 className="w-4 h-4" aria-hidden />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {data && data.pagination.total > (data.pagination.limit ?? 30) && (
        <nav aria-label="Products pagination" className="flex items-center justify-center gap-2 mt-6">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            className="px-4 py-2 text-sm border border-sand rounded-lg disabled:opacity-40"
          >
            Previous
          </button>
          <span className="text-sm text-charcoal-500">Page {page}</span>
          <button
            type="button"
            disabled={products.length < (data.pagination.limit ?? 30)}
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
