import { useState, useEffect, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Save, Upload } from 'lucide-react'
import { adminFetchConfig, adminUpdateConfig, adminUploadImage } from '@/lib/api'
import { imageUrl } from '@/lib/api'
import { Input, Textarea, Select } from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import LoadingState from '@/components/ui/LoadingState'
import ErrorState from '@/components/ui/ErrorState'

const FIELDS: {
  key: string
  label: string
  type: 'text' | 'textarea' | 'select' | 'number' | 'image'
  hint?: string
  options?: { value: string; label: string }[]
  placeholder?: string
}[] = [
  {
    key: 'store_name',
    label: 'Store Name',
    type: 'text',
    placeholder: 'Sandhya Dresses',
  },
  {
    key: 'store_whatsapp',
    label: 'WhatsApp Number',
    type: 'text',
    hint: 'Country code + number, no spaces. e.g. 919876543210',
    placeholder: '91XXXXXXXXXX',
  },
  {
    key: 'store_phone',
    label: 'Contact Phone',
    type: 'text',
    placeholder: '+91 98765 43210',
  },
  {
    key: 'store_email',
    label: 'Contact Email',
    type: 'text',
    placeholder: 'sandhyadresses@example.com',
  },
  {
    key: 'store_hours',
    label: 'Store Hours',
    type: 'text',
    placeholder: 'Mon–Sat 10am–8pm',
  },
  {
    key: 'return_policy',
    label: 'Return Policy',
    type: 'textarea',
    hint: 'Shown on product pages and returns page.',
    placeholder: 'Exchange within 7 days of delivery with original packaging.',
  },
  {
    key: 'low_stock_threshold',
    label: 'Low Stock Alert Threshold',
    type: 'number',
    hint: 'Products with stock ≤ this are flagged in Dashboard.',
  },
  {
    key: 'razorpay_enabled',
    label: 'Razorpay Payments',
    type: 'select',
    options: [{ value: '1', label: 'Enabled' }, { value: '0', label: 'Disabled' }],
  },
  {
    key: 'upi_enabled',
    label: 'UPI QR Payments',
    type: 'select',
    options: [{ value: '1', label: 'Enabled' }, { value: '0', label: 'Disabled' }],
  },
  {
    key: 'cod_enabled',
    label: 'Cash on Delivery',
    type: 'select',
    options: [{ value: '1', label: 'Enabled' }, { value: '0', label: 'Disabled' }],
  },
  {
    key: 'upi_qr_image',
    label: 'UPI QR Code Image',
    type: 'image',
    hint: 'Upload the store UPI QR code (PNG/JPEG, ≤ 2MB).',
  },
  {
    key: 'announcement_bar_text',
    label: 'Announcement Bar Text',
    type: 'text',
    hint: 'Leave blank to hide the announcement bar.',
    placeholder: 'Free delivery on orders above ₹999!',
  },
  {
    key: 'announcement_bar_enabled',
    label: 'Show Announcement Bar',
    type: 'select',
    options: [{ value: '1', label: 'Yes' }, { value: '0', label: 'No' }],
  },
]

