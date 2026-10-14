import { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Upload, Trash2, GripVertical } from 'lucide-react'
import {
  adminFetchProduct,
  adminCreateProduct,
  adminUpdateProduct,
  adminUploadImage,
  imageUrl,
} from '@/lib/api'
import { fetchCategories } from '@/lib/api'
import { Input, Textarea, Select } from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import LoadingState from '@/components/ui/LoadingState'
import { slugify } from '@/lib/utils'
import type { ProductImage } from '@/types'

interface ProductFormData {
  name: string
  slug: string
  description: string
  price: string
  sale_price: string
  sku: string
  stock: string
  sizes: string
  colors: string
  care_instructions: string
  status: string
  category_id: string
}

const EMPTY: ProductFormData = {
  name: '', slug: '', description: '', price: '', sale_price: '',
  sku: '', stock: '0', sizes: '', colors: '', care_instructions: '',
  status: 'draft', category_id: '',
}

export default function ProductEdit() {
  const { id } = useParams<{ id: string }>()
  const isNew = id === 'new'
  const navigate = useNavigate()
  const qc = useQueryClient()

  const [form, setForm] = useState<ProductFormData>(EMPTY)
  const [errors, setErrors] = useState<Partial<ProductFormData>>({})
  const [images, setImages] = useState<(ProductImage & { uploading?: boolean })[]>([])
  const [saving, setSaving] = useState(false)
  const [slugManual, setSlugManual] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories,
  })

  const { data: productData, isLoading } = useQuery({
    queryKey: ['admin-product-detail', id],
    queryFn: () => adminFetchProduct(Number(id)),
    enabled: !isNew,
  })

  const createMutation = useMutation({
    mutationFn: (data: unknown) => adminCreateProduct(data),
    onSuccess: ({ id: newId }) => {
      void qc.invalidateQueries({ queryKey: ['admin-products'] })
      void navigate(`/admin/products/${newId}`, { replace: true })
    },
  })

  const updateMutation = useMutation({
    mutationFn: (data: unknown) => adminUpdateProduct(Number(id), data),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['admin-products'] }),
  })

  useEffect(() => {
    if (!isNew && productData) {
      const p = productData
      setForm({
        name: p.name ?? '',
        slug: p.slug ?? '',
        description: p.description ?? '',
        price: p.price != null ? String(p.price / 100) : '',
        sale_price: p.sale_price != null ? String(p.sale_price / 100) : '',
        sku: p.sku ?? '',
        stock: String(p.stock ?? 0),
        sizes: Array.isArray(p.sizes) ? p.sizes.join(', ') : '',
        colors: Array.isArray(p.colors) ? p.colors.join(', ') : '',
        care_instructions: p.care_instructions ?? '',
        status: p.status ?? 'draft',
        category_id: p.category_id != null ? String(p.category_id) : '',
      })
      setImages(Array.isArray(p.images) ? (p.images as ProductImage[]).map((i) => ({ ...i })) : [])
      setSlugManual(true)
    }
  }, [isNew, productData])

  function set(key: keyof ProductFormData, value: string) {
    setForm((prev) => {
      const next = { ...prev, [key]: value }
      if (key === 'name' && !slugManual) {
        next.slug = slugify(value)
      }
      return next
    })
    if (errors[key]) setErrors((e) => { const n = { ...e }; delete n[key]; return n })
  }

  function validate() {
    const e: Partial<ProductFormData> = {}
    if (!form.name.trim()) e.name = 'Name required'
    if (!form.slug.trim()) e.slug = 'Slug required'
    if (!form.price || isNaN(Number(form.price)) || Number(form.price) <= 0) {
      e.price = 'Valid price required'
    }
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function handleSave() {
    if (!validate()) return
    setSaving(true)

    const payload = {
      name: form.name.trim(),
      slug: form.slug.trim(),
      description: form.description.trim() || null,
      price: Math.round(Number(form.price) * 100),
      sale_price: form.sale_price ? Math.round(Number(form.sale_price) * 100) : null,
      sku: form.sku.trim() || null,
      stock: parseInt(form.stock, 10) || 0,
      sizes: form.sizes ? form.sizes.split(',').map((s) => s.trim()).filter(Boolean) : [],
      colors: form.colors ? form.colors.split(',').map((s) => s.trim()).filter(Boolean) : [],
      care_instructions: form.care_instructions.trim() || null,
      status: form.status,
      category_id: form.category_id ? Number(form.category_id) : null,
    }

    try {
      if (isNew) {
        await createMutation.mutateAsync(payload)
      } else {
        await updateMutation.mutateAsync(payload)
      }
    } catch (err) {
      alert((err as Error).message)
    } finally {
      setSaving(false)
    }
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    if (!files.length) return

    for (const file of files) {
      const tempId = Date.now() + Math.random()
      const placeholder: ProductImage & { uploading: boolean } = {
        id: tempId,
        product_id: Number(id),
        r2_key: '',
        url: '',
        alt: form.name,
        sort_order: images.length,
        uploading: true,
      }
      setImages((prev) => [...prev, placeholder])

      try {
        const res = await adminUploadImage(file, {
          ...(isNew ? {} : { product_id: Number(id) }),
          folder: 'products',
          alt: form.name,
          sort_order: images.length,
        })
        setImages((prev) =>
          prev.map((img) =>
            img.id === tempId
              ? { ...img, r2_key: res.key, uploading: false }
              : img,
          ),
        )
      } catch (err) {
        alert(`Failed to upload ${file.name}: ${(err as Error).message}`)
        setImages((prev) => prev.filter((img) => img.id !== tempId))
      }
    }

    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  function removeImage(imgId: number | string) {
    setImages((prev) => prev.filter((img) => img.id !== imgId))
  }

  if (!isNew && isLoading) return <LoadingState />

  return (
    <div className="p-6 lg:p-8 max-w-4xl">
      <div className="flex items-center gap-3 mb-6">
        <Link
          to="/admin/products"
          className="p-2 text-charcoal-400 hover:text-charcoal-700 transition-colors rounded-lg hover:bg-ivory-100"
          aria-label="Back to products"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="font-serif text-2xl text-charcoal-900">
          {isNew ? 'Add Product' : 'Edit Product'}
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main form */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card p-6 space-y-4">
            <h2 className="font-semibold text-charcoal-700">Basic Info</h2>
            <Input
              label="Product Name *"
              value={form.name}
              onChange={(e) => set('name', e.target.value)}
              error={errors.name}
              placeholder="e.g. Silk Banarasi Saree"
            />
            <div>
              <Input
                label="Slug *"
                value={form.slug}
                onChange={(e) => { setSlugManual(true); set('slug', e.target.value) }}
                error={errors.slug}
                hint="URL-friendly identifier. Auto-generated from name."
                placeholder="e.g. silk-banarasi-saree"
              />
            </div>
            <Textarea
              label="Description"
              value={form.description}
              onChange={(e) => set('description', e.target.value)}
              rows={4}
              placeholder="Describe the product…"
            />
            <Input
              label="Care Instructions"
              value={form.care_instructions}
              onChange={(e) => set('care_instructions', e.target.value)}
              placeholder="e.g. Dry clean only"
            />
          </div>

          <div className="card p-6 space-y-4">
            <h2 className="font-semibold text-charcoal-700">Pricing & Inventory</h2>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Price (₹) *"
                type="number"
                min="1"
                step="0.01"
                value={form.price}
                onChange={(e) => set('price', e.target.value)}
                error={errors.price}
                placeholder="1500.00"
                hint="Enter in rupees, not paise"
              />
              <Input
                label="Sale Price (₹)"
                type="number"
                min="1"
                step="0.01"
                value={form.sale_price}
                onChange={(e) => set('sale_price', e.target.value)}
                placeholder="1200.00"
                hint="Leave blank if not on sale"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="SKU"
                value={form.sku}
                onChange={(e) => set('sku', e.target.value)}
                placeholder="e.g. SBS-RED-M"
              />
              <Input
                label="Stock Quantity"
                type="number"
                min="0"
                value={form.stock}
                onChange={(e) => set('stock', e.target.value)}
              />
            </div>
          </div>

          <div className="card p-6 space-y-4">
            <h2 className="font-semibold text-charcoal-700">Variants</h2>
            <Input
              label="Sizes"
              value={form.sizes}
              onChange={(e) => set('sizes', e.target.value)}
              hint="Comma-separated: S, M, L, XL"
              placeholder="S, M, L, XL"
            />
            <Input
              label="Colors"
              value={form.colors}
              onChange={(e) => set('colors', e.target.value)}
              hint="Comma-separated: Red, Blue, Green"
              placeholder="Red, Blue, Green"
            />
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="card p-6 space-y-4">
            <h2 className="font-semibold text-charcoal-700">Publish</h2>
            <Select
              label="Status"
              value={form.status}
              onChange={(e) => set('status', e.target.value)}
            >
              <option value="draft">Draft</option>
              <option value="active">Active</option>
              <option value="archived">Archived</option>
            </Select>
            <Select
              label="Category"
              value={form.category_id}
              onChange={(e) => set('category_id', e.target.value)}
            >
              <option value="">— No category —</option>
              {(categoriesData ?? []).map((cat) => (
                <option key={cat.id} value={String(cat.id)}>{cat.name}</option>
              ))}
            </Select>
            <Button
              className="w-full"
              loading={saving}
              onClick={() => void handleSave()}
            >
              {isNew ? 'Create Product' : 'Save Changes'}
            </Button>
          </div>

          {/* Images */}
          <div className="card p-6 space-y-4">
            <h2 className="font-semibold text-charcoal-700">Images</h2>
            {isNew && (
              <p className="text-xs text-amber-600 bg-amber-50 rounded p-2">
                Save the product first, then upload images.
              </p>
            )}

            <div className="space-y-2">
              {images.map((img, idx) => (
                <div
                  key={img.id}
                  className="flex items-center gap-2 p-2 border border-sand rounded-lg"
                >
                  <GripVertical className="w-4 h-4 text-charcoal-300 shrink-0" aria-hidden />
                  {img.uploading ? (
                    <div className="w-12 h-14 bg-ivory-200 rounded animate-pulse shrink-0" />
                  ) : (
                    <img
                      src={imageUrl(img.r2_key)}
                      alt={img.alt ?? `Image ${idx + 1}`}
                      className="w-12 h-14 object-cover rounded shrink-0 bg-ivory-200"
                    />
                  )}
                  <span className="text-xs text-charcoal-500 flex-1 truncate">
                    {img.uploading ? 'Uploading…' : (img.alt ?? `Image ${idx + 1}`)}
                  </span>
                  {!img.uploading && (
                    <button
                      type="button"
                      onClick={() => removeImage(img.id)}
                      className="p-1 text-charcoal-300 hover:text-red-500 transition-colors"
                      aria-label="Remove image"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {!isNew && (
              <>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/webp,image/png"
                  multiple
                  onChange={(e) => void handleImageUpload(e)}
                  className="sr-only"
                  id="image-upload"
                  aria-label="Upload product images"
                />
                <Button
                  variant="secondary"
                  size="sm"
                  className="w-full"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="w-4 h-4" aria-hidden />
                  Upload Images
                </Button>
                <p className="text-xs text-charcoal-400">
                  JPEG, WebP or PNG · Max 8 MB each
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
