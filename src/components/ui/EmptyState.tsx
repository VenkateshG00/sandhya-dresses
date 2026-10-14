import type { ReactNode } from 'react'
import { Search, ShoppingBag } from 'lucide-react'
import Button from './Button'

interface Props {
  icon?: ReactNode | undefined
  title: string
  description?: string | undefined
  action?: { label: string; onClick: () => void } | undefined
}

export default function EmptyState({ icon, title, description, action }: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
      <div className="w-16 h-16 rounded-full bg-ivory-200 flex items-center justify-center mb-5 text-charcoal-400">
        {icon ?? <Search className="w-7 h-7" aria-hidden />}
      </div>
      <h3 className="font-serif text-xl text-charcoal-800 mb-2">{title}</h3>
      {description && (
        <p className="text-sm text-charcoal-500 max-w-sm mb-6">{description}</p>
      )}
      {action && (
        <Button onClick={action.onClick}>{action.label}</Button>
      )}
    </div>
  )
}

export function EmptyCart() {
  return (
    <EmptyState
      icon={<ShoppingBag className="w-7 h-7" aria-hidden />}
      title="Your cart is empty"
      description="Browse our collection and add items to your cart."
    />
  )
}
