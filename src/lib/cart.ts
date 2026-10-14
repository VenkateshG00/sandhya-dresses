import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { CartItem, Product } from '@/types'

interface CartState {
  items: CartItem[]
  addItem: (
    product: CartItem['product'],
    opts: { size: string | null; color: string | null; quantity: number },
  ) => void
  removeItem: (productId: number, size: string | null, color: string | null) => void
  updateQuantity: (
    productId: number,
    size: string | null,
    color: string | null,
    quantity: number,
  ) => void
  clearCart: () => void
  itemCount: () => number
  subtotal: () => number
}

function itemKey(id: number, size: string | null, color: string | null): string {
  return `${id}__${size ?? ''}__${color ?? ''}`
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem(product, { size, color, quantity }) {
        const key = itemKey(product.id, size, color)
        const existing = get().items.find(
          (i) => itemKey(i.product.id, i.variant_size, i.variant_color) === key,
        )

        if (existing) {
          const newQty = Math.min(
            existing.quantity + quantity,
            product.stock > 0 ? Math.min(product.stock, 10) : 10,
          )
          set((s) => ({
            items: s.items.map((i) =>
              itemKey(i.product.id, i.variant_size, i.variant_color) === key
                ? { ...i, quantity: newQty }
                : i,
            ),
          }))
        } else {
          set((s) => ({
            items: [
              ...s.items,
              { product, variant_size: size, variant_color: color, quantity },
            ],
          }))
        }
      },

      removeItem(productId, size, color) {
        const key = itemKey(productId, size, color)
        set((s) => ({
          items: s.items.filter(
            (i) => itemKey(i.product.id, i.variant_size, i.variant_color) !== key,
          ),
        }))
      },

      updateQuantity(productId, size, color, quantity) {
        if (quantity <= 0) {
          get().removeItem(productId, size, color)
          return
        }
        const key = itemKey(productId, size, color)
        set((s) => ({
          items: s.items.map((i) =>
            itemKey(i.product.id, i.variant_size, i.variant_color) === key
              ? { ...i, quantity: Math.min(quantity, 10) }
              : i,
          ),
        }))
      },

      clearCart() {
        set({ items: [] })
      },

      itemCount() {
        return get().items.reduce((sum, i) => sum + i.quantity, 0)
      },

      subtotal() {
        return get().items.reduce((sum, i) => {
          const price = i.product.sale_price ?? i.product.price
          return sum + price * i.quantity
        }, 0)
      },
    }),
    {
      name: 'sd-cart',
      version: 1,
    },
  ),
)

export function formatPrice(paise: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(paise / 100)
}

export function cartItemsToOrderItems(
  items: CartItem[],
): {
  product_id: number
  product_name: string
  product_slug: string
  variant_size: string | null
  variant_color: string | null
  quantity: number
  unit_price: number
}[] {
  return items.map((item) => ({
    product_id: item.product.id,
    product_name: item.product.name,
    product_slug: item.product.slug,
    variant_size: item.variant_size,
    variant_color: item.variant_color,
    quantity: item.quantity,
    unit_price: item.product.sale_price ?? item.product.price,
  }))
}

export function buildWhatsAppOrderMessage(
  orderNumber: string,
  items: CartItem[],
  total: number,
  phone: string,
): string {
  const itemLines = items
    .map((i) => {
      const price = formatPrice((i.product.sale_price ?? i.product.price) * i.quantity)
      const variant = [i.variant_size, i.variant_color].filter(Boolean).join(', ')
      return `• ${i.product.name}${variant ? ` (${variant})` : ''} × ${i.quantity} = ${price}`
    })
    .join('\n')

  const message = [
    `*New Order from Sandhya Dresses Website*`,
    `Order #: ${orderNumber}`,
    '',
    '*Items:*',
    itemLines,
    '',
    `*Total: ${formatPrice(total)}*`,
    '',
    'Please confirm this order. Thank you!',
  ].join('\n')

  const waNumber = phone.replace(/\D/g, '')
  return `https://wa.me/${waNumber}?text=${encodeURIComponent(message)}`
}

export function buildWhatsAppProductEnquiry(
  product: Pick<Product, 'name' | 'slug'>,
  size: string | null,
  color: string | null,
  whatsappNumber: string,
): string {
  const variant = [size && `Size: ${size}`, color && `Color: ${color}`]
    .filter(Boolean)
    .join(', ')

  const productUrl = `${window.location.origin}/shop/${product.slug}`

  const message = [
    `Hi, I'm interested in:`,
    `*${product.name}*`,
    variant ? variant : null,
    productUrl,
    '',
    'Could you please share availability and price? Thank you.',
  ]
    .filter((l) => l !== null)
    .join('\n')

  const number = whatsappNumber.replace(/\D/g, '')
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`
}
