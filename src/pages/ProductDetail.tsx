import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ShoppingBag, Share2, Minus, Plus } from 'lucide-react'
import { fetchProduct, fetchProducts } from '@/lib/api'
import { useCartStore, formatPrice } from '@/lib/cart'
import ProductGallery from '@/components/product/ProductGallery'
import SizeChart from '@/components/product/SizeChart'
import ReturnPolicySnippet from '@/components/product/ReturnPolicySnippet'
import WhatsAppEnquiryButton from '@/components/checkout/WhatsAppEnquiryButton'
import ProductGrid from '@/components/product/ProductGrid'
import Breadcrumbs from '@/components/ui/Breadcrumbs'
import LoadingState from '@/components/ui/LoadingState'
import ErrorState from '@/components/ui/ErrorState'
import Button from '@/components/ui/Button'

export default function ProductDetail() {
  const { slug } = useParams<{ slug: string }>()
  const [selectedSize, setSelectedSize] = useState<string | null>(null)
  const [selectedColor, setSelectedColor] = useState<string | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [added, setAdded] = useState(false)

  const addItem = useCartStore((s) => s.addItem)

  const { data: product, isLoading, isError, refetch } = useQuery({
    queryKey: ['product', slug],
    queryFn: () => fetchProduct(slug!),
    enabled: !!slug,
  })

  const { data: related } = useQuery({
    queryKey: ['products', 'related', product?.category_slug],
    queryFn: () =>
      fetchProducts({ category: product!.category_slug!, limit: 4 }),
    enabled: !!product?.category_slug,
  })

  function handleAddToCart() {
    if (!product) return

    if (product.sizes.length > 0 && !selectedSize) {
      alert('Please select a size')
      return
    }

    addItem(
      {
        id: product.id,
        slug: product.slug,
        name: product.name,
        price: product.price,
        sale_price: product.sale_price,
        stock: product.stock,
        primary_image: product.images?.[0]?.r2_key,
      },
      { size: selectedSize, color: selectedColor, quantity },
    )

    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  async function handleShare() {
    try {
      await navigator.share({
        ...(product?.name ? { title: product.name } : {}),
        url: window.location.href,
      })
    } catch {
      await navigator.clipboard.writeText(window.location.href)
    }
  }

  if (isLoading) return <LoadingState message="Loading product…" className="min-h-[60vh]" />
  if (isError || !product) {
    return (
      <ErrorState
        title="Product not found"
        message="This product may have been removed or the link is incorrect."
        retry={() => void refetch()}
      />
    )
  }

  const hasDiscount = product.sale_price !== null && product.sale_price < product.price
  const maxQty = product.stock > 0 ? Math.min(product.stock, 10) : 10
  const inStock = product.stock > 0

  const relatedProducts = related?.products.filter((p) => p.id !== product.id).slice(0, 4) ?? []

  return (
    <main>
      <div className="page-container py-6 lg:py-10">
        <div className="mb-6">
          <Breadcrumbs
            crumbs={[
              { label: 'Home', to: '/' },
              { label: 'Shop', to: '/shop' },
              ...(product.category_name
                ? [{ label: product.category_name, to: `/shop?category=${product.category_slug}` }]
                : []),
              { label: product.name },
            ]}
          />
        </div>

        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16">
          {/* Gallery */}
          <div>
            <ProductGallery images={product.images} productName={product.name} />
          </div>

          {/* Details */}
          <div className="space-y-6">
            {product.category_name && (
              <p className="text-xs text-charcoal-400 uppercase tracking-widest">
                {product.category_name}
              </p>
            )}

            <div className="flex items-start justify-between gap-4">
              <h1 className="font-serif text-2xl lg:text-display-sm text-charcoal-900 leading-snug">
                {product.name}
              </h1>
              <button
                type="button"
                onClick={() => void handleShare()}
                aria-label="Share this product"
                className="btn-ghost p-2 rounded-full shrink-0"
              >
                <Share2 className="w-5 h-5" aria-hidden />
              </button>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3">
              {hasDiscount ? (
                <>
                  <span className="text-2xl font-semibold text-burgundy-600">
                    {formatPrice(product.sale_price!)}
                  </span>
                  <span className="text-lg text-charcoal-400 line-through">
                    {formatPrice(product.price)}
                  </span>
                  <span className="tag-burgundy">
                    Save {Math.round(((product.price - product.sale_price!) / product.price) * 100)}%
                  </span>
                </>
              ) : (
                <span className="text-2xl font-medium text-charcoal-800">
                  {product.price > 0 ? formatPrice(product.price) : 'Price on enquiry'}
                </span>
              )}
            </div>

            {/* Stock status */}
            <p
              className={`text-sm font-medium ${
                inStock ? 'text-green-600' : 'text-red-500'
              }`}
            >
              {inStock ? `In stock (${product.stock} available)` : 'Out of stock'}
            </p>

            {/* Description */}
            {product.description && (
              <p className="text-charcoal-600 leading-relaxed text-sm">{product.description}</p>
            )}

            {/* Sizes */}
            {product.sizes.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-charcoal-700">
                    Size {selectedSize && <span className="text-charcoal-400">— {selectedSize}</span>}
                  </span>
                  <SizeChart availableSizes={product.sizes} />
                </div>
                <div className="flex flex-wrap gap-2" role="group" aria-label="Select size">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => setSelectedSize(size === selectedSize ? null : size)}
                      aria-pressed={selectedSize === size}
                      className={`min-w-[3rem] px-3 py-2 text-sm font-medium border rounded-lg transition-colors ${
                        selectedSize === size
                          ? 'border-burgundy-500 bg-burgundy-50 text-burgundy-700'
                          : 'border-sand hover:border-burgundy-300 text-charcoal-700'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Colors */}
            {product.colors.length > 0 && (
              <div>
                <span className="text-sm font-medium text-charcoal-700 block mb-2">
                  Color {selectedColor && <span className="text-charcoal-400">— {selectedColor}</span>}
                </span>
                <div className="flex flex-wrap gap-2" role="group" aria-label="Select color">
                  {product.colors.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setSelectedColor(color === selectedColor ? null : color)}
                      aria-pressed={selectedColor === color}
                      className={`px-3 py-2 text-sm border rounded-lg transition-colors ${
                        selectedColor === color
                          ? 'border-burgundy-500 bg-burgundy-50 text-burgundy-700'
                          : 'border-sand hover:border-burgundy-300 text-charcoal-700'
                      }`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity + Add to cart */}
            {inStock && (
              <div className="flex items-center gap-3">
                {/* Quantity */}
                <div className="flex items-center border border-sand rounded-lg overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    disabled={quantity <= 1}
                    aria-label="Decrease quantity"
                    className="p-3 hover:bg-ivory-100 transition-colors disabled:opacity-40"
                  >
                    <Minus className="w-4 h-4" aria-hidden />
                  </button>
                  <span className="px-5 text-sm font-semibold min-w-[3rem] text-center">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.min(maxQty, q + 1))}
                    disabled={quantity >= maxQty}
                    aria-label="Increase quantity"
                    className="p-3 hover:bg-ivory-100 transition-colors disabled:opacity-40"
                  >
                    <Plus className="w-4 h-4" aria-hidden />
                  </button>
                </div>

                <Button
                  onClick={handleAddToCart}
                  className="flex-1"
                  disabled={added}
                >
                  <ShoppingBag className="w-4 h-4" aria-hidden />
                  {added ? 'Added!' : 'Add to Cart'}
                </Button>
              </div>
            )}

            {/* WhatsApp enquiry */}
            <WhatsAppEnquiryButton
              product={product}
              selectedSize={selectedSize}
              selectedColor={selectedColor}
              className="w-full"
            />

            {/* Care instructions */}
            {product.care_instructions && (
              <details className="group border border-sand rounded-lg">
                <summary className="flex items-center justify-between px-4 py-3 cursor-pointer text-sm font-medium text-charcoal-700 select-none hover:text-burgundy-600 transition-colors">
                  Care Instructions
                  <span className="text-charcoal-400 group-open:rotate-180 transition-transform" aria-hidden>▾</span>
                </summary>
                <div className="px-4 pb-4 text-sm text-charcoal-600 leading-relaxed">
                  {product.care_instructions}
                </div>
              </details>
            )}

            {/* Return policy */}
            <ReturnPolicySnippet />

            {/* SKU */}
            {product.sku && (
              <p className="text-xs text-charcoal-400">SKU: {product.sku}</p>
            )}
          </div>
        </div>

        {/* Related products */}
        {relatedProducts.length > 0 && (
          <section className="mt-16 pt-12 border-t border-sand" aria-labelledby="related-heading">
            <h2 id="related-heading" className="font-serif text-xl text-charcoal-900 mb-6">
              You may also like
            </h2>
            <ProductGrid products={relatedProducts} />
          </section>
        )}
      </div>
    </main>
  )
}
