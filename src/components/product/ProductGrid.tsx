import type { Product } from '@/types'
import ProductCard from './ProductCard'
import { cn } from '@/lib/utils'

interface Props {
  products: Product[]
  className?: string
  priorityCount?: number
}

export default function ProductGrid({ products, className, priorityCount = 4 }: Props) {
  return (
    <div
      className={cn(
        'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-x-5 lg:gap-y-8',
        className,
      )}
    >
      {products.map((product, i) => (
        <ProductCard
          key={product.id}
          product={product}
          priority={i < priorityCount}
        />
      ))}
    </div>
  )
}
