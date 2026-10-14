import { Hono } from 'hono'
import { z } from 'zod'
import type { Env } from '../types'
import {
  validateCustomerSession,
  getCustomerToken,
  hashPassword,
  verifyPassword,
} from '../lib/customerAuth'

export const customer = new Hono<{ Bindings: Env }>()

// Middleware: require authenticated customer
customer.use('*', async (c, next) => {
  const token = getCustomerToken(c.req.raw)
  const cust = await validateCustomerSession(c.env, token)
  if (!cust) return c.json({ error: 'Unauthorized' }, 401)
  c.set('customerId' as never, cust.id as never)
  await next()
})

async function getCustomerId(c: { get: (k: never) => unknown }): Promise<number> {
  return c.get('customerId' as never) as number
}

// ── Profile ──────────────────────────────────────────────────────────────────

customer.get('/profile', async (c) => {
  const id = await getCustomerId(c)
  const row = await c.env.DB.prepare(
    'SELECT id, name, email, phone, created_at FROM customers WHERE id = ?',
  ).bind(id).first<{ id: number; name: string; email: string; phone: string | null; created_at: string }>()
  if (!row) return c.json({ error: 'Not found' }, 404)
  return c.json(row)
})

const updateProfileSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  phone: z.string().max(20).optional(),
})

customer.put('/profile', async (c) => {
  const id = await getCustomerId(c)
  const body = await c.req.json().catch(() => null)
  const parsed = updateProfileSchema.safeParse(body)
  if (!parsed.success) return c.json({ error: 'Invalid input' }, 400)

  const { name, phone } = parsed.data
  const fields: string[] = []
  const values: unknown[] = []

  if (name !== undefined) { fields.push('name = ?'); values.push(name) }
  if (phone !== undefined) { fields.push('phone = ?'); values.push(phone) }
  if (fields.length === 0) return c.json({ error: 'Nothing to update' }, 400)

  fields.push("updated_at = datetime('now')")
  values.push(id)

  await c.env.DB.prepare(
    `UPDATE customers SET ${fields.join(', ')} WHERE id = ?`,
  ).bind(...values).run()

  return c.json({ ok: true })
})

// ── Password ─────────────────────────────────────────────────────────────────

const changePasswordSchema = z.object({
  current_password: z.string().min(1),
  new_password: z.string().min(8).max(100),
})

customer.put('/password', async (c) => {
  const id = await getCustomerId(c)
  const body = await c.req.json().catch(() => null)
  const parsed = changePasswordSchema.safeParse(body)
  if (!parsed.success) return c.json({ error: 'Invalid input' }, 400)

  const { current_password, new_password } = parsed.data

  const row = await c.env.DB.prepare(
    'SELECT password_hash FROM customers WHERE id = ?',
  ).bind(id).first<{ password_hash: string }>()
  if (!row) return c.json({ error: 'Not found' }, 404)

  const valid = await verifyPassword(current_password, row.password_hash)
  if (!valid) return c.json({ error: 'Current password is incorrect' }, 401)

  const newHash = await hashPassword(new_password)
  await c.env.DB.prepare(
    "UPDATE customers SET password_hash = ?, updated_at = datetime('now') WHERE id = ?",
  ).bind(newHash, id).run()

  return c.json({ ok: true })
})

// ── Orders ───────────────────────────────────────────────────────────────────

customer.get('/orders', async (c) => {
  const id = await getCustomerId(c)
  const rows = await c.env.DB.prepare(
    `SELECT id, order_number, total, payment_method, payment_status, order_status, created_at
     FROM orders WHERE customer_id = ? ORDER BY created_at DESC LIMIT 50`,
  ).bind(id).all()
  return c.json(rows.results)
})

customer.get('/orders/:orderId', async (c) => {
  const id = await getCustomerId(c)
  const orderId = Number(c.req.param('orderId'))
  const row = await c.env.DB.prepare(
    'SELECT * FROM orders WHERE id = ? AND customer_id = ?',
  ).bind(orderId, id).first()
  if (!row) return c.json({ error: 'Not found' }, 404)
  return c.json(row)
})

// ── Addresses ────────────────────────────────────────────────────────────────

