import { Hono } from 'hono'
import { z } from 'zod'
import type { Env } from '../types'
import {
  requireAdmin,
  verifyAdminPassword,
  createSession,
  deleteSession,
  getSessionToken,
  setSessionCookie,
  clearSessionCookie,
} from '../lib/auth'
import { uploadImage, deleteImage } from '../lib/r2'
import { listProducts, getAllConfig, setConfig } from '../lib/db'

const admin = new Hono<{ Bindings: Env }>()

// ── Auth ──────────────────────────────────────────────────────────────────────

admin.post('/login', async (c) => {
  let body: unknown
  try {
    body = await c.req.json()
  } catch {
    return c.json({ error: 'Invalid request' }, 400)
  }

  const parsed = z.object({
    password: z.string().min(1),
  }).safeParse(body)

  if (!parsed.success) {
    return c.json({ error: 'Password required' }, 400)
  }

  const valid = await verifyAdminPassword(
    parsed.data.password,
    c.env.ADMIN_PASSWORD_HASH,
  )

  if (!valid) {
    await new Promise((r) => setTimeout(r, 400)) // Slow brute-force
    return c.json({ error: 'Invalid credentials' }, 401)
  }

  const token = await createSession(c.env.DB)
  return c.json(
    { ok: true },
    200,
    { 'Set-Cookie': setSessionCookie(token) },
  )
})

admin.post('/logout', async (c) => {
  const token = getSessionToken(c)
  if (token) await deleteSession(c.env.DB, token)
  return c.json({ ok: true }, 200, { 'Set-Cookie': clearSessionCookie() })
})

admin.get('/verify', async (c) => {
  const ok = await requireAdmin(c)
  if (!ok) return c.json({ authenticated: false }, 401)
  return c.json({ authenticated: true })
})

// ── Auth middleware for all routes below ─────────────────────────────────────

admin.use('*', async (c, next) => {
  const ok = await requireAdmin(c)
  if (!ok) return c.json({ error: 'Unauthorized' }, 401)
  return next()
})

// ── Dashboard stats ───────────────────────────────────────────────────────────

admin.get('/dashboard', async (c) => {
  const [today, week, month, recentOrders, lowStock] = await Promise.all([
    c.env.DB.prepare(
      `SELECT COUNT(*) as count, COALESCE(SUM(total),0) as revenue
       FROM orders WHERE payment_status = 'paid'
         AND date(created_at) = date('now')`,
    ).first<{ count: number; revenue: number }>(),

    c.env.DB.prepare(
      `SELECT COUNT(*) as count, COALESCE(SUM(total),0) as revenue
       FROM orders WHERE payment_status = 'paid'
         AND created_at >= datetime('now', '-7 days')`,
    ).first<{ count: number; revenue: number }>(),

    c.env.DB.prepare(
      `SELECT COUNT(*) as count, COALESCE(SUM(total),0) as revenue
       FROM orders WHERE payment_status = 'paid'
         AND created_at >= datetime('now', '-30 days')`,
    ).first<{ count: number; revenue: number }>(),

    c.env.DB.prepare(
      `SELECT order_number, customer_name, total, payment_method, order_status, created_at
       FROM orders ORDER BY created_at DESC LIMIT 10`,
    ).all(),

    c.env.DB.prepare(
      `SELECT id, name, stock, sku FROM products
       WHERE status = 'active' AND stock <= (
         SELECT CAST(value AS INTEGER) FROM site_config WHERE key = 'low_stock_threshold'
       )
       ORDER BY stock ASC`,
    ).all(),
  ])

  return c.json({
    stats: { today, week, month },
    recent_orders: recentOrders.results,
    low_stock: lowStock.results,
  })
})

// ── Products ──────────────────────────────────────────────────────────────────

admin.get('/products', async (c) => {
  const query = c.req.query()
  const page = Math.max(1, parseInt(query.page ?? '1'))
  const limit = Math.min(100, parseInt(query.limit ?? '30'))

  const { products, total } = await listProducts(c.env.DB, {
    category: query.category,
    search: query.search,
    page,
    limit,
    status: query.status ?? undefined,
  })

  return c.json({ products, pagination: { page, limit, total } })
})

const productSchema = z.object({
  name: z.string().min(1).max(300),
  slug: z.string().regex(/^[a-z0-9-]+$/).min(1).max(200),
  description: z.string().max(5000).default(''),
  category_id: z.number().int().positive().nullable().default(null),
  price: z.number().int().min(0),
  sale_price: z.number().int().min(0).nullable().default(null),
  sizes: z.array(z.string()).default([]),
  colors: z.array(z.string()).default([]),
  sku: z.string().max(100).nullable().default(null),
  status: z.enum(['active', 'draft', 'archived']).default('draft'),
  stock: z.number().int().min(0).default(0),
  care_instructions: z.string().max(1000).default(''),
})

