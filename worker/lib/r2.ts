import type { R2Bucket } from '@cloudflare/workers-types'

const ALLOWED_TYPES: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/avif': 'avif',
}

const MAX_SIZE_BYTES = 8 * 1024 * 1024 // 8 MB

export async function uploadImage(
  bucket: R2Bucket,
  file: File,
  folder: 'products' | 'config',
): Promise<{ key: string; url: string }> {
  if (!ALLOWED_TYPES[file.type]) {
    throw new Error('Invalid file type. Only JPEG, PNG, WebP, and AVIF are allowed.')
  }
  if (file.size > MAX_SIZE_BYTES) {
    throw new Error('File too large. Maximum size is 8 MB.')
  }

  const ext = ALLOWED_TYPES[file.type]
  const id = crypto.randomUUID()
  const key = `${folder}/${id}.${ext}`

  await bucket.put(key, await file.arrayBuffer(), {
    httpMetadata: { contentType: file.type },
    customMetadata: { originalName: file.name },
  })

  return { key, url: `/api/images/${key}` }
}

export async function getImage(
  bucket: R2Bucket,
  key: string,
): Promise<Response> {
  const object = await bucket.get(key)
  if (!object) {
    return new Response('Image not found', { status: 404 })
  }

  const contentType = object.httpMetadata?.contentType ?? 'application/octet-stream'

  return new Response(object.body, {
    headers: {
      'Content-Type': contentType,
      'Cache-Control': 'public, max-age=31536000, immutable',
      ETag: object.etag,
    },
  })
}

export async function deleteImage(
  bucket: R2Bucket,
  key: string,
): Promise<void> {
  await bucket.delete(key)
}
