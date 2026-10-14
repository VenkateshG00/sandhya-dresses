import { Hono } from 'hono'
import type { Env } from '../types'
import { listProducts, getProductWithImages, getCategories } from '../lib/db'
// import { getImage } from '../lib/r2'  // R2 — uncomment when R2 is enabled

const products = new Hono<{ Bindings: Env }>()

products.get('/', async (c) => {
  const query = c.req.query()
  const page = Math.max(1, parseInt(query.page ?? '1'))
  const limit = Math.min(100, Math.max(1, parseInt(query.limit ?? '20')))
  const minPrice = query.min_price ? parseInt(query.min_price) : undefined
  const maxPrice = query.max_price ? parseInt(query.max_price) : undefined

  try {
    const { products: rows, total } = await listProducts(c.env.DB, {
      category: query.category,
      search: query.search,
      minPrice,
      maxPrice,
      page,
      limit,
    })

    return c.json({
      products: rows,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch {
    return c.json({ error: 'Failed to fetch products' }, 500)
  }
})

products.get('/categories', async (c) => {
  try {
    const categories = await getCategories(c.env.DB)
    return c.json({ categories })
  } catch {
    return c.json({ error: 'Failed to fetch categories' }, 500)
  }
})

products.get('/:slug', async (c) => {
  const slug = c.req.param('slug')

  try {
    const product = await getProductWithImages(c.env.DB, slug)
    if (!product) {
      return c.json({ error: 'Product not found' }, 404)
    }
    return c.json({ product })
  } catch {
    return c.json({ error: 'Failed to fetch product' }, 500)
  }
})

// R2 image proxy — uncomment when R2 is enabled
// const images = new Hono<{ Bindings: Env }>()
// images.get('/*', async (c) => {
//   const key = c.req.path.replace('/api/images/', '')
//   if (!key || key.includes('..')) return c.json({ error: 'Invalid image path' }, 400)
//   return getImage(c.env.IMAGES!, key)
// })
const images = new Hono<{ Bindings: Env }>()
images.get('/*', (c) => c.json({ error: 'Image storage not configured' }, 503))

export { products, images }
