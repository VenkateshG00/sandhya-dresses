import { Hono } from 'hono'
import { z } from 'zod'
import type { Env } from '../types'
import {
  hashPassword,
  verifyPassword,
  createCustomerSession,
  validateCustomerSession,
  deleteCustomerSession,
  getCustomerToken,
  setCustomerCookie,
  clearCustomerCookie,
} from '../lib/customerAuth'
import { createSession, hashToken, setSessionCookie } from '../lib/auth'

export const auth = new Hono<{ Bindings: Env }>()

const registerSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(8).max(100),
  phone: z.string().optional(),
})

const loginSchema = z.object({
  email: z.string().min(1),
  password: z.string().min(1),
})

// POST /api/auth/register
auth.post('/register', async (c) => {
  const body = await c.req.json().catch(() => null)
  const parsed = registerSchema.safeParse(body)
  if (!parsed.success) {
    return c.json({ error: 'Invalid input', details: parsed.error.flatten() }, 400)
  }
  const { name, email, password, phone } = parsed.data

  const existing = await c.env.DB.prepare('SELECT id FROM customers WHERE email = ?')
    .bind(email.toLowerCase()).first()
  if (existing) return c.json({ error: 'Email already registered' }, 409)

  const passwordHash = await hashPassword(password)
  const result = await c.env.DB.prepare(
    'INSERT INTO customers (name, email, password_hash, phone) VALUES (?, ?, ?, ?)',
  ).bind(name, email.toLowerCase(), passwordHash, phone ?? null).run()

  const customerId = result.meta.last_row_id as number
  const token = await createCustomerSession(c.env, customerId)

  return c.json({ role: 'customer', name }, 201, {
    'Set-Cookie': setCustomerCookie(token),
  })
})

// POST /api/auth/login — handles both admin and customer
auth.post('/login', async (c) => {
  const body = await c.req.json().catch(() => null)
  const parsed = loginSchema.safeParse(body)
  if (!parsed.success) return c.json({ error: 'Invalid input' }, 400)

  const { email, password } = parsed.data

  // Try admin first: check if password matches ADMIN_PASSWORD_HASH
  if (c.env.ADMIN_PASSWORD_HASH) {
    const inputHash = await hashToken(password)
    if (inputHash === c.env.ADMIN_PASSWORD_HASH) {
      const token = await createSession(c.env.DB)
      return c.json({ role: 'admin' }, 200, {
        'Set-Cookie': setSessionCookie(token),
      })
    }
  }

  // Try customer login
  const customer = await c.env.DB.prepare(
    'SELECT id, name, email, password_hash FROM customers WHERE email = ?',
  ).bind(email.toLowerCase()).first<{ id: number; name: string; email: string; password_hash: string }>()

  if (!customer) return c.json({ error: 'Invalid email or password' }, 401)

  const valid = await verifyPassword(password, customer.password_hash)
  if (!valid) return c.json({ error: 'Invalid email or password' }, 401)

  const token = await createCustomerSession(c.env, customer.id)

  return c.json({ role: 'customer', name: customer.name, email: customer.email }, 200, {
    'Set-Cookie': setCustomerCookie(token),
  })
})

// POST /api/auth/logout
auth.post('/logout', async (c) => {
  const token = getCustomerToken(c.req.raw)
  if (token) await deleteCustomerSession(c.env, token)
  return c.json({ ok: true }, 200, {
    'Set-Cookie': clearCustomerCookie(),
  })
})

// GET /api/auth/me
auth.get('/me', async (c) => {
  const token = getCustomerToken(c.req.raw)
  const customer = await validateCustomerSession(c.env, token)
  if (!customer) return c.json({ authenticated: false }, 401)
  return c.json({ authenticated: true, customer })
})
