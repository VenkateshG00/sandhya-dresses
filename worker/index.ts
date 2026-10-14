import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { secureHeaders } from 'hono/secure-headers'
import type { Env } from './types'
import { products, images } from './routes/products'
import { orders } from './routes/orders'
import { webhooks } from './routes/webhooks'
import { admin } from './routes/admin'
import { config } from './routes/config'

const api = new Hono<{ Bindings: Env }>()

api.use(
  '*',
  cors({
    origin: (origin, c) => {
      const siteUrl = c.env.SITE_URL ?? ''
      if (!origin || origin === siteUrl) return origin ?? ''
      if (c.env.ENVIRONMENT !== 'production') return origin
      return ''
    },
    credentials: true,
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Cookie'],
  }),
)

api.use('*', secureHeaders())

api.route('/api/products', products)
api.route('/api/images', images)
api.route('/api/orders', orders)
api.route('/api/webhooks', webhooks)
api.route('/api/admin', admin)
api.route('/api/config', config)

api.get('/api/health', (c) =>
  c.json({ ok: true, env: c.env.ENVIRONMENT }),
)

export default {
  async fetch(
    request: Request,
    env: Env,
    ctx: ExecutionContext,
  ): Promise<Response> {
    const url = new URL(request.url)

    // API routes handled by Hono
    if (url.pathname.startsWith('/api/')) {
      return api.fetch(request, env, ctx)
    }

    // Static assets (React SPA) handled by Cloudflare
    return env.ASSETS.fetch(request)
  },
}
