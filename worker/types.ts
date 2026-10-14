export interface Env {
  DB: D1Database
  // IMAGES?: R2Bucket  // R2 — uncomment when R2 is enabled
  ASSETS: Fetcher
  RAZORPAY_KEY_ID: string
  RAZORPAY_KEY_SECRET: string
  ADMIN_PASSWORD_HASH: string
  SESSION_SECRET: string
  ENVIRONMENT: string
  SITE_URL: string
  CLOUDINARY_CLOUD_NAME: string
  CLOUDINARY_API_KEY: string
  CLOUDINARY_API_SECRET: string
}

// ── DB row shapes ─────────────────────────────────────────────────────────────

export interface CategoryRow {
  id: number
  name: string
  slug: string
  sort_order: number
  created_at: string
}

export interface ProductRow {
  id: number
  slug: string
  name: string
  description: string
  category_id: number | null
  price: number
  sale_price: number | null
  sizes: string
  colors: string
  sku: string | null
  status: 'active' | 'draft' | 'archived'
  stock: number
  care_instructions: string
  created_at: string
  updated_at: string
  // joined
  category_name?: string
  category_slug?: string
  images?: ProductImageRow[]
}

export interface ProductImageRow {
  id: number
  product_id: number
  r2_key: string
  alt: string
  sort_order: number
  created_at: string
}

export interface OrderRow {
  id: number
  order_number: string
  customer_name: string
  phone: string
  email: string | null
  address: string
  items: string
  subtotal: number
  shipping: number
  total: number
  payment_method: 'razorpay' | 'upi' | 'cod'
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded' | 'cancelled'
  razorpay_order_id: string | null
  razorpay_payment_id: string | null
  razorpay_signature: string | null
  order_status: 'placed' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded'
  notes: string | null
  whatsapp_sent: number
  created_at: string
  updated_at: string
}

export interface AdminSessionRow {
  id: number
  token_hash: string
  created_at: string
  expires_at: string
}

export interface CustomerRow {
  id: number
  name: string
  email: string
  password_hash: string
  phone: string | null
  created_at: string
  updated_at: string
}

export interface CustomerSessionRow {
  id: number
  customer_id: number
  token_hash: string
  expires_at: string
  created_at: string
}

export interface CustomerAddressRow {
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

export interface WishlistRow {
  id: number
  customer_id: number
  product_id: number
  created_at: string
}

// ── API request/response shapes ───────────────────────────────────────────────

export interface OrderItem {
  product_id: number
  product_name: string
  product_slug: string
  variant_size: string | null
  variant_color: string | null
  quantity: number
  unit_price: number
}

export interface OrderAddress {
  line1: string
  line2: string
  city: string
  state: string
  pin: string
  country: string
}

export interface CreateOrderPayload {
  customer_name: string
  phone: string
  email?: string
  address: OrderAddress
  items: OrderItem[]
  payment_method: 'razorpay' | 'upi' | 'cod'
  notes?: string
}

export interface RazorpayWebhookPayload {
  event: string
  payload: {
    payment: {
      entity: {
        id: string
        order_id: string
        amount: number
        status: string
      }
    }
  }
}
