import type {
  Product,
  ProductsResponse,
  Category,
  SiteConfig,
  CreateOrderResponse,
  Order,
  Customer,
  CustomerAddress,
  WishlistItem,
  AuthResponse,
} from '@/types'

const BASE = '/api'

async function request<T>(
  path: string,
  options?: RequestInit,
): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    credentials: 'include',
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options?.headers ?? {}),
    },
  })

  if (!res.ok) {
    let message = `Request failed: ${res.status}`
    try {
      const body = await res.json() as { error?: string }
      if (body.error) message = body.error
    } catch { /* ignore */ }
    throw new Error(message)
  }

  return res.json() as Promise<T>
}

// ── Products ──────────────────────────────────────────────────────────────────

export interface ProductFilters {
  category?: string | undefined
  search?: string | undefined
  min_price?: number | undefined
  max_price?: number | undefined
  page?: number | undefined
  limit?: number | undefined
  status?: string | undefined
}

export function buildProductQueryString(filters: ProductFilters): string {
  const params = new URLSearchParams()
  if (filters.category) params.set('category', filters.category)
  if (filters.search) params.set('search', filters.search)
  if (filters.min_price !== undefined) params.set('min_price', String(filters.min_price))
  if (filters.max_price !== undefined) params.set('max_price', String(filters.max_price))
  if (filters.page !== undefined) params.set('page', String(filters.page))
  if (filters.limit !== undefined) params.set('limit', String(filters.limit))
  const qs = params.toString()
  return qs ? `?${qs}` : ''
}

export function normalizeProduct(raw: Record<string, unknown>): Product {
  return {
    ...raw,
    sizes: typeof raw.sizes === 'string' ? JSON.parse(raw.sizes) as string[] : (raw.sizes as string[] ?? []),
    colors: typeof raw.colors === 'string' ? JSON.parse(raw.colors) as string[] : (raw.colors as string[] ?? []),
    images: (raw.images as Product['images'] | undefined) ?? [],
  } as Product
}

export async function fetchProducts(filters: ProductFilters = {}): Promise<ProductsResponse> {
  const qs = buildProductQueryString(filters)
  const res = await request<{ products: Record<string, unknown>[]; pagination: ProductsResponse['pagination'] }>(
    `/products${qs}`,
  )
  return {
    products: res.products.map(normalizeProduct),
    pagination: res.pagination,
  }
}

export async function fetchProduct(slug: string): Promise<Product> {
  const res = await request<{ product: Record<string, unknown> }>(`/products/${slug}`)
  return normalizeProduct(res.product)
}

export async function fetchCategories(): Promise<Category[]> {
  const res = await request<{ categories: Category[] }>('/products/categories')
  return res.categories
}

// ── Site config ───────────────────────────────────────────────────────────────

export async function fetchConfig(): Promise<SiteConfig> {
  const res = await request<{ config: SiteConfig }>('/config')
  return res.config
}

// ── Orders ────────────────────────────────────────────────────────────────────

export interface CreateOrderPayload {
  customer_name: string
  phone: string
  email?: string | undefined
  notes?: string | undefined
  address: {
    line1: string
    line2: string
    city: string
    state: string
    pin: string
    country: string
  }
  items: {
    product_id: number
    product_name: string
    product_slug: string
    variant_size: string | null
    variant_color: string | null
    quantity: number
    unit_price: number
  }[]
  payment_method: 'razorpay' | 'upi' | 'cod'
}

