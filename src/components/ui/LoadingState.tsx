interface Props {
  message?: string
  className?: string
}

export function LoadingSpinner({ className = 'w-8 h-8' }: { className?: string }) {
  return (
    <span
      role="status"
      aria-label="Loading"
      className={`inline-block border-2 border-burgundy-200 border-t-burgundy-500 rounded-full animate-spin ${className}`}
    />
  )
}

export default function LoadingState({ message = 'Loading…', className = '' }: Props) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={`flex flex-col items-center justify-center py-20 gap-4 ${className}`}
    >
      <LoadingSpinner />
      <p className="text-sm text-charcoal-500">{message}</p>
    </div>
  )
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6" aria-busy="true">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="animate-pulse">
          <div className="aspect-product bg-ivory-200 rounded-lg mb-3" />
          <div className="h-3 bg-ivory-200 rounded w-3/4 mb-2" />
          <div className="h-3 bg-ivory-200 rounded w-1/2" />
        </div>
      ))}
    </div>
  )
}
