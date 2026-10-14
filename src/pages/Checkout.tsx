import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { ShoppingBag, ArrowLeft, CreditCard, Banknote, Smartphone } from 'lucide-react'
import { useCartStore, formatPrice, cartItemsToOrderItems } from '@/lib/cart'
import { useSiteConfig } from '@/lib/config'
import { createOrder } from '@/lib/api'
import { imageUrl } from '@/lib/api'
import { Input, Textarea } from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import Breadcrumbs from '@/components/ui/Breadcrumbs'
import type { CreateOrderResponse } from '@/types'
import { isValidIndianPhone, isValidPin } from '@/lib/utils'

interface FormState {
  customer_name: string
  phone: string
  email: string
  line1: string
  line2: string
  city: string
  state: string
  pin: string
  notes: string
  payment_method: 'razorpay' | 'upi' | 'cod'
}

interface Errors {
  [key: string]: string
}

export default function Checkout() {
  const navigate = useNavigate()
  const { data: config } = useSiteConfig()
  const items = useCartStore((s) => s.items)
  const subtotal = useCartStore((s) => s.subtotal())
  const clearCart = useCartStore((s) => s.clearCart)

  const [form, setForm] = useState<FormState>({
    customer_name: '',
    phone: '',
    email: '',
    line1: '',
    line2: '',
    city: '',
    state: 'Telangana',
    pin: '',
    notes: '',
    payment_method: config?.cod_enabled === 'true' ? 'cod' : 'razorpay',
  })

  const [errors, setErrors] = useState<Errors>({})
  const [submitting, setSubmitting] = useState(false)
  const [serverError, setServerError] = useState('')

  const codEnabled = config?.cod_enabled === 'true'
  const upiEnabled = config?.upi_enabled === 'true'
  const razorpayEnabled = config?.razorpay_enabled === 'true'
  const upiQrKey = config?.upi_qr_r2_key

  if (items.length === 0) {
    return (
      <main className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center px-4">
          <ShoppingBag className="w-12 h-12 text-charcoal-300 mx-auto mb-4" aria-hidden />
          <h1 className="font-serif text-xl text-charcoal-900 mb-2">Your cart is empty</h1>
          <p className="text-charcoal-500 mb-6">Add items to your cart before checking out.</p>
          <Link to="/shop" className="btn-primary">Browse Collection</Link>
        </div>
      </main>
    )
  }

  function set(field: keyof FormState, value: string) {
    setForm((f) => ({ ...f, [field]: value }))
    if (errors[field]) setErrors((e) => ({ ...e, [field]: '' }))
  }

  function validate(): boolean {
    const e: Errors = {}
    if (!form.customer_name.trim()) e.customer_name = 'Name is required'
    if (!form.phone.trim()) e.phone = 'Phone is required'
    else if (!isValidIndianPhone(form.phone.replace(/\s/g, '')))
      e.phone = 'Enter a valid 10-digit mobile number'
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      e.email = 'Enter a valid email address'
    if (!form.line1.trim()) e.line1 = 'Address is required'
    if (!form.city.trim()) e.city = 'City is required'
    if (!form.state.trim()) e.state = 'State is required'
    if (!form.pin.trim()) e.pin = 'PIN code is required'
    else if (!isValidPin(form.pin)) e.pin = 'Enter a valid 6-digit PIN'

    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function loadRazorpayScript(): Promise<boolean> {
    return new Promise((resolve) => {
      if (window.Razorpay) return resolve(true)
      const script = document.createElement('script')
      script.src = 'https://checkout.razorpay.com/v1/checkout.js'
      script.onload = () => resolve(true)
      script.onerror = () => resolve(false)
      document.head.appendChild(script)
    })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return

    setSubmitting(true)
    setServerError('')

    try {
      const orderItems = cartItemsToOrderItems(items)

      const res: CreateOrderResponse = await createOrder({
        customer_name: form.customer_name.trim(),
        phone: form.phone.replace(/\s/g, ''),
        email: form.email.trim() || undefined,
        address: {
          line1: form.line1.trim(),
          line2: form.line2.trim(),
          city: form.city.trim(),
          state: form.state.trim(),
          pin: form.pin.trim(),
          country: 'India',
        },
        items: orderItems,
        payment_method: form.payment_method,
        notes: form.notes.trim() || undefined,
      })

      if (form.payment_method === 'razorpay' && res.razorpay_order_id && res.razorpay_key_id) {
        const loaded = await loadRazorpayScript()
        if (!loaded) {
          setServerError('Failed to load payment gateway. Please try another payment method.')
          setSubmitting(false)
          return
        }

        const rzp = new window.Razorpay({
          key: res.razorpay_key_id,
          amount: res.total,
          currency: 'INR',
          order_id: res.razorpay_order_id,
          name: 'Sandhya Dresses',
          description: `Order #${res.order_number}`,
          prefill: {
            name: form.customer_name,
            contact: form.phone,
            ...(form.email ? { email: form.email } : {}),
          },
          theme: { color: '#7B1D3A' },
          handler: (_response) => {
            // Payment captured — webhook updates DB server-side
            clearCart()
            void navigate(`/order-confirmation/${res.order_number}`, { replace: true })
          },
          modal: {
            ondismiss: () => {
              setSubmitting(false)
            },
          },
        })
        rzp.open()
        return
      }

      // COD or UPI — order is placed, no payment gateway
      clearCart()
      void navigate(`/order-confirmation/${res.order_number}`, { replace: true })
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'Failed to place order. Please try again.')
      setSubmitting(false)
    }
  }

  return (
    <main>
      <div className="bg-cream border-b border-sand py-8">
        <div className="page-container">
          <Breadcrumbs
            crumbs={[
              { label: 'Home', to: '/' },
              { label: 'Shop', to: '/shop' },
              { label: 'Checkout' },
            ]}
            className="mb-3"
          />
          <h1 className="font-serif text-display-sm text-charcoal-900">Checkout</h1>
        </div>
      </div>

      <div className="page-container py-10">
        <form onSubmit={(e) => void handleSubmit(e)} noValidate>
          <div className="grid lg:grid-cols-3 gap-10">
            {/* Left: form */}
            <div className="lg:col-span-2 space-y-8">
              {/* Contact */}
              <section aria-labelledby="contact-heading">
                <h2 id="contact-heading" className="font-serif text-xl text-charcoal-900 mb-5">
                  Contact Information
                </h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <Input
                      label="Full Name"
                      required
                      value={form.customer_name}
                      onChange={(e) => set('customer_name', e.target.value)}
                      error={errors.customer_name}
                      autoComplete="name"
                    />
                  </div>
                  <Input
                    label="Mobile Number"
                    required
                    type="tel"
                    value={form.phone}
                    onChange={(e) => set('phone', e.target.value)}
                    error={errors.phone}
                    autoComplete="tel"
                    hint="10-digit Indian mobile number"
                  />
                  <Input
                    label="Email (optional)"
                    type="email"
                    value={form.email}
                    onChange={(e) => set('email', e.target.value)}
                    error={errors.email}
                    autoComplete="email"
                  />
                </div>
              </section>

              {/* Delivery address */}
              <section aria-labelledby="address-heading">
                <h2 id="address-heading" className="font-serif text-xl text-charcoal-900 mb-5">
                  Delivery Address
                </h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <Input
                      label="Address Line 1"
                      required
                      value={form.line1}
                      onChange={(e) => set('line1', e.target.value)}
                      error={errors.line1}
                      autoComplete="address-line1"
                      placeholder="House / flat number, street"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <Input
                      label="Address Line 2 (optional)"
                      value={form.line2}
                      onChange={(e) => set('line2', e.target.value)}
                      autoComplete="address-line2"
                      placeholder="Landmark, village"
                    />
                  </div>
                  <Input
                    label="City / District"
                    required
                    value={form.city}
                    onChange={(e) => set('city', e.target.value)}
                    error={errors.city}
                    autoComplete="address-level2"
                  />
                  <Input
                    label="State"
                    required
                    value={form.state}
                    onChange={(e) => set('state', e.target.value)}
                    error={errors.state}
                    autoComplete="address-level1"
                  />
                  <Input
                    label="PIN Code"
                    required
                    value={form.pin}
                    onChange={(e) => set('pin', e.target.value)}
                    error={errors.pin}
                    autoComplete="postal-code"
                    maxLength={6}
                    inputMode="numeric"
                  />
                </div>
              </section>

              {/* Payment */}
              <section aria-labelledby="payment-heading">
                <h2 id="payment-heading" className="font-serif text-xl text-charcoal-900 mb-5">
                  Payment Method
                </h2>
                <div className="space-y-3" role="group" aria-label="Choose payment method">
                  {razorpayEnabled && (
                    <label className={`flex items-start gap-4 p-4 rounded-xl border cursor-pointer transition-colors ${
                      form.payment_method === 'razorpay'
                        ? 'border-burgundy-500 bg-burgundy-50'
                        : 'border-sand hover:border-burgundy-300'
                    }`}>
                      <input
                        type="radio"
                        name="payment_method"
                        value="razorpay"
                        checked={form.payment_method === 'razorpay'}
                        onChange={() => set('payment_method', 'razorpay')}
                        className="mt-1 accent-burgundy-600"
                      />
                      <div className="flex items-center gap-3">
                        <CreditCard className="w-5 h-5 text-burgundy-500 shrink-0" aria-hidden />
                        <div>
                          <p className="font-medium text-sm text-charcoal-800">Pay Online (Razorpay)</p>
                          <p className="text-xs text-charcoal-500 mt-0.5">
                            Credit / debit cards, UPI, net banking, wallets
                          </p>
                        </div>
                      </div>
                    </label>
                  )}

                  {upiEnabled && (
                    <label className={`flex items-start gap-4 p-4 rounded-xl border cursor-pointer transition-colors ${
                      form.payment_method === 'upi'
                        ? 'border-burgundy-500 bg-burgundy-50'
                        : 'border-sand hover:border-burgundy-300'
                    }`}>
                      <input
                        type="radio"
                        name="payment_method"
                        value="upi"
                        checked={form.payment_method === 'upi'}
                        onChange={() => set('payment_method', 'upi')}
                        className="mt-1 accent-burgundy-600"
                      />
                      <div className="flex items-start gap-3">
                        <Smartphone className="w-5 h-5 text-burgundy-500 shrink-0 mt-0.5" aria-hidden />
                        <div>
                          <p className="font-medium text-sm text-charcoal-800">UPI (Scan & Pay)</p>
                          <p className="text-xs text-charcoal-500 mt-0.5">
                            Scan the QR code shown after placing order
                          </p>
                          {upiQrKey && form.payment_method === 'upi' && (
                            <img
                              src={imageUrl(upiQrKey)}
                              alt="UPI QR code"
                              className="w-28 h-28 mt-3 rounded border border-sand"
                            />
                          )}
                          {config?.upi_id && (
                            <p className="text-xs font-mono text-charcoal-600 mt-1">
                              UPI ID: {config.upi_id}
                            </p>
                          )}
                        </div>
                      </div>
                    </label>
                  )}

                  {codEnabled && (
                    <label className={`flex items-start gap-4 p-4 rounded-xl border cursor-pointer transition-colors ${
                      form.payment_method === 'cod'
                        ? 'border-burgundy-500 bg-burgundy-50'
                        : 'border-sand hover:border-burgundy-300'
                    }`}>
                      <input
                        type="radio"
                        name="payment_method"
                        value="cod"
                        checked={form.payment_method === 'cod'}
                        onChange={() => set('payment_method', 'cod')}
                        className="mt-1 accent-burgundy-600"
                      />
                      <div className="flex items-center gap-3">
                        <Banknote className="w-5 h-5 text-burgundy-500 shrink-0" aria-hidden />
                        <div>
                          <p className="font-medium text-sm text-charcoal-800">Cash on Delivery</p>
                          <p className="text-xs text-charcoal-500 mt-0.5">
                            Pay in cash when your order arrives
                          </p>
                        </div>
                      </div>
                    </label>
                  )}
                </div>
              </section>

              {/* Notes */}
              <Textarea
                label="Order Notes (optional)"
                value={form.notes}
                onChange={(e) => set('notes', e.target.value)}
                placeholder="Special instructions or requests…"
                rows={3}
              />

              {/* Server error */}
              {serverError && (
                <div role="alert" className="p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                  {serverError}
                </div>
              )}
            </div>

            {/* Right: order summary */}
            <aside aria-label="Order summary">
              <div className="card p-5 sticky top-24">
                <h2 className="font-serif text-lg text-charcoal-900 mb-5">Order Summary</h2>

                <ul className="space-y-4 mb-5">
                  {items.map((item) => {
                    const price = item.product.sale_price ?? item.product.price
                    const img = item.product.primary_image
                      ? imageUrl(item.product.primary_image)
                      : '/placeholder-product.svg'

                    return (
                      <li
                        key={`${item.product.id}-${item.variant_size}-${item.variant_color}`}
                        className="flex gap-3"
                      >
                        <div className="w-12 h-14 rounded overflow-hidden bg-ivory-200 shrink-0">
                          <img
                            src={img}
                            alt={item.product.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-charcoal-800 line-clamp-2 leading-snug">
                            {item.product.name}
                          </p>
                          {(item.variant_size || item.variant_color) && (
                            <p className="text-[11px] text-charcoal-400 mt-0.5">
                              {[item.variant_size, item.variant_color].filter(Boolean).join(' · ')}
                            </p>
                          )}
                          <p className="text-xs text-charcoal-600 mt-0.5">
                            {formatPrice(price)} × {item.quantity}
                          </p>
                        </div>
                        <p className="text-xs font-medium text-charcoal-800 shrink-0">
                          {formatPrice(price * item.quantity)}
                        </p>
                      </li>
                    )
                  })}
                </ul>

                <div className="divider mb-4" />

                <dl className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-charcoal-500">Subtotal</dt>
                    <dd className="font-medium">{formatPrice(subtotal)}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-charcoal-500">Shipping</dt>
                    <dd className="font-medium text-green-600">Free</dd>
                  </div>
                  <div className="divider" />
                  <div className="flex justify-between text-base">
                    <dt className="font-semibold text-charcoal-900">Total</dt>
                    <dd className="font-bold text-charcoal-900">{formatPrice(subtotal)}</dd>
                  </div>
                </dl>

                <Button
                  type="submit"
                  loading={submitting}
                  className="w-full mt-5"
                  size="lg"
                >
                  {form.payment_method === 'razorpay'
                    ? 'Continue to Payment'
                    : 'Place Order'}
                </Button>

                <Link
                  to="/shop"
                  className="flex items-center justify-center gap-2 mt-3 text-xs text-charcoal-500 hover:text-burgundy-600 transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" aria-hidden />
                  Continue shopping
                </Link>
              </div>
            </aside>
          </div>
        </form>
      </div>
    </main>
  )
}
