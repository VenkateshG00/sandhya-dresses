import { Hono } from 'hono'
import type { Env } from '../types'
import { verifyWebhookSignature } from '../lib/razorpay'

const webhooks = new Hono<{ Bindings: Env }>()

// Razorpay webhook — payment.captured event marks the order as paid
// Signature verified with RAZORPAY_KEY_SECRET before touching the database
webhooks.post('/razorpay', async (c) => {
  const signature = c.req.header('X-Razorpay-Signature')
  if (!signature) {
    return c.json({ error: 'Missing signature' }, 400)
  }

  const rawBody = await c.req.text()

  const valid = await verifyWebhookSignature(
    rawBody,
    signature,
    c.env.RAZORPAY_KEY_SECRET,
  )

  if (!valid) {
    return c.json({ error: 'Invalid signature' }, 401)
  }

  let event: {
    event: string
    payload?: {
      payment?: {
        entity?: {
          id?: string
          order_id?: string
          amount?: number
          status?: string
        }
      }
    }
  }

  try {
    event = JSON.parse(rawBody)
  } catch {
    return c.json({ error: 'Invalid JSON' }, 400)
  }

  if (event.event === 'payment.captured') {
    const payment = event.payload?.payment?.entity
    if (!payment?.order_id || !payment.id) {
      return c.json({ error: 'Missing payment data' }, 400)
    }

    // Update order: mark as paid only after server-side signature verification
    await c.env.DB.prepare(
      `UPDATE orders
       SET payment_status = 'paid',
           razorpay_payment_id = ?,
           order_status = 'confirmed',
           updated_at = datetime('now')
       WHERE razorpay_order_id = ?
         AND payment_status = 'pending'`,
    )
      .bind(payment.id, payment.order_id)
      .run()
  }

  if (event.event === 'payment.failed') {
    const payment = event.payload?.payment?.entity
    if (payment?.order_id) {
      await c.env.DB.prepare(
        `UPDATE orders
         SET payment_status = 'failed',
             updated_at = datetime('now')
         WHERE razorpay_order_id = ?
           AND payment_status = 'pending'`,
      )
        .bind(payment.order_id)
        .run()
    }
  }

  return c.json({ ok: true })
})

export { webhooks }
