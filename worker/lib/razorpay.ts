// Razorpay integration — keys must be set via wrangler secrets
// RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET are never hardcoded

const RAZORPAY_API = 'https://api.razorpay.com/v1'

export interface RazorpayOrder {
  id: string
  amount: number
  currency: string
  receipt: string
  status: string
}

export async function createRazorpayOrder(
  keyId: string,
  keySecret: string,
  amountPaise: number,
  receiptId: string,
): Promise<RazorpayOrder> {
  const credentials = btoa(`${keyId}:${keySecret}`)

  const res = await fetch(`${RAZORPAY_API}/orders`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${credentials}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      amount: amountPaise,
      currency: 'INR',
      receipt: receiptId,
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Razorpay order creation failed: ${err}`)
  }

  return res.json() as Promise<RazorpayOrder>
}

export async function verifyWebhookSignature(
  body: string,
  signature: string,
  secret: string,
): Promise<boolean> {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )

  const expected = await crypto.subtle.sign(
    'HMAC',
    key,
    new TextEncoder().encode(body),
  )

  const expectedHex = Array.from(new Uint8Array(expected))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')

  return expectedHex === signature
}

export function isRazorpayConfigured(keyId: string, keySecret: string): boolean {
  return (
    typeof keyId === 'string' &&
    keyId.startsWith('rzp_') &&
    keyId.length > 10 &&
    typeof keySecret === 'string' &&
    keySecret.length > 10
  )
}