customer.get('/addresses', async (c) => {
  const id = await getCustomerId(c)
  const rows = await c.env.DB.prepare(
    'SELECT * FROM customer_addresses WHERE customer_id = ? ORDER BY is_default DESC, id ASC',
  ).bind(id).all()
  return c.json(rows.results)
})

const addressSchema = z.object({
  label: z.string().max(50).optional(),
  line1: z.string().min(1).max(200),
  line2: z.string().max(200).optional(),
  city: z.string().min(1).max(100),
  state: z.string().min(1).max(100),
  pin: z.string().min(6).max(10),
  country: z.string().max(100).optional(),
  is_default: z.boolean().optional(),
})

customer.post('/addresses', async (c) => {
  const id = await getCustomerId(c)
  const body = await c.req.json().catch(() => null)
  const parsed = addressSchema.safeParse(body)
  if (!parsed.success) return c.json({ error: 'Invalid input' }, 400)

  const { label = 'Home', line1, line2 = '', city, state, pin, country = 'India', is_default = false } = parsed.data

  if (is_default) {
    await c.env.DB.prepare(
      'UPDATE customer_addresses SET is_default = 0 WHERE customer_id = ?',
    ).bind(id).run()
  }

  const result = await c.env.DB.prepare(
    `INSERT INTO customer_addresses (customer_id, label, line1, line2, city, state, pin, country, is_default)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  ).bind(id, label, line1, line2, city, state, pin, country, is_default ? 1 : 0).run()

  return c.json({ id: result.meta.last_row_id }, 201)
})

customer.put('/addresses/:addrId', async (c) => {
  const id = await getCustomerId(c)
  const addrId = Number(c.req.param('addrId'))
  const body = await c.req.json().catch(() => null)
  const parsed = addressSchema.safeParse(body)
  if (!parsed.success) return c.json({ error: 'Invalid input' }, 400)

  const existing = await c.env.DB.prepare(
    'SELECT id FROM customer_addresses WHERE id = ? AND customer_id = ?',
  ).bind(addrId, id).first()
  if (!existing) return c.json({ error: 'Not found' }, 404)

  const { label = 'Home', line1, line2 = '', city, state, pin, country = 'India', is_default = false } = parsed.data

  if (is_default) {
    await c.env.DB.prepare(
      'UPDATE customer_addresses SET is_default = 0 WHERE customer_id = ?',
    ).bind(id).run()
  }

  await c.env.DB.prepare(
    `UPDATE customer_addresses SET label=?, line1=?, line2=?, city=?, state=?, pin=?, country=?, is_default=?
     WHERE id = ? AND customer_id = ?`,
  ).bind(label, line1, line2, city, state, pin, country, is_default ? 1 : 0, addrId, id).run()

  return c.json({ ok: true })
})

customer.delete('/addresses/:addrId', async (c) => {
  const id = await getCustomerId(c)
  const addrId = Number(c.req.param('addrId'))
  await c.env.DB.prepare(
    'DELETE FROM customer_addresses WHERE id = ? AND customer_id = ?',
  ).bind(addrId, id).run()
  return c.json({ ok: true })
})

// ── Wishlist ──────────────────────────────────────────────────────────────────

customer.get('/wishlist', async (c) => {
  const id = await getCustomerId(c)
  const rows = await c.env.DB.prepare(
    `SELECT w.id, w.product_id, p.name, p.slug, p.price, p.sale_price, p.status
     FROM wishlists w JOIN products p ON p.id = w.product_id
     WHERE w.customer_id = ? ORDER BY w.created_at DESC`,
  ).bind(id).all()
  return c.json(rows.results)
})

customer.post('/wishlist/:productId', async (c) => {
  const id = await getCustomerId(c)
  const productId = Number(c.req.param('productId'))
  await c.env.DB.prepare(
    'INSERT OR IGNORE INTO wishlists (customer_id, product_id) VALUES (?, ?)',
  ).bind(id, productId).run()
  return c.json({ ok: true })
})

customer.delete('/wishlist/:productId', async (c) => {
  const id = await getCustomerId(c)
  const productId = Number(c.req.param('productId'))
  await c.env.DB.prepare(
    'DELETE FROM wishlists WHERE customer_id = ? AND product_id = ?',
  ).bind(id, productId).run()
  return c.json({ ok: true })
})