admin.post('/products', async (c) => {
  let body: unknown
  try {
    body = await c.req.json()
  } catch {
    return c.json({ error: 'Invalid JSON' }, 400)
  }

  const parsed = productSchema.safeParse(body)
  if (!parsed.success) {
    return c.json({ error: 'Validation failed', details: parsed.error.flatten() }, 400)
  }

  const d = parsed.data
  try {
    const result = await c.env.DB.prepare(
      `INSERT INTO products
         (slug, name, description, category_id, price, sale_price, sizes, colors,
          sku, status, stock, care_instructions)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`,
    )
      .bind(
        d.slug, d.name, d.description, d.category_id, d.price, d.sale_price,
        JSON.stringify(d.sizes), JSON.stringify(d.colors),
        d.sku, d.status, d.stock, d.care_instructions,
      )
      .run()

    return c.json({ id: result.meta.last_row_id }, 201)
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    if (msg.includes('UNIQUE')) {
      return c.json({ error: 'A product with this slug already exists' }, 409)
    }
    return c.json({ error: 'Failed to create product' }, 500)
  }
})

admin.put('/products/:id', async (c) => {
  const id = parseInt(c.req.param('id'))
  if (isNaN(id)) return c.json({ error: 'Invalid product id' }, 400)

  let body: unknown
  try {
    body = await c.req.json()
  } catch {
    return c.json({ error: 'Invalid JSON' }, 400)
  }

  const parsed = productSchema.partial().safeParse(body)
  if (!parsed.success) {
    return c.json({ error: 'Validation failed', details: parsed.error.flatten() }, 400)
  }

  const d = parsed.data
  const fields: string[] = []
  const vals: (string | number | null)[] = []

  if (d.name !== undefined) { fields.push('name = ?'); vals.push(d.name) }
  if (d.slug !== undefined) { fields.push('slug = ?'); vals.push(d.slug) }
  if (d.description !== undefined) { fields.push('description = ?'); vals.push(d.description) }
  if (d.category_id !== undefined) { fields.push('category_id = ?'); vals.push(d.category_id) }
  if (d.price !== undefined) { fields.push('price = ?'); vals.push(d.price) }
  if (d.sale_price !== undefined) { fields.push('sale_price = ?'); vals.push(d.sale_price) }
  if (d.sizes !== undefined) { fields.push('sizes = ?'); vals.push(JSON.stringify(d.sizes)) }
  if (d.colors !== undefined) { fields.push('colors = ?'); vals.push(JSON.stringify(d.colors)) }
  if (d.sku !== undefined) { fields.push('sku = ?'); vals.push(d.sku) }
  if (d.status !== undefined) { fields.push('status = ?'); vals.push(d.status) }
  if (d.stock !== undefined) { fields.push('stock = ?'); vals.push(d.stock) }
  if (d.care_instructions !== undefined) { fields.push('care_instructions = ?'); vals.push(d.care_instructions) }

  if (fields.length === 0) return c.json({ error: 'No fields to update' }, 400)

  fields.push("updated_at = datetime('now')")
  vals.push(id)

  await c.env.DB.prepare(
    `UPDATE products SET ${fields.join(', ')} WHERE id = ?`,
  )
    .bind(...vals)
    .run()

  return c.json({ ok: true })
})

admin.delete('/products/:id', async (c) => {
  const id = parseInt(c.req.param('id'))
  if (isNaN(id)) return c.json({ error: 'Invalid product id' }, 400)

  // Fetch and delete associated R2 images first
  const images = await c.env.DB
    .prepare(`SELECT r2_key FROM product_images WHERE product_id = ?`)
    .bind(id)
    .all<{ r2_key: string }>()

  await Promise.all(images.results.map((img) => deleteImage(c.env.IMAGES, img.r2_key)))

  await c.env.DB.prepare(`DELETE FROM products WHERE id = ?`).bind(id).run()
  return c.json({ ok: true })
})

// ── Bulk CSV upload ───────────────────────────────────────────────────────────

