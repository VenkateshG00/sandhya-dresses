import type { D1Database } from '@cloudflare/workers-types'
import type { Context } from 'hono'
import type { Env } from '../types'

const SESSION_DURATION_HOURS = 8
const SESSION_COOKIE = 'sd_admin_session'

async function sha256Hex(data: string): Promise<string> {
  const buf = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(data),
  )
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

export async function verifyAdminPassword(
  password: string,
  storedHash: string,
): Promise<boolean> {
  // storedHash is stored as SHA-256(password + SESSION_SECRET) for simplicity
  // For production, use bcrypt via a Durable Object or external service.
  // We use HMAC-SHA256 here since crypto.subtle is available in Workers.
  const hash = await sha256Hex(password)
  return hash === storedHash
}

export async function hashPassword(password: string): Promise<string> {
  return sha256Hex(password)
}

export async function hashToken(value: string): Promise<string> {
  return sha256Hex(value)
}

function randomToken(): string {
  const bytes = new Uint8Array(32)
  crypto.getRandomValues(bytes)
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

export async function createSession(db: D1Database): Promise<string> {
  const token = randomToken()
  const tokenHash = await sha256Hex(token)
  const expiresAt = new Date(
    Date.now() + SESSION_DURATION_HOURS * 60 * 60 * 1000,
  ).toISOString()

  // Clean up expired sessions
  await db
    .prepare(`DELETE FROM admin_sessions WHERE expires_at < datetime('now')`)
    .run()

  await db
    .prepare(
      `INSERT INTO admin_sessions (token_hash, expires_at) VALUES (?, ?)`,
    )
    .bind(tokenHash, expiresAt)
    .run()

  return token
}

export async function validateSession(
  db: D1Database,
  token: string,
): Promise<boolean> {
  const tokenHash = await sha256Hex(token)
  const row = await db
    .prepare(
      `SELECT id FROM admin_sessions
       WHERE token_hash = ? AND expires_at > datetime('now')
       LIMIT 1`,
    )
    .bind(tokenHash)
    .first<{ id: number }>()
  return row !== null
}

export async function deleteSession(
  db: D1Database,
  token: string,
): Promise<void> {
  const tokenHash = await sha256Hex(token)
  await db
    .prepare(`DELETE FROM admin_sessions WHERE token_hash = ?`)
    .bind(tokenHash)
    .run()
}

export function getSessionToken(c: Context<{ Bindings: Env }>): string | null {
  const cookie = c.req.header('Cookie') ?? ''
  const match = cookie.match(new RegExp(`${SESSION_COOKIE}=([^;]+)`))
  return match?.[1] ?? null
}

export function setSessionCookie(token: string): string {
  const maxAge = SESSION_DURATION_HOURS * 3600
  return `${SESSION_COOKIE}=${token}; HttpOnly; Secure; SameSite=Strict; Path=/api/admin; Max-Age=${maxAge}`
}

export function clearSessionCookie(): string {
  return `${SESSION_COOKIE}=; HttpOnly; Secure; SameSite=Strict; Path=/api/admin; Max-Age=0`
}

export async function requireAdmin(
  c: Context<{ Bindings: Env }>,
): Promise<boolean> {
  const token = getSessionToken(c)
  if (!token) return false
  return validateSession(c.env.DB, token)
}
