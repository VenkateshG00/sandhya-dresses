import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { Heart, ShoppingCart } from 'lucide-react'
import { customerGetWishlist, customerRemoveFromWishlist } from '@/lib/api'
import { formatPrice } from '@/lib/cart'
import type { WishlistItem } from '@/types'

export default function AccountWishlist() {
  const queryClient = useQueryClient()

  const { data: items = [], isLoading } = useQuery<WishlistItem[]>({
    queryKey: ['customer-wishlist'],
    queryFn: customerGetWishlist,
  })

  const removeMutation = useMutation({
    mutationFn: (productId: number) => customerRemoveFromWishlist(productId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['customer-wishlist'] }),
  })

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-6">Wishlist</h2>

      {isLoading ? (
        <div className="grid grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-48 bg-gray-100 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-12">
          <Heart className="mx-auto mb-3 text-gray-300" size={48} />
          <p className="text-gray-500">Your wishlist is empty</p>
          <Link
            to="/shop"
            className="mt-4 inline-block px-4 py-2 bg-burgundy-700 text-white text-sm rounded-lg hover:bg-burgundy-800"
          >
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {items.map((item) => {
            const displayPrice = item.sale_price ?? item.price
            const hasDiscount = item.sale_price !== null && item.sale_price < item.price

            return (
              <div key={item.id} className="group relative border border-gray-100 rounded-xl overflow-hidden">
                <Link to={`/products/${item.slug}`}>
                  <div className="aspect-[3/4] bg-gray-100 flex items-center justify-center">
                    <span className="text-gray-300 text-sm">No image</span>
                  </div>
                </Link>
                <button
                  onClick={() => removeMutation.mutate(item.product_id)}
                  className="absolute top-2 right-2 p-1.5 bg-white rounded-full shadow-sm text-red-400 hover:text-red-600"
                  title="Remove from wishlist"
                >
                  <Heart size={14} fill="currentColor" />
                </button>
                <div className="p-3">
                  <Link to={`/products/${item.slug}`}>
                    <p className="text-sm font-medium text-gray-900 line-clamp-2 hover:text-burgundy-700">
                      {item.name}
                    </p>
                  </Link>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="text-sm font-semibold text-gray-900">{formatPrice(displayPrice)}</span>
                    {hasDiscount && (
                      <span className="text-xs text-gray-400 line-through">{formatPrice(item.price)}</span>
                    )}
                  </div>
                  <Link
                    to={`/products/${item.slug}`}
                    className="mt-2 flex items-center justify-center gap-1 w-full py-1.5 bg-burgundy-700 text-white text-xs rounded-lg hover:bg-burgundy-800 transition-colors"
                  >
                    <ShoppingCart size={12} /> View Product
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