admin.post('/products/bulk', async (c) => {
  const formData = await c.req.formData()
  const file = formData.get('file')

  if (!(file instanceof File)) {
    return c.json({ error: 'CSV file required' }, 400)
  }
  if (!file.name.endsWith('.csv')) {
    return c.json({ error: 'File must be a CSV' }, 400)
  }
  if (file.size > 2 * 1024 * 1024) {
    return c.json({ error: 'CSV too large (max 2 MB)' }, 400)
  }

  const text = await file.text()
  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean)

  if (lines.length < 2) {
    return c.json({ error: 'CSV must have a header row and at least one data row' }, 400)
  }

  const headers = lines[0].split(',').map((h) => h.trim().toLowerCase())
  const required = ['name', 'slug', 'price', 'status']
  const missing = required.filter((r) => !headers.includes(r))
  if (missing.length > 0) {
    return c.json({ error: `Missing required columns: ${missing.join(', ')}` }, 400)
  }

  const results = { created: 0, skipped: 0, errors: [] as string[] }

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map((v) => v.trim())
    const row: Record<string, string> = {}
    headers.forEach((h, idx) => { row[h] = values[idx] ?? '' })

    const price = parseInt(row.price ?? '0')
    if (isNaN(price) || price < 0) {
      results.errors.push(`Row ${i + 1}: invalid price`)
      results.skipped++
      continue
    }

    try {
      await c.env.DB.prepare(
        `INSERT OR IGNORE INTO products
           (slug, name, description, price, sale_price, sizes, colors, sku, status, stock, care_instructions)
         VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
      )
        .bind(
          row.slug ?? '',
          row.name ?? '',
          row.description ?? '',
          price,
          row.sale_price ? parseInt(row.sale_price) : null,
          row.sizes ? JSON.stringify(row.sizes.split(';').map((s) => s.trim())) : '[]',
          row.colors ? JSON.stringify(row.colors.split(';').map((c) => c.trim())) : '[]',
          row.sku ?? null,
          row.status ?? 'draft',
          parseInt(row.stock ?? '0') || 0,
          row.care_instructions ?? '',
        )
        .run()
      results.created++
    } catch {
      results.errors.push(`Row ${i + 1}: duplicate slug or DB error`)
      results.skipped++
    }
  }

  return c.json(results)
})

// ── Product images ────────────────────────────────────────────────────────────

admin.post('/images/upload', async (c) => {
  const formData = await c.req.formData()
  const file = formData.get('file')
  const productId = formData.get('product_id')
  const folder = (formData.get('folder') as string) ?? 'products'

  if (!(file instanceof File)) {
    return c.json({ error: 'File required' }, 400)
  }

  const validFolders = ['products', 'config']
  if (!validFolders.includes(folder)) {
    return c.json({ error: 'Invalid folder' }, 400)
  }

  try {
    const { key, url } = await uploadImage(
      c.env.IMAGES,
      file,
      folder as 'products' | 'config',
    )

    if (productId && folder === 'products') {
      const pid = parseInt(productId.toString())
      if (!isNaN(pid)) {
        const alt = formData.get('alt')?.toString() ?? file.name
        const sortOrder = parseInt(formData.get('sort_order')?.toString() ?? '0') || 0

        await c.env.DB.prepare(
          `INSERT INTO product_images (product_id, r2_key, alt, sort_order) VALUES (?,?,?,?)`,
        )
          .bind(pid, key, alt, sortOrder)
          .run()
      }
    }

    return c.json({ key, url }, 201)
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Upload failed'
    return c.json({ error: msg }, 400)
  }
})

admin.delete('/images/:key{.+}', async (c) => {
  const key = c.req.param('key')
  if (!key || key.includes('..')) return c.json({ error: 'Invalid key' }, 400)

  await deleteImage(c.env.IMAGES, key)
  await c.env.DB.prepare(`DELETE FROM product_images WHERE r2_key = ?`).bind(key).run()

  return c.json({ ok: true })
})

// ── Orders ────────────────────────────────────────────────────────────────────

admin.get('/orders', async (c) => {
  const query = c.req.query()
  const page = Math.max(1, parseInt(query.page ?? '1'))
  const limit = Math.min(100, parseInt(query.limit ?? '30'))
  const offset = (page - 1) * limit

  const conditions: string[] = []
  const params: (string | number)[] = []

  if (query.payment_status) {
    conditions.push('payment_status = ?')
    params.push(query.payment_status)
  }
  if (query.order_status) {
    conditions.push('order_status = ?')
    params.push(query.order_status)
  }
  if (query.search) {
    conditions.push('(order_number LIKE ? OR customer_name LIKE ? OR phone LIKE ?)')
    params.push(`%${query.search}%`, `%${query.search}%`, `%${query.search}%`)
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''

  const [countRow, rows] = await Promise.all([
    c.env.DB.prepare(`SELECT COUNT(*) as count FROM orders ${where}`)
      .bind(...params)
      .first<{ count: number }>(),
    c.env.DB.prepare(
      `SELECT * FROM orders ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
    )
      .bind(...params, limit, offset)
      .all(),
  ])

  return c.json({
    orders: rows.results,
    pagination: { page, limit, total: countRow?.count ?? 0 },
  })
})

