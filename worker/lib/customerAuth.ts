import type { Env } from '../types'

async function sha256(text: string): Promise<string> {
  const data = new TextEncoder().encode(text)
  const buf = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, '0')).join('')
}

function randomHex(bytes: number): string {
  const arr = new Uint8Array(bytes)
  crypto.getRandomValues(arr)
  return Array.from(arr).map((b) => b.toString(16).padStart(2, '0')).join('')
}

export async function hashPassword(password: string): Promise<string> {
  const salt = randomHex(16)
  const hash = await sha256(salt + password)
  return `${salt}:${hash}`
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [salt, hash] = stored.split(':')
  if (!salt || !hash) return false
  const computed = await sha256(salt + password)
  return computed === hash
}

export async function createCustomerSession(env: Env, customerId: number): Promise<string> {
  const token = randomHex(32)
  const tokenHash = await sha256(token)
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days

  await env.DB.prepare(
    'INSERT INTO customer_sessions (customer_id, token_hash, expires_at) VALUES (?, ?, ?)',
  ).bind(customerId, tokenHash, expiresAt).run()

  return token
}

export async function validateCustomerSession(
  env: Env,
  token: string | null,
): Promise<{ id: number; name: string; email: string; phone: string | null } | null> {
  if (!token) return null
  const tokenHash = await sha256(token)

  const row = await env.DB.prepare(`
    SELECT c.id, c.name, c.email, c.phone
    FROM customer_sessions cs
    JOIN customers c ON c.id = cs.customer_id
    WHERE cs.token_hash = ? AND cs.expires_at > datetime('now')
  `).bind(tokenHash).first<{ id: number; name: string; email: string; phone: string | null }>()

  return row ?? null
}

export async function deleteCustomerSession(env: Env, token: string): Promise<void> {
  const tokenHash = await sha256(token)
  await env.DB.prepare('DELETE FROM customer_sessions WHERE token_hash = ?').bind(tokenHash).run()
}

export function getCustomerToken(request: Request): string | null {
  const cookie = request.headers.get('Cookie') ?? ''
  const match = cookie.match(/(?:^|;\s*)cs_token=([^;]+)/)
  return match ? decodeURIComponent(match[1]) : null
}

export function setCustomerCookie(token: string): string {
  return `cs_token=${encodeURIComponent(token)}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${30 * 24 * 60 * 60}`
}

export function clearCustomerCookie(): string {
  return 'cs_token=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0'
}