export default function AdminSettings() {
  const qc = useQueryClient()
  const [values, setValues] = useState<Record<string, string>>({})
  const [dirty, setDirty] = useState(false)
  const [qrUploading, setQrUploading] = useState(false)
  const qrInputRef = useRef<HTMLInputElement>(null)

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['admin-config'],
    queryFn: adminFetchConfig,
  })

  useEffect(() => {
    if (data?.config) {
      setValues(data.config)
      setDirty(false)
    }
  }, [data])

  const saveMutation = useMutation({
    mutationFn: (v: Record<string, string>) => adminUpdateConfig(v),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['admin-config'] })
      setDirty(false)
    },
  })

  function set(key: string, value: string) {
    setValues((prev) => ({ ...prev, [key]: value }))
    setDirty(true)
  }

  async function handleQrUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setQrUploading(true)
    try {
      const res = await adminUploadImage(file, { folder: 'config', alt: 'UPI QR Code' })
      set('upi_qr_image', res.key)
    } catch (err) {
      alert(`Upload failed: ${(err as Error).message}`)
    } finally {
      setQrUploading(false)
      if (qrInputRef.current) qrInputRef.current.value = ''
    }
  }

  if (isLoading) return <LoadingState />
  if (isError) return <ErrorState retry={() => void refetch()} />

  return (
    <div className="p-6 lg:p-8 max-w-3xl">
      <div className="flex items-center justify-between mb-8 flex-wrap gap-3">
        <h1 className="font-serif text-2xl text-charcoal-900">Settings</h1>
        <Button
          loading={saveMutation.isPending}
          disabled={!dirty}
          onClick={() => void saveMutation.mutateAsync(values)}
        >
          <Save className="w-4 h-4" aria-hidden />
          Save Changes
        </Button>
      </div>

      {saveMutation.isSuccess && (
        <div role="status" className="mb-6 px-4 py-3 bg-green-50 border border-green-200 text-green-800 text-sm rounded-lg">
          Settings saved successfully.
        </div>
      )}
      {saveMutation.isError && (
        <div role="alert" className="mb-6 px-4 py-3 bg-red-50 border border-red-200 text-red-800 text-sm rounded-lg">
          {(saveMutation.error as Error).message}
        </div>
      )}

      <div className="space-y-8">
        {/* Store Info */}
        <section aria-labelledby="section-store" className="card p-6 space-y-5">
          <h2 id="section-store" className="font-semibold text-charcoal-700 border-b border-sand pb-2">
            Store Information
          </h2>
          {FIELDS.filter((f) => ['store_name', 'store_whatsapp', 'store_phone', 'store_email', 'store_hours'].includes(f.key)).map((field) => (
            <Input
              key={field.key}
              label={field.label}
              type="text"
              value={values[field.key] ?? ''}
              onChange={(e) => set(field.key, e.target.value)}
              hint={field.hint}
              placeholder={field.placeholder}
            />
          ))}
        </section>

        {/* Payment methods */}
        <section aria-labelledby="section-payments" className="card p-6 space-y-5">
          <h2 id="section-payments" className="font-semibold text-charcoal-700 border-b border-sand pb-2">
            Payment Methods
          </h2>
          <p className="text-xs text-charcoal-500">
            Razorpay requires <code>RAZORPAY_KEY_ID</code> and <code>RAZORPAY_KEY_SECRET</code> secrets set in Cloudflare Worker.
          </p>
          {FIELDS.filter((f) => ['razorpay_enabled', 'upi_enabled', 'cod_enabled'].includes(f.key)).map((field) => (
            <Select
              key={field.key}
              label={field.label}
              value={values[field.key] ?? '1'}
              onChange={(e) => set(field.key, e.target.value)}
            >
              {field.options?.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </Select>
          ))}
        </section>

        {/* UPI QR */}
        <section aria-labelledby="section-upi" className="card p-6 space-y-5">
          <h2 id="section-upi" className="font-semibold text-charcoal-700 border-b border-sand pb-2">
            UPI QR Code
          </h2>
          <p className="text-xs text-charcoal-500">
            Shown at checkout when UPI is enabled. Upload your store UPI QR image.
          </p>

          {values.upi_qr_image && (
            <div className="flex items-start gap-4">
              <img
                src={imageUrl(values.upi_qr_image)}
                alt="UPI QR Code"
                className="w-32 h-32 object-contain border border-sand rounded-lg bg-white p-1"
              />
              <button
                type="button"
                className="text-xs text-red-500 hover:text-red-700 mt-2"
                onClick={() => set('upi_qr_image', '')}
              >
                Remove
              </button>
            </div>
          )}

          <input
            ref={qrInputRef}
            type="file"
            accept="image/jpeg,image/webp,image/png"
            onChange={(e) => void handleQrUpload(e)}
            className="sr-only"
            aria-label="Upload UPI QR code"
          />
          <Button
            variant="secondary"
            size="sm"
            loading={qrUploading}
            onClick={() => qrInputRef.current?.click()}
          >
            <Upload className="w-4 h-4" aria-hidden />
            {values.upi_qr_image ? 'Replace QR Image' : 'Upload QR Image'}
          </Button>
        </section>

        {/* Return policy */}
        <section aria-labelledby="section-policy" className="card p-6 space-y-5">
          <h2 id="section-policy" className="font-semibold text-charcoal-700 border-b border-sand pb-2">
            Policies
          </h2>
          <Textarea
            label="Return Policy"
            value={values.return_policy ?? ''}
            onChange={(e) => set('return_policy', e.target.value)}
            rows={5}
            hint="Shown on product pages and the Returns page."
            placeholder="Exchange within 7 days of delivery with original packaging and tags intact."
          />
        </section>

        {/* Announcement bar */}
        <section aria-labelledby="section-announce" className="card p-6 space-y-5">
          <h2 id="section-announce" className="font-semibold text-charcoal-700 border-b border-sand pb-2">
            Announcement Bar
          </h2>
          <Select
            label="Show Announcement Bar"
            value={values.announcement_bar_enabled ?? '0'}
            onChange={(e) => set('announcement_bar_enabled', e.target.value)}
          >
            <option value="1">Yes</option>
            <option value="0">No</option>
          </Select>
          <Input
            label="Announcement Text"
            value={values.announcement_bar_text ?? ''}
            onChange={(e) => set('announcement_bar_text', e.target.value)}
            placeholder="Free delivery on orders above ₹999!"
          />
        </section>

        {/* Operations */}
        <section aria-labelledby="section-ops" className="card p-6 space-y-5">
          <h2 id="section-ops" className="font-semibold text-charcoal-700 border-b border-sand pb-2">
            Operations
          </h2>
          <Input
            label="Low Stock Threshold"
            type="number"
            min="0"
            value={values.low_stock_threshold ?? '5'}
            onChange={(e) => set('low_stock_threshold', e.target.value)}
            hint="Products with stock at or below this are shown in the Dashboard alert."
          />
        </section>
      </div>

      <div className="mt-8 flex justify-end">
        <Button
          loading={saveMutation.isPending}
          disabled={!dirty}
          onClick={() => void saveMutation.mutateAsync(values)}
        >
          <Save className="w-4 h-4" aria-hidden />
          Save Changes
        </Button>
      </div>
    </div>
  )
}
