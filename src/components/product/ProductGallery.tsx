import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { ProductImage } from '@/types'
import { imageUrl } from '@/lib/api'

interface Props {
  images: ProductImage[]
  productName: string
}

export default function ProductGallery({ images, productName }: Props) {
  const [activeIndex, setActiveIndex] = useState(0)

  const placeholderImages: ProductImage[] = images.length === 0
    ? [{ id: 0, product_id: 0, r2_key: '', alt: productName, sort_order: 0, url: '/placeholder-product.svg' }]
    : images

  const active = placeholderImages[activeIndex]
  const total = placeholderImages.length

  function prev() {
    setActiveIndex((i) => (i - 1 + total) % total)
  }

  function next() {
    setActiveIndex((i) => (i + 1) % total)
  }

  return (
    <div className="space-y-3">
      {/* Main image */}
      <div className="relative overflow-hidden rounded-xl bg-ivory-200 aspect-product">
        <img
          key={active.r2_key || active.url}
          src={active.r2_key ? imageUrl(active.r2_key) : active.url}
          alt={active.alt || productName}
          loading="eager"
          decoding="async"
          className="absolute inset-0 w-full h-full object-cover"
        />

        {total > 1 && (
          <>
            <button
              type="button"
              onClick={prev}
              aria-label="Previous image"
              className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 shadow-md flex items-center justify-center hover:bg-white transition-colors focus-visible:ring-2 focus-visible:ring-burgundy-500"
            >
              <ChevronLeft className="w-5 h-5" aria-hidden />
            </button>
            <button
              type="button"
              onClick={next}
              aria-label="Next image"
              className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 shadow-md flex items-center justify-center hover:bg-white transition-colors focus-visible:ring-2 focus-visible:ring-burgundy-500"
            >
              <ChevronRight className="w-5 h-5" aria-hidden />
            </button>

            {/* Dot indicators */}
            <div
              className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5"
              role="tablist"
              aria-label="Gallery images"
            >
              {placeholderImages.map((_img, i) => (
                <button
                  key={i}
                  type="button"
                  role="tab"
                  aria-selected={i === activeIndex}
                  aria-label={`Image ${i + 1}`}
                  onClick={() => setActiveIndex(i)}
                  className={`w-1.5 h-1.5 rounded-full transition-all ${
                    i === activeIndex
                      ? 'bg-white w-4'
                      : 'bg-white/60 hover:bg-white/80'
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {total > 1 && (
        <div
          className="flex gap-2 overflow-x-auto scrollbar-hide pb-1"
          role="tablist"
          aria-label="Product thumbnails"
        >
          {placeholderImages.map((img, i) => (
            <button
              key={i}
              type="button"
              role="tab"
              aria-selected={i === activeIndex}
              aria-label={`View image ${i + 1}`}
              onClick={() => setActiveIndex(i)}
              className={`shrink-0 w-16 h-20 rounded-lg overflow-hidden border-2 transition-all focus-visible:ring-2 focus-visible:ring-burgundy-500 ${
                i === activeIndex
                  ? 'border-burgundy-500'
                  : 'border-transparent hover:border-sand'
              }`}
            >
              <img
                src={img.r2_key ? imageUrl(img.r2_key) : img.url}
                alt={img.alt || `${productName} view ${i + 1}`}
                loading="lazy"
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
