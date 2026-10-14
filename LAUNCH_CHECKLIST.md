# Launch Checklist — Sandhya Dresses

Work through these in order before making the site live.

---

## 1. Cloudflare Account Setup

- [ ] Create a Cloudflare account at cloudflare.com
- [ ] Install Wrangler CLI: `npm install -g wrangler`
- [ ] Authenticate: `wrangler login`

## 2. Create D1 Database

```bash
wrangler d1 create sandhya-dresses-db
```
Copy the database ID printed and paste it into `wrangler.toml` → `database_id`.

## 3. Run Database Migration

```bash
wrangler d1 execute sandhya-dresses-db --file=migrations/0001_initial.sql
```

This creates all tables and inserts seed configuration.

## 4. Create R2 Bucket

```bash
wrangler r2 bucket create sandhya-dresses-images
```

Name must match `bucket_name` in `wrangler.toml`.

## 5. Set Secrets

Run each command and enter the value when prompted:

```bash
# Admin password (choose a strong password)
wrangler secret put ADMIN_PASSWORD_HASH
# Enter: the SHA-256 hex hash of your chosen password
# Get the hash: echo -n "yourpassword" | sha256sum

wrangler secret put SESSION_SECRET
# Enter: any long random string (32+ characters)

# Only if using Razorpay:
wrangler secret put RAZORPAY_KEY_ID
wrangler secret put RAZORPAY_KEY_SECRET
```

To get the SHA-256 hash of your password on Mac:
```bash
echo -n "yourpassword" | shasum -a 256
```

## 6. Enable/Disable Payment Methods

Log in to the admin panel → Settings and configure:
- **Razorpay**: requires live API keys from razorpay.com
- **UPI QR**: upload your store's UPI QR code image
- **Cash on Delivery**: can be enabled with no setup

## 7. Configure Store Settings (Admin Panel)

After deploying, go to `/admin` and configure:
- [ ] Store name, phone, WhatsApp number, email
- [ ] Store hours
- [ ] Return policy text
- [ ] UPI QR image (upload your store's QR)
- [ ] Announcement bar (optional)

## 8. Add Products

Either:
- Use Admin → Products → Add Product (one at a time)
- Use Admin → Products → CSV Upload (bulk)

CSV format:
```
name,slug,price,status,description,sale_price,sizes,colors,sku,stock,care_instructions
"Red Banarasi Saree",red-banarasi-saree,350000,active,"...",,,S;M;L,Red,,5,""
```
Prices are in **paise** (₹3500 = 350000).

## 9. Custom Domain

In Cloudflare dashboard → Workers & Pages → your worker → Custom Domains.
Add your domain (e.g. sandhyadresses.com).

Update `public/robots.txt` and `public/sitemap.xml` with your actual domain.

## 10. Deploy

```bash
npm run build
wrangler deploy
```

Or set up GitHub Actions for automatic deploys on push.

## 11. Legal Pages

Review and edit these files with your actual information:
- `src/pages/legal/Privacy.tsx` — search for `[OWNER NOTE]`
- `src/pages/legal/Terms.tsx` — search for `[OWNER NOTE]`
- `src/pages/About.tsx` — add your actual store story

## 12. SEO

- Update `index.html` meta description with your store description
- Update `public/sitemap.xml` with your actual domain
- Add your domain to `public/robots.txt`

## 13. Test Before Going Live

- [ ] Place a test order (COD or UPI)
- [ ] Check order appears in Admin → Orders
- [ ] Test admin login/logout
- [ ] Test on mobile (WhatsApp, etc.)
- [ ] Test checkout flow end-to-end
- [ ] Test Razorpay with test keys before switching to live

---

## Razorpay Setup (if using)

1. Create account at razorpay.com
2. Complete KYC verification
3. Get test keys from Dashboard → Settings → API Keys
4. Set `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` secrets
5. Enable Razorpay in Admin → Settings
6. Test with Razorpay test card: 4111111111111111, any future date, any CVV
7. Switch to live keys when ready to accept real payments
8. Add webhook URL in Razorpay Dashboard: `https://yourdomain.com/api/webhooks/razorpay`
   Event: `payment.captured` and `payment.failed`