export async function createOrder(
  payload: CreateOrderPayload,
): Promise<CreateOrderResponse> {
  return request<CreateOrderResponse>('/orders', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function fetchOrderStatus(orderNumber: string): Promise<Partial<Order>> {
  const res = await request<{ order: Partial<Order> }>(`/orders/${orderNumber}`)
  return res.order
}

// ── Admin ─────────────────────────────────────────────────────────────────────

export async function adminLogin(password: string): Promise<void> {
  await request('/admin/login', {
    method: 'POST',
    body: JSON.stringify({ password }),
  })
}

export async function adminLogout(): Promise<void> {
  await request('/admin/logout', { method: 'POST' })
}

export async function adminVerify(): Promise<boolean> {
  try {
    await request('/admin/verify')
    return true
  } catch {
    return false
  }
}

export async function adminFetchDashboard() {
  return request<{
    stats: {
      today: { count: number; revenue: number }
      week: { count: number; revenue: number }
      month: { count: number; revenue: number }
    }
    recent_orders: unknown[]
    low_stock: unknown[]
  }>('/admin/dashboard')
}

export async function adminFetchProduct(id: number): Promise<Product> {
  const res = await request<{ product: Record<string, unknown> }>(`/admin/products/${id}`)
  return normalizeProduct(res.product)
}

export async function adminFetchProducts(params: ProductFilters & { status?: string } = {}) {
  const qs = buildProductQueryString(params)
  const res = await request<{ products: Record<string, unknown>[]; pagination: ProductsResponse['pagination'] }>(
    `/admin/products${qs}`,
  )
  return { products: res.products.map(normalizeProduct), pagination: res.pagination }
}

export async function adminCreateProduct(data: unknown) {
  return request<{ id: number }>('/admin/products', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export async function adminUpdateProduct(id: number, data: unknown) {
  return request<{ ok: boolean }>(`/admin/products/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}

export async function adminDeleteProduct(id: number) {
  return request<{ ok: boolean }>(`/admin/products/${id}`, {
    method: 'DELETE',
  })
}

export async function adminFetchOrders(params: {
  page?: number
  payment_status?: string
  order_status?: string
  search?: string
} = {}) {
  const qs = new URLSearchParams()
  if (params.page) qs.set('page', String(params.page))
  if (params.payment_status) qs.set('payment_status', params.payment_status)
  if (params.order_status) qs.set('order_status', params.order_status)
  if (params.search) qs.set('search', params.search)
  const q = qs.toString()
  return request<{ orders: Order[]; pagination: { total: number; page: number; limit: number } }>(
    `/admin/orders${q ? `?${q}` : ''}`,
  )
}

export async function adminUpdateOrder(id: number, data: unknown) {
  return request<{ ok: boolean }>(`/admin/orders/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}

export async function adminFetchConfig() {
  return request<{ config: Record<string, string> }>('/admin/config')
}

export async function adminUpdateConfig(data: Record<string, string>) {
  return request<{ ok: boolean }>('/admin/config', {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}

export async function adminUploadImage(file: File, opts: {
  product_id?: number | undefined
  folder?: 'products' | 'config' | undefined
  alt?: string | undefined
  sort_order?: number | undefined
}) {
  const form = new FormData()
  form.append('file', file)
  if (opts.product_id) form.append('product_id', String(opts.product_id))
  form.append('folder', opts.folder ?? 'products')
  if (opts.alt) form.append('alt', opts.alt)
  if (opts.sort_order !== undefined) form.append('sort_order', String(opts.sort_order))

  const res = await fetch(`${BASE}/admin/images/upload`, {
    method: 'POST',
    credentials: 'include',
    body: form,
  })

  if (!res.ok) {
    const body = await res.json() as { error?: string }
    throw new Error(body.error ?? 'Upload failed')
  }

  return res.json() as Promise<{ key: string; url: string }>
}

export function imageUrl(r2Key: string): string {
  if (!r2Key) return '/placeholder-product.svg'
  if (r2Key.startsWith('http')) return r2Key
  return `/api/images/${r2Key}`
}

// ── Auth (customer + admin unified) ──────────────────────────────────────────

export async function authRegister(data: {
  name: string
  email: string
  password: string
  phone?: string | undefined
}): Promise<AuthResponse> {
  return request<AuthResponse>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export async function authLogin(data: {
  email: string
  password: string
}): Promise<AuthResponse> {
  return request<AuthResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export async function authLogout(): Promise<void> {
  await request('/auth/logout', { method: 'POST' })
}

export async function authMe(): Promise<{ authenticated: boolean; customer?: Customer | undefined }> {
  try {
    return await request<{ authenticated: boolean; customer?: Customer | undefined }>('/auth/me')
  } catch {
    return { authenticated: false }
  }
}

// ── Customer account ──────────────────────────────────────────────────────────

export async function customerGetProfile(): Promise<Customer> {
  return request<Customer>('/customer/profile')
}

export async function customerUpdateProfile(data: { name?: string; phone?: string }): Promise<void> {
  await request('/customer/profile', { method: 'PUT', body: JSON.stringify(data) })
}

export async function customerChangePassword(data: {
  current_password: string
  new_password: string
}): Promise<void> {
  await request('/customer/password', { method: 'PUT', body: JSON.stringify(data) })
}

export interface CustomerOrderSummary {
  id: number
  order_number: string
  total: number
  payment_method: string
  payment_status: string
  order_status: string
  created_at: string
}

export async function customerGetOrders(): Promise<CustomerOrderSummary[]> {
  return request<CustomerOrderSummary[]>('/customer/orders')
}

export async function customerGetOrder(orderId: number): Promise<Order> {
  return request<Order>(`/customer/orders/${orderId}`)
}

export async function customerGetAddresses(): Promise<CustomerAddress[]> {
  return request<CustomerAddress[]>('/customer/addresses')
}

export async function customerAddAddress(data: Omit<CustomerAddress, 'id' | 'customer_id' | 'created_at'>): Promise<{ id: number }> {
  return request<{ id: number }>('/customer/addresses', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export async function customerUpdateAddress(id: number, data: Omit<CustomerAddress, 'id' | 'customer_id' | 'created_at'>): Promise<void> {
  await request(`/customer/addresses/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}

export async function customerDeleteAddress(id: number): Promise<void> {
  await request(`/customer/addresses/${id}`, { method: 'DELETE' })
}

export async function customerGetWishlist(): Promise<WishlistItem[]> {
  return request<WishlistItem[]>('/customer/wishlist')
}

export async function customerAddToWishlist(productId: number): Promise<void> {
  await request(`/customer/wishlist/${productId}`, { method: 'POST' })
}

export async function customerRemoveFromWishlist(productId: number): Promise<void> {
  await request(`/customer/wishlist/${productId}`, { method: 'DELETE' })
}
