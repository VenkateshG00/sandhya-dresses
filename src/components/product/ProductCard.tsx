import { Link } from 'react-router-dom'
import { ShoppingBag } from 'lucide-react'
import type { Product } from '@/types'
import { imageUrl } from '@/lib/api'
import { formatPrice } from '@/lib/cart'
import { cn } from '@/lib/utils'

interface Props {
  product: Product
  className?: string
  priority?: boolean
}

export default function ProductCard({ product, className, priority }: Props) {
  const img = product.primary_image
    ? imageUrl(product.primary_image)
    : product.images?.[0]?.r2_key
    ? imageUrl(product.images[0].r2_key)
    : '/placeholder-product.svg'

  const hasDiscount = product.sale_price !== null && product.sale_price < product.price

  return (
    <article className={cn('group relative', className)}>
      <Link
        to={`/shop/${product.slug}`}
        aria-label={product.name}
        className="block"
      >
        {/* Image */}
        <div className="relative overflow-hidden rounded-lg bg-ivory-200 aspect-product mb-3">
          <img
            src={img}
            alt={product.name}
            loading={priority ? 'eager' : 'lazy'}
            decoding="async"
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />

          {hasDiscount && (
            <span className="badge-sale" aria-label="On sale">
              Sale
            </span>
          )}

          {product.stock === 0 && (
            <div className="absolute inset-0 bg-charcoal-900/40 flex items-center justify-center rounded-lg">
              <span className="px-3 py-1 bg-white/90 text-charcoal-700 text-xs font-medium rounded-full">
                Out of Stock
              </span>
            </div>
          )}

          {/* Quick add overlay */}
          {product.stock > 0 && (
            <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-200">
              <div className="flex items-center justify-center gap-1.5 bg-white/95 backdrop-blur-sm rounded-md py-2 px-3 text-xs font-medium text-charcoal-700 shadow-sm">
                <ShoppingBag className="w-3.5 h-3.5" aria-hidden />
                View product
              </div>
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          {product.category_name && (
            <p className="text-[11px] text-charcoal-400 uppercase tracking-wider mb-0.5">
              {product.category_name}
            </p>
          )}
          <h3 className="text-sm font-medium text-charcoal-800 group-hover:text-burgundy-600 transition-colors line-clamp-2 leading-snug mb-1">
            {product.name}
          </h3>
          <div className="flex items-center gap-2">
            {hasDiscount ? (
              <>
                <span className="text-sm font-semibold text-burgundy-600">
                  {formatPrice(product.sale_price!)}
                </span>
                <span className="text-xs text-charcoal-400 line-through">
                  {formatPrice(product.price)}
                </span>
              </>
            ) : (
              <span className="text-sm font-medium text-charcoal-700">
                {product.price > 0 ? formatPrice(product.price) : 'Price on enquiry'}
              </span>
            )}
          </div>
        </div>
      </Link>
    </article>
  )
}
