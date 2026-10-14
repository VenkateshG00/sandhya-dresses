import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { SlidersHorizontal, X } from 'lucide-react'
import { fetchProducts } from '@/lib/api'
import ProductGrid from '@/components/product/ProductGrid'
import SearchBar from '@/components/shop/SearchBar'
import CategoryFilter from '@/components/shop/CategoryFilter'
import PriceFilter from '@/components/shop/PriceFilter'
import { ProductGridSkeleton } from '@/components/ui/LoadingState'
import EmptyState from '@/components/ui/EmptyState'
import ErrorState from '@/components/ui/ErrorState'
import Breadcrumbs from '@/components/ui/Breadcrumbs'

const PER_PAGE = 20

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [filtersOpen, setFiltersOpen] = useState(false)

  const category = searchParams.get('category') ?? ''
  const search = searchParams.get('search') ?? ''
  const page = parseInt(searchParams.get('page') ?? '1')
  const minPrice = searchParams.get('min_price')
    ? parseInt(searchParams.get('min_price')!)
    : undefined
  const maxPrice = searchParams.get('max_price')
    ? parseInt(searchParams.get('max_price')!)
    : undefined

  function updateParam(key: string, value: string | undefined) {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      if (value) next.set(key, value)
      else next.delete(key)
      next.delete('page') // reset to page 1 on filter change
      return next
    })
  }

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['products', { category, search, page, minPrice, maxPrice }],
    queryFn: () =>
      fetchProducts({
        category,
        search,
        page,
        limit: PER_PAGE,
        ...(minPrice !== undefined ? { min_price: minPrice } : {}),
        ...(maxPrice !== undefined ? { max_price: maxPrice } : {}),
      }),
  })

  const activeFiltersCount = [category, search, minPrice, maxPrice].filter(Boolean).length

  function clearAllFilters() {
    setSearchParams({})
  }

  return (
    <main className="min-h-screen">
      <div className="bg-cream border-b border-sand py-8">
        <div className="page-container">
          <Breadcrumbs crumbs={[{ label: 'Home', to: '/' }, { label: 'Shop' }]} className="mb-3" />
          <h1 className="font-serif text-display-sm text-charcoal-900">
            {category ? 'Collection' : 'All Products'}
          </h1>
          {data && (
            <p className="text-sm text-charcoal-500 mt-1">
              {data.pagination.total} {data.pagination.total === 1 ? 'product' : 'products'}
            </p>
          )}
        </div>
      </div>

      <div className="page-container py-8">
        {/* Mobile: Search + filter toggle */}
        <div className="flex items-center gap-3 mb-6 lg:hidden">
          <div className="flex-1">
            <SearchBar
              value={search}
              onChange={(v) => updateParam('search', v)}
            />
          </div>
          <button
            type="button"
            onClick={() => setFiltersOpen(true)}
            className="relative shrink-0 flex items-center gap-2 px-4 py-3 border border-sand rounded-lg text-sm font-medium text-charcoal-700 hover:border-burgundy-300 transition-colors"
            aria-expanded={filtersOpen}
          >
            <SlidersHorizontal className="w-4 h-4" aria-hidden />
            Filters
            {activeFiltersCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-4 h-4 flex items-center justify-center bg-burgundy-500 text-white text-[10px] font-bold rounded-full">
                {activeFiltersCount}
              </span>
            )}
          </button>
        </div>

        <div className="flex gap-8">
          {/* Sidebar filters — desktop */}
          <aside className="hidden lg:block w-56 shrink-0 space-y-8" aria-label="Product filters">
            <div>
              <SearchBar
                value={search}
                onChange={(v) => updateParam('search', v)}
              />
            </div>

            <CategoryFilter
              value={category}
              onChange={(v) => updateParam('category', v)}
            />

            <PriceFilter
              minPrice={minPrice}
              maxPrice={maxPrice}
              onChange={(min, max) => {
                setSearchParams((prev) => {
                  const next = new URLSearchParams(prev)
                  if (min !== undefined) next.set('min_price', String(min))
                  else next.delete('min_price')
                  if (max !== undefined) next.set('max_price', String(max))
                  else next.delete('max_price')
                  next.delete('page')
                  return next
                })
              }}
            />

            {activeFiltersCount > 0 && (
              <button
                type="button"
                onClick={clearAllFilters}
                className="flex items-center gap-1.5 text-xs text-burgundy-600 hover:text-burgundy-700 font-medium"
              >
                <X className="w-3.5 h-3.5" aria-hidden />
                Clear all filters
              </button>
            )}
          </aside>

          {/* Mobile filter drawer */}
          {filtersOpen && (
            <>
              <div
                className="fixed inset-0 z-40 bg-charcoal-900/40 lg:hidden"
                onClick={() => setFiltersOpen(false)}
                aria-hidden
              />
              <div
                role="dialog"
                aria-modal="true"
                aria-label="Filters"
                className="fixed left-0 top-0 bottom-0 z-50 w-72 bg-ivory-50 overflow-y-auto p-6 space-y-8 shadow-modal lg:hidden animate-slide-in-left"
              >
                <div className="flex items-center justify-between">
                  <h2 className="font-medium text-charcoal-900">Filters</h2>
                  <button
                    type="button"
                    onClick={() => setFiltersOpen(false)}
                    aria-label="Close filters"
                    className="p-1 rounded text-charcoal-500 hover:text-charcoal-800"
                  >
                    <X className="w-5 h-5" aria-hidden />
                  </button>
                </div>

                <CategoryFilter
                  value={category}
                  onChange={(v) => { updateParam('category', v); setFiltersOpen(false) }}
                />

                <PriceFilter
                  minPrice={minPrice}
                  maxPrice={maxPrice}
                  onChange={(min, max) => {
                    setSearchParams((prev) => {
                      const next = new URLSearchParams(prev)
                      if (min !== undefined) next.set('min_price', String(min))
                      else next.delete('min_price')
                      if (max !== undefined) next.set('max_price', String(max))
                      else next.delete('max_price')
                      next.delete('page')
                      return next
                    })
                    setFiltersOpen(false)
                  }}
                />

                {activeFiltersCount > 0 && (
                  <button
                    type="button"
                    onClick={() => { clearAllFilters(); setFiltersOpen(false) }}
                    className="flex items-center gap-1.5 text-xs text-burgundy-600 font-medium"
                  >
                    <X className="w-3.5 h-3.5" aria-hidden />
                    Clear all
                  </button>
                )}
              </div>
            </>
          )}

          {/* Product grid */}
          <div className="flex-1 min-w-0">
            {isLoading ? (
              <ProductGridSkeleton count={PER_PAGE} />
            ) : isError ? (
              <ErrorState
                title="Failed to load products"
                message="There was a problem fetching products. Please try again."
                retry={() => void refetch()}
              />
            ) : data?.products.length === 0 ? (
              <EmptyState
                title="No products found"
                description={
                  search
                    ? `No results for "${search}". Try a different search term or browse all products.`
                    : 'No products match your filters. Try adjusting or clearing them.'
                }
                action={
                  activeFiltersCount > 0
                    ? { label: 'Clear filters', onClick: clearAllFilters }
                    : undefined
                }
              />
            ) : (
              <>
                <ProductGrid products={data?.products ?? []} />

                {/* Pagination */}
                {data && data.pagination.pages > 1 && (
                  <nav
                    aria-label="Pagination"
                    className="flex items-center justify-center gap-2 mt-12"
                  >
                    <button
                      type="button"
                      disabled={page <= 1}
                      onClick={() => updateParam('page', String(page - 1))}
                      className="px-4 py-2 text-sm border border-sand rounded-lg hover:border-burgundy-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      Previous
                    </button>
                    <span className="text-sm text-charcoal-500">
                      Page {page} of {data.pagination.pages}
                    </span>
                    <button
                      type="button"
                      disabled={page >= data.pagination.pages}
                      onClick={() => updateParam('page', String(page + 1))}
                      className="px-4 py-2 text-sm border border-sand rounded-lg hover:border-burgundy-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      Next
                    </button>
                  </nav>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
