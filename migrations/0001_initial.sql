-- Sandhya Dresses — D1 initial schema
-- Prices stored in paise (1 INR = 100 paise) to avoid floating-point issues

CREATE TABLE IF NOT EXISTS categories (
  id      INTEGER PRIMARY KEY AUTOINCREMENT,
  name    TEXT    NOT NULL,
  slug    TEXT    NOT NULL UNIQUE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS products (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  slug        TEXT    NOT NULL UNIQUE,
  name        TEXT    NOT NULL,
  description TEXT    NOT NULL DEFAULT '',
  category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
  price       INTEGER NOT NULL CHECK(price >= 0),
  sale_price  INTEGER CHECK(sale_price IS NULL OR sale_price >= 0),
  sizes       TEXT    NOT NULL DEFAULT '[]',
  colors      TEXT    NOT NULL DEFAULT '[]',
  sku         TEXT,
  status      TEXT    NOT NULL DEFAULT 'draft' CHECK(status IN ('active','draft','archived')),
  stock       INTEGER NOT NULL DEFAULT 0 CHECK(stock >= 0),
  care_instructions TEXT NOT NULL DEFAULT '',
  created_at  TEXT    NOT NULL DEFAULT (datetime('now')),
  updated_at  TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS product_images (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  r2_key     TEXT    NOT NULL,
  alt        TEXT    NOT NULL DEFAULT '',
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS orders (
  id                  INTEGER PRIMARY KEY AUTOINCREMENT,
  order_number        TEXT    NOT NULL UNIQUE,
  customer_name       TEXT    NOT NULL,
  phone               TEXT    NOT NULL,
  email               TEXT,
  address             TEXT    NOT NULL,
  items               TEXT    NOT NULL,
  subtotal            INTEGER NOT NULL CHECK(subtotal >= 0),
  shipping            INTEGER NOT NULL DEFAULT 0 CHECK(shipping >= 0),
  total               INTEGER NOT NULL CHECK(total >= 0),
  payment_method      TEXT    NOT NULL CHECK(payment_method IN ('razorpay','upi','cod')),
  payment_status      TEXT    NOT NULL DEFAULT 'pending'
                      CHECK(payment_status IN ('pending','paid','failed','refunded','cancelled')),
  razorpay_order_id   TEXT,
  razorpay_payment_id TEXT,
  razorpay_signature  TEXT,
  order_status        TEXT    NOT NULL DEFAULT 'placed'
                      CHECK(order_status IN ('placed','confirmed','processing','shipped','delivered','cancelled','refunded')),
  notes               TEXT,
  whatsapp_sent       INTEGER NOT NULL DEFAULT 0,
  created_at          TEXT    NOT NULL DEFAULT (datetime('now')),
  updated_at          TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS admin_sessions (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  token_hash TEXT    NOT NULL UNIQUE,
  created_at TEXT    NOT NULL DEFAULT (datetime('now')),
  expires_at TEXT    NOT NULL
);

CREATE TABLE IF NOT EXISTS site_config (
  key        TEXT PRIMARY KEY,
  value      TEXT NOT NULL,
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_products_slug       ON products(slug);
CREATE INDEX IF NOT EXISTS idx_products_status     ON products(status);
CREATE INDEX IF NOT EXISTS idx_products_category   ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_stock      ON products(stock);
CREATE INDEX IF NOT EXISTS idx_product_images_pid  ON product_images(product_id);
CREATE INDEX IF NOT EXISTS idx_orders_number       ON orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_created      ON orders(created_at);
CREATE INDEX IF NOT EXISTS idx_orders_pay_status   ON orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_orders_ord_status   ON orders(order_status);
CREATE INDEX IF NOT EXISTS idx_sessions_token      ON admin_sessions(token_hash);
CREATE INDEX IF NOT EXISTS idx_sessions_expires    ON admin_sessions(expires_at);

-- Default categories
INSERT OR IGNORE INTO categories (name, slug, sort_order) VALUES
  ('Sarees',         'sarees',         1),
  ('Salwar Kameez',  'salwar-kameez',  2),
  ('Lehengas',       'lehengas',       3),
  ('Kurtis',         'kurtis',         4),
  ('Dress Materials','dress-materials', 5);

-- Default site config — owner must update these values
INSERT OR IGNORE INTO site_config (key, value) VALUES
  ('store_name',          'Sandhya Dresses'),
  ('store_phone',         ''),
  ('store_whatsapp',      ''),
  ('store_email',         ''),
  ('store_hours',         ''),
  ('store_address_line1', 'Near Union Bank, Elabaka Road'),
  ('store_address_line2', 'Challur, Veenavanka Mandal'),
  ('store_address_city',  'Karimnagar District'),
  ('store_address_state', 'Telangana'),
  ('store_address_pin',   '505505'),
  ('google_maps_url',     'https://maps.app.goo.gl/dMNkKumTVDBtwT3z8'),
  ('upi_qr_r2_key',       ''),
  ('upi_id',              ''),
  ('low_stock_threshold', '5'),
  ('razorpay_enabled',    'false'),
  ('cod_enabled',         'true'),
  ('upi_enabled',         'false'),
  ('return_policy',       'We accept returns within 7 days of delivery. Items must be unused and in original packaging. Contact us via WhatsApp to initiate a return. [OWNER: please review and update this policy]'),
  ('shipping_policy',     '[OWNER: please add your shipping policy here]'),
  ('announcement_text',   ''),
  ('announcement_active', 'false');
