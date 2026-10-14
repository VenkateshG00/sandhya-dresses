// ── Shared domain types ───────────────────────────────────────────────────────

export interface Category {
  id: number
  name: string
  slug: string
  sort_order: number
}

export interface ProductImage {
  id: number
  product_id: number
  r2_key: string
  alt: string
  sort_order: number
  url: string
}

export interface Product {
  id: number
  slug: string
  name: string
  description: string
  category_id: number | null
  category_name: string | null
  category_slug: string | null
  price: number // in paise
  sale_price: number | null // in paise
  sizes: string[] // parsed from JSON
  colors: string[] // parsed from JSON
  sku: string | null
  status: 'active' | 'draft' | 'archived'
  stock: number
  care_instructions: string
  created_at: string
  updated_at: string
  images: ProductImage[]
  primary_image?: string // r2_key of first image (list view)
}

export interface OrderAddress {
  line1: string
  line2: string
  city: string
  state: string
  pin: string
  country: string
}

export interface OrderItem {
  product_id: number
  product_name: string
  product_slug: string
  variant_size: string | null
  variant_color: string | null
  quantity: number
  unit_price: number // in paise
}

export type PaymentMethod = 'razorpay' | 'upi' | 'cod'
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded' | 'cancelled'
export type OrderStatus = 'placed' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded'

export interface Order {
  id: number
  order_number: string
  customer_name: string
  phone: string
  email: string | null
  address: OrderAddress
  items: OrderItem[]
  subtotal: number
  shipping: number
  total: number
  payment_method: PaymentMethod
  payment_status: PaymentStatus
  razorpay_order_id: string | null
  razorpay_payment_id: string | null
  order_status: OrderStatus
  notes: string | null
  whatsapp_sent: boolean
  created_at: string
  updated_at: string
}

export interface SiteConfig {
  store_name: string
  store_phone: string
  store_whatsapp: string
  store_email: string
  store_hours: string
  store_address_line1: string
  store_address_line2: string
  store_address_city: string
  store_address_state: string
  store_address_pin: string
  google_maps_url: string
  razorpay_enabled: string
  cod_enabled: string
  upi_enabled: string
  upi_id: string
  upi_qr_r2_key: string
  announcement_text: string
  announcement_active: string
  return_policy: string
  shipping_policy: string
}

// ── Cart ──────────────────────────────────────────────────────────────────────

export interface CartItem {
  product: Pick<Product, 'id' | 'slug' | 'name' | 'price' | 'sale_price' | 'stock' | 'primary_image'>
  variant_size: string | null
  variant_color: string | null
  quantity: number
}

// ── API responses ─────────────────────────────────────────────────────────────

export interface ProductsResponse {
  products: Product[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

export interface CreateOrderResponse {
  order_number: string
  total: number
  subtotal: number
  shipping: number
  payment_method: PaymentMethod
  razorpay_order_id: string | null
  razorpay_key_id: string | null
}

// ── Customer accounts ─────────────────────────────────────────────────────────

export interface Customer {
  id: number
  name: string
  email: string
  phone: string | null
  created_at: string
}

export interface CustomerAddress {
  id: number
  customer_id: number
  label: string
  line1: string
  line2: string
  city: string
  state: string
  pin: string
  country: string
  is_default: number
  created_at: string
}

export interface WishlistItem {
  id: number
  product_id: number
  name: string
  slug: string
  price: number
  sale_price: number | null
  status: string
}

export interface AuthResponse {
  role: 'admin' | 'customer'
  name?: string | undefined
  email?: string | undefined
  authenticated?: boolean | undefined
}

// ── Razorpay global ───────────────────────────────────────────────────────────

export interface RazorpayOptions {
  key: string
  amount: number
  currency: string
  order_id: string
  name: string
  description: string
  prefill: {
    name: string
    contact: string
    email?: string
  }
  theme: { color: string }
  handler: (response: RazorpayPaymentResponse) => void
  modal: { ondismiss: () => void }
}

export interface RazorpayPaymentResponse {
  razorpay_payment_id: string
  razorpay_order_id: string
  razorpay_signature: string
}

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => { open(): void }
  }
}
