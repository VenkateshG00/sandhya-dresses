const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/avif']
const MAX_SIZE_BYTES = 10 * 1024 * 1024 // 10 MB

async function sha1Hex(data: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-1', new TextEncoder().encode(data))
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, '0')).join('')
}

async function sign(params: Record<string, string>, apiSecret: string): Promise<string> {
  const sorted = Object.keys(params).sort()
    .map((k) => `${k}=${params[k]}`)
    .join('&')
  return sha1Hex(sorted + apiSecret)
}

export async function uploadImage(
  cloudName: string,
  apiKey: string,
  apiSecret: string,
  file: File,
  folder: 'products' | 'config',
): Promise<{ key: string; url: string }> {
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error('Invalid file type. Only JPEG, PNG, WebP, and AVIF are allowed.')
  }
  if (file.size > MAX_SIZE_BYTES) {
    throw new Error('File too large. Maximum size is 10 MB.')
  }

  const timestamp = String(Math.floor(Date.now() / 1000))
  const params: Record<string, string> = { folder, timestamp }
  const signature = await sign(params, apiSecret)

  const form = new FormData()
  form.append('file', file)
  form.append('folder', folder)
  form.append('timestamp', timestamp)
  form.append('api_key', apiKey)
  form.append('signature', signature)

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    { method: 'POST', body: form },
  )

  if (!res.ok) {
    const err = await res.json() as { error?: { message?: string } }
    throw new Error(err.error?.message ?? 'Cloudinary upload failed')
  }

  const data = await res.json() as { secure_url: string; public_id: string }
  // Store the full URL in r2_key column — imageUrl() in api.ts already handles http URLs
  return { key: data.secure_url, url: data.secure_url }
}

export async function deleteImage(
  cloudName: string,
  apiKey: string,
  apiSecret: string,
  publicIdOrUrl: string,
): Promise<void> {
  // Extract public_id from URL if a full URL was passed
  let publicId = publicIdOrUrl
  if (publicIdOrUrl.startsWith('http')) {
    // e.g. https://res.cloudinary.com/{cloud}/image/upload/v123/{folder}/{id}.jpg
    const match = publicIdOrUrl.match(/\/upload\/(?:v\d+\/)?(.+?)(?:\.[a-z]+)?$/)
    if (match) publicId = match[1]
  }

  const timestamp = String(Math.floor(Date.now() / 1000))
  const params: Record<string, string> = { public_id: publicId, timestamp }
  const signature = await sign(params, apiSecret)

  const form = new FormData()
  form.append('public_id', publicId)
  form.append('timestamp', timestamp)
  form.append('api_key', apiKey)
  form.append('signature', signature)

  await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`,
    { method: 'POST', body: form },
  )
}
