import { MessageCircle } from 'lucide-react'
import { useSiteConfig } from '@/lib/config'
import { buildWhatsAppProductEnquiry } from '@/lib/cart'
import type { Product } from '@/types'
import { cn } from '@/lib/utils'

interface Props {
  product: Pick<Product, 'name' | 'slug'>
  selectedSize?: string | null
  selectedColor?: string | null
  className?: string
}

export default function WhatsAppEnquiryButton({
  product,
  selectedSize,
  selectedColor,
  className,
}: Props) {
  const { data: config } = useSiteConfig()
  const number = config?.store_whatsapp?.replace(/\D/g, '')

  if (!number || number.length < 10) return null

  const link = buildWhatsAppProductEnquiry(
    product,
    selectedSize ?? null,
    selectedColor ?? null,
    number,
  )

  return (
    <a
      href={link}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        'inline-flex items-center justify-center gap-2 px-5 py-3 bg-green-600 hover:bg-green-700 active:bg-green-800 text-white text-sm font-medium rounded transition-colors',
        className,
      )}
    >
      <MessageCircle className="w-4 h-4" aria-hidden />
      Enquire on WhatsApp
    </a>
  )
}
