import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { X, Trash2, Plus, Minus } from 'lucide-react'
import { useCartStore, formatPrice } from '@/lib/cart'
import { imageUrl } from '@/lib/api'
import { EmptyCart } from '@/components/ui/EmptyState'
import Button from '@/components/ui/Button'

interface Props {
  open: boolean
  onClose: () => void
}

export default function CartDrawer({ open, onClose }: Props) {
  const items = useCartStore((s) => s.items)
  const subtotal = useCartStore((s) => s.subtotal())
  const updateQuantity = useCartStore((s) => s.updateQuantity)
  const removeItem = useCartStore((s) => s.removeItem)

  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-charcoal-900/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label="Shopping cart"
        className="fixed top-0 right-0 bottom-0 z-50 w-full max-w-sm bg-ivory-50 flex flex-col shadow-modal animate-slide-in-right"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-sand">
          <h2 className="font-serif text-lg font-medium text-charcoal-900">
            Cart ({items.length})
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close cart"
            className="btn-ghost p-2 rounded-full"
          >
            <X className="w-5 h-5" aria-hidden />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto py-4 px-5">
          {items.length === 0 ? (
            <EmptyCart />
          ) : (
            <ul className="space-y-4" aria-label="Cart items">
              {items.map((item) => {
                const img = item.product.primary_image
                  ? imageUrl(item.product.primary_image)
                  : '/placeholder-product.svg'
                const price = item.product.sale_price ?? item.product.price

                return (
                  <li
                    key={`${item.product.id}-${item.variant_size}-${item.variant_color}`}
                    className="flex gap-3"
                  >
                    {/* Thumbnail */}
                    <Link
                      to={`/shop/${item.product.slug}`}
                      onClick={onClose}
                      className="shrink-0 w-16 h-20 rounded-lg overflow-hidden bg-ivory-200"
                      tabIndex={-1}
                    >
                      <img
                        src={img}
                        alt={item.product.name}
                        className="w-full h-full object-cover"
                      />
                    </Link>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <Link
                        to={`/shop/${item.product.slug}`}
                        onClick={onClose}
                        className="text-sm font-medium text-charcoal-800 hover:text-burgundy-600 transition-colors line-clamp-2 leading-snug"
                      >
                        {item.product.name}
                      </Link>
                      {(item.variant_size || item.variant_color) && (
                        <p className="text-xs text-charcoal-500 mt-0.5">
                          {[item.variant_size, item.variant_color]
                            .filter(Boolean)
                            .join(' · ')}
                        </p>
                      )}
                      <p className="text-sm font-semibold text-burgundy-600 mt-1">
                        {formatPrice(price)}
                      </p>

                      {/* Quantity */}
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center border border-sand rounded-lg overflow-hidden">
                          <button
                            type="button"
                            aria-label="Decrease quantity"
                            onClick={() =>
                              updateQuantity(
                                item.product.id,
                                item.variant_size,
                                item.variant_color,
                                item.quantity - 1,
                              )
                            }
                            className="p-1.5 hover:bg-ivory-200 transition-colors"
                          >
                            <Minus className="w-3 h-3" aria-hidden />
                          </button>
                          <span className="px-3 text-sm font-medium min-w-[2rem] text-center">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            aria-label="Increase quantity"
                            onClick={() =>
                              updateQuantity(
                                item.product.id,
                                item.variant_size,
                                item.variant_color,
                                item.quantity + 1,
                              )
                            }
                            disabled={item.quantity >= 10}
                            className="p-1.5 hover:bg-ivory-200 transition-colors disabled:opacity-40"
                          >
                            <Plus className="w-3 h-3" aria-hidden />
                          </button>
                        </div>

                        <button
                          type="button"
                          aria-label={`Remove ${item.product.name}`}
                          onClick={() =>
                            removeItem(
                              item.product.id,
                              item.variant_size,
                              item.variant_color,
                            )
                          }
                          className="p-1.5 text-charcoal-400 hover:text-red-500 transition-colors rounded"
                        >
                          <Trash2 className="w-3.5 h-3.5" aria-hidden />
                        </button>
                      </div>
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-sand px-5 py-5 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-charcoal-600">Subtotal</span>
              <span className="text-base font-semibold text-charcoal-900">
                {formatPrice(subtotal)}
              </span>
            </div>
            <p className="text-xs text-charcoal-400">
              Taxes and shipping calculated at checkout.
            </p>
            <Button
              className="w-full"
              onClick={onClose}
              // eslint-disable-next-line react/no-children-prop
            >
              <Link to="/checkout" className="w-full flex items-center justify-center gap-2">
                Proceed to Checkout
              </Link>
            </Button>
          </div>
        )}
      </div>
    </>
  )
}
