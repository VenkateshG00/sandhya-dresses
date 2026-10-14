import type { D1Database } from '@cloudflare/workers-types'
import type { ProductRow, ProductImageRow, CategoryRow, OrderRow } from '../types'

export function parseProduct(row: ProductRow): ProductRow {
  return {
    ...row,
    sizes: typeof row.sizes === 'string' ? row.sizes : JSON.stringify(row.sizes),
    colors: typeof row.colors === 'string' ? row.colors : JSON.stringify(row.colors),
  }
}

export async function getProductWithImages(
  db: D1Database,
  slug: string,
): Promise<(ProductRow & { images: ProductImageRow[] }) | null> {
  const product = await db
    .prepare(
      `SELECT p.*, c.name AS category_name, c.slug AS category_slug
       FROM products p
       LEFT JOIN categories c ON c.id = p.category_id
       WHERE p.slug = ? AND p.status = 'active'
       LIMIT 1`,
    )
    .bind(slug)
    .first<ProductRow>()

  if (!product) return null

  const images = await db
    .prepare(
      `SELECT * FROM product_images WHERE product_id = ? ORDER BY sort_order ASC`,
    )
    .bind(product.id)
    .all<ProductImageRow>()

  return { ...parseProduct(product), images: images.results }
}

export async function listProducts(
  db: D1Database,
  opts: {
    category?: string
    search?: string
    minPrice?: number
    maxPrice?: number
    page?: number
    limit?: number
    status?: string
  } = {},
): Promise<{ products: ProductRow[]; total: number }> {
  const page = opts.page ?? 1
  const limit = Math.min(opts.limit ?? 20, 100)
  const offset = (page - 1) * limit
  const status = opts.status ?? 'active'

  const conditions: string[] = ['p.status = ?']
  const params: (string | number)[] = [status]

  if (opts.category) {
    conditions.push('c.slug = ?')
    params.push(opts.category)
  }
  if (opts.search) {
    conditions.push("(p.name LIKE ? OR p.description LIKE ?)")
    params.push(`%${opts.search}%`, `%${opts.search}%`)
  }
  if (opts.minPrice !== undefined) {
    conditions.push('p.price >= ?')
    params.push(opts.minPrice)
  }
  if (opts.maxPrice !== undefined) {
    conditions.push('p.price <= ?')
    params.push(opts.maxPrice)
  }

  const where = conditions.join(' AND ')

  const countResult = await db
    .prepare(
      `SELECT COUNT(*) as count FROM products p
       LEFT JOIN categories c ON c.id = p.category_id
       WHERE ${where}`,
    )
    .bind(...params)
    .first<{ count: number }>()

  const total = countResult?.count ?? 0

  const rows = await db
    .prepare(
      `SELECT p.*, c.name AS category_name, c.slug AS category_slug,
              (SELECT r2_key FROM product_images WHERE product_id = p.id ORDER BY sort_order LIMIT 1) AS primary_image
       FROM products p
       LEFT JOIN categories c ON c.id = p.category_id
       WHERE ${where}
       ORDER BY p.created_at DESC
       LIMIT ? OFFSET ?`,
    )
    .bind(...params, limit, offset)
    .all<ProductRow & { primary_image?: string }>()

  return { products: rows.results.map(parseProduct), total }
}

export async function getCategories(db: D1Database): Promise<CategoryRow[]> {
  const result = await db
    .prepare(`SELECT * FROM categories ORDER BY sort_order ASC`)
    .all<CategoryRow>()
  return result.results
}

export async function getConfig(db: D1Database, key: string): Promise<string | null> {
  const row = await db
    .prepare(`SELECT value FROM site_config WHERE key = ?`)
    .bind(key)
    .first<{ value: string }>()
  return row?.value ?? null
}

export async function getAllConfig(
  db: D1Database,
): Promise<Record<string, string>> {
  const rows = await db
    .prepare(`SELECT key, value FROM site_config`)
    .all<{ key: string; value: string }>()
  return Object.fromEntries(rows.results.map((r) => [r.key, r.value]))
}

export async function setConfig(
  db: D1Database,
  key: string,
  value: string,
): Promise<void> {
  await db
    .prepare(
      `INSERT INTO site_config (key, value, updated_at)
       VALUES (?, ?, datetime('now'))
       ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at`,
    )
    .bind(key, value)
    .run()
}

export async function getOrderByNumber(
  db: D1Database,
  orderNumber: string,
): Promise<OrderRow | null> {
  return db
    .prepare(`SELECT * FROM orders WHERE order_number = ? LIMIT 1`)
    .bind(orderNumber)
    .first<OrderRow>()
}

export function generateOrderNumber(): string {
  const date = new Date()
  const ymd =
    date.getFullYear().toString().slice(2) +
    String(date.getMonth() + 1).padStart(2, '0') +
    String(date.getDate()).padStart(2, '0')
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase()
  return `SD${ymd}${rand}`
}
