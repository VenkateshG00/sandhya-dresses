import { Hono } from 'hono'
import { z } from 'zod'
import type { Env, CreateOrderPayload } from '../types'
import { generateOrderNumber, getConfig } from '../lib/db'
import { createRazorpayOrder, isRazorpayConfigured } from '../lib/razorpay'

const orders = new Hono<{ Bindings: Env }>()

const addressSchema = z.object({
  line1: z.string().min(3).max(200),
  line2: z.string().max(200).default(''),
  city: z.string().min(2).max(100),
  state: z.string().min(2).max(100),
  pin: z.string().regex(/^\d{6}$/, 'PIN must be 6 digits'),
  country: z.string().default('India'),
})

const orderItemSchema = z.object({
  product_id: z.number().int().positive(),
  product_name: z.string().min(1).max(300),
  product_slug: z.string().min(1).max(200),
  variant_size: z.string().nullable().default(null),
  variant_color: z.string().nullable().default(null),
  quantity: z.number().int().min(1).max(50),
  unit_price: z.number().int().min(0),
})

const createOrderSchema = z.object({
  customer_name: z.string().min(2).max(150),
  phone: z.string().regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit Indian mobile number'),
  email: z.string().email().optional(),
  address: addressSchema,
  items: z.array(orderItemSchema).min(1).max(50),
  payment_method: z.enum(['razorpay', 'upi', 'cod']),
  notes: z.string().max(500).optional(),
})

orders.post('/', async (c) => {
  let body: unknown
  try {
    body = await c.req.json()
  } catch {
    return c.json({ error: 'Invalid JSON body' }, 400)
  }

  const parsed = createOrderSchema.safeParse(body)
  if (!parsed.success) {
    return c.json({ error: 'Validation failed', details: parsed.error.flatten() }, 400)
  }

  const data: CreateOrderPayload = parsed.data

  // Validate payment method is enabled
  if (data.payment_method === 'razorpay') {
    const enabled = await getConfig(c.env.DB, 'razorpay_enabled')
    if (enabled !== 'true') {
      return c.json({ error: 'Razorpay payments are not currently available' }, 400)
    }
    if (!isRazorpayConfigured(c.env.RAZORPAY_KEY_ID, c.env.RAZORPAY_KEY_SECRET)) {
      return c.json({ error: 'Payment gateway not configured' }, 503)
    }
  }
  if (data.payment_method === 'cod') {
    const enabled = await getConfig(c.env.DB, 'cod_enabled')
    if (enabled !== 'true') {
      return c.json({ error: 'Cash on delivery is not available' }, 400)
    }
  }
  if (data.payment_method === 'upi') {
    const enabled = await getConfig(c.env.DB, 'upi_enabled')
    if (enabled !== 'true') {
      return c.json({ error: 'UPI payment is not currently available' }, 400)
    }
  }

  // Server-side price calculation — never trust client-submitted totals
  const subtotal = data.items.reduce(
    (sum, item) => sum + item.unit_price * item.quantity,
    0,
  )
  const shipping = 0 // Free shipping for now; configurable later
  const total = subtotal + shipping

  if (total <= 0) {
    return c.json({ error: 'Order total must be greater than zero' }, 400)
  }

  const orderNumber = generateOrderNumber()

  try {
    let razorpayOrderId: string | null = null

    if (data.payment_method === 'razorpay') {
      const rzpOrder = await createRazorpayOrder(
        c.env.RAZORPAY_KEY_ID,
        c.env.RAZORPAY_KEY_SECRET,
        total,
        orderNumber,
      )
      razorpayOrderId = rzpOrder.id
    }

    await c.env.DB.prepare(
      `INSERT INTO orders
         (order_number, customer_name, phone, email, address, items,
          subtotal, shipping, total, payment_method, payment_status,
          razorpay_order_id, order_status)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    )
      .bind(
        orderNumber,
        data.customer_name,
        data.phone,
        data.email ?? null,
        JSON.stringify(data.address),
        JSON.stringify(data.items),
        subtotal,
        shipping,
        total,
        data.payment_method,
        data.payment_method === 'cod' ? 'pending' : 'pending',
        razorpayOrderId,
        'placed',
      )
      .run()

    return c.json({
      order_number: orderNumber,
      total,
      subtotal,
      shipping,
      payment_method: data.payment_method,
      razorpay_order_id: razorpayOrderId,
      razorpay_key_id:
        data.payment_method === 'razorpay' ? c.env.RAZORPAY_KEY_ID : null,
    })
  } catch (err) {
    console.error('Order creation error:', err)
    return c.json({ error: 'Failed to create order' }, 500)
  }
})

// Public order status lookup
orders.get('/:orderNumber', async (c) => {
  const orderNumber = c.req.param('orderNumber')
  if (!orderNumber.match(/^SD\d{6}[A-Z0-9]{4}$/)) {
    return c.json({ error: 'Invalid order number' }, 400)
  }

  const row = await c.env.DB
    .prepare(
      `SELECT order_number, customer_name, order_status, payment_status,
              total, payment_method, created_at
       FROM orders WHERE order_number = ? LIMIT 1`,
    )
    .bind(orderNumber)
    .first()

  if (!row) return c.json({ error: 'Order not found' }, 404)
  return c.json({ order: row })
})

export { orders }
