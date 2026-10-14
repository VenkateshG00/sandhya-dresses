import { Hono } from 'hono'
import type { Env } from '../types'

const config = new Hono<{ Bindings: Env }>()

// Public config keys safe to expose to the browser
const PUBLIC_KEYS = new Set([
  'store_name',
  'store_phone',
  'store_whatsapp',
  'store_email',
  'store_hours',
  'store_address_line1',
  'store_address_line2',
  'store_address_city',
  'store_address_state',
  'store_address_pin',
  'google_maps_url',
  'razorpay_enabled',
  'cod_enabled',
  'upi_enabled',
  'upi_id',
  'upi_qr_r2_key',
  'announcement_text',
  'announcement_active',
  'return_policy',
  'shipping_policy',
])

config.get('/', async (c) => {
  const rows = await c.env.DB
    .prepare(`SELECT key, value FROM site_config`)
    .all<{ key: string; value: string }>()

  const pub: Record<string, string> = {}
  for (const row of rows.results) {
    if (PUBLIC_KEYS.has(row.key)) {
      pub[row.key] = row.value
    }
  }

  return c.json({ config: pub })
})

export { config }