admin.put('/orders/:id', async (c) => {
  const id = parseInt(c.req.param('id'))
  if (isNaN(id)) return c.json({ error: 'Invalid order id' }, 400)

  let body: unknown
  try {
    body = await c.req.json()
  } catch {
    return c.json({ error: 'Invalid JSON' }, 400)
  }

  const parsed = z.object({
    order_status: z.enum(['placed', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded']).optional(),
    payment_status: z.enum(['pending', 'paid', 'failed', 'refunded', 'cancelled']).optional(),
    notes: z.string().max(500).optional(),
    whatsapp_sent: z.number().int().min(0).max(1).optional(),
  }).safeParse(body)

  if (!parsed.success) {
    return c.json({ error: 'Validation failed' }, 400)
  }

  const d = parsed.data
  const fields: string[] = ["updated_at = datetime('now')"]
  const vals: (string | number)[] = []

  if (d.order_status !== undefined) { fields.push('order_status = ?'); vals.push(d.order_status) }
  if (d.payment_status !== undefined) { fields.push('payment_status = ?'); vals.push(d.payment_status) }
  if (d.notes !== undefined) { fields.push('notes = ?'); vals.push(d.notes) }
  if (d.whatsapp_sent !== undefined) { fields.push('whatsapp_sent = ?'); vals.push(d.whatsapp_sent) }

  vals.push(id)
  await c.env.DB.prepare(`UPDATE orders SET ${fields.join(', ')} WHERE id = ?`)
    .bind(...vals)
    .run()

  return c.json({ ok: true })
})

// ── Orders CSV export ─────────────────────────────────────────────────────────

admin.get('/orders/export', async (c) => {
  const rows = await c.env.DB
    .prepare(
      `SELECT order_number, customer_name, phone, email, total, payment_method,
              payment_status, order_status, created_at
       FROM orders ORDER BY created_at DESC`,
    )
    .all<{
      order_number: string; customer_name: string; phone: string
      email: string | null; total: number; payment_method: string
      payment_status: string; order_status: string; created_at: string
    }>()

  const header = 'Order Number,Customer Name,Phone,Email,Total (INR),Payment Method,Payment Status,Order Status,Date'
  const csvLines = rows.results.map((r) =>
    [
      r.order_number,
      `"${r.customer_name}"`,
      r.phone,
      r.email ?? '',
      (r.total / 100).toFixed(2),
      r.payment_method,
      r.payment_status,
      r.order_status,
      r.created_at,
    ].join(','),
  )

  const csv = [header, ...csvLines].join('\n')
  return new Response(csv, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="orders-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  })
})

// ── Site config ───────────────────────────────────────────────────────────────

admin.get('/config', async (c) => {
  const cfg = await getAllConfig(c.env.DB)
  return c.json({ config: cfg })
})

admin.put('/config', async (c) => {
  let body: unknown
  try {
    body = await c.req.json()
  } catch {
    return c.json({ error: 'Invalid JSON' }, 400)
  }

  if (typeof body !== 'object' || body === null || Array.isArray(body)) {
    return c.json({ error: 'Expected a JSON object' }, 400)
  }

  const BLOCKED = new Set(['razorpay_enabled']) // Razorpay toggle only via secrets + code
  const entries = Object.entries(body as Record<string, unknown>)

  for (const [key, value] of entries) {
    if (BLOCKED.has(key)) continue
    if (typeof value !== 'string') continue
    await setConfig(c.env.DB, key, value)
  }

  return c.json({ ok: true })
})

// ── Categories ────────────────────────────────────────────────────────────────

admin.get('/categories', async (c) => {
  const rows = await c.env.DB
    .prepare(`SELECT * FROM categories ORDER BY sort_order ASC`)
    .all()
  return c.json({ categories: rows.results })
})

admin.post('/categories', async (c) => {
  let body: unknown
  try { body = await c.req.json() } catch { return c.json({ error: 'Invalid JSON' }, 400) }

  const parsed = z.object({
    name: z.string().min(1).max(100),
    slug: z.string().regex(/^[a-z0-9-]+$/).min(1).max(100),
    sort_order: z.number().int().default(0),
  }).safeParse(body)

  if (!parsed.success) return c.json({ error: 'Validation failed' }, 400)

  const d = parsed.data
  const result = await c.env.DB
    .prepare(`INSERT INTO categories (name, slug, sort_order) VALUES (?,?,?)`)
    .bind(d.name, d.slug, d.sort_order)
    .run()

  return c.json({ id: result.meta.last_row_id }, 201)
})

export { admin }
