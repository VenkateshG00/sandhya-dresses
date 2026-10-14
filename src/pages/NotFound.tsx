import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

export default function NotFound() {
  return (
    <main className="min-h-[70vh] flex items-center justify-center">
      <div className="text-center px-4 py-20">
        <p className="font-serif text-7xl font-light text-burgundy-200 mb-4" aria-hidden>
          404
        </p>
        <h1 className="font-serif text-display-sm text-charcoal-900 mb-3">
          Page not found
        </h1>
        <p className="text-charcoal-500 max-w-sm mx-auto mb-8">
          This page doesn't exist or has been moved. Let's get you back to the collection.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link to="/" className="btn-primary gap-2">
            <ArrowLeft className="w-4 h-4" aria-hidden />
            Back to Home
          </Link>
          <Link to="/shop" className="btn-secondary">
            Browse Collection
          </Link>
        </div>
      </div>
    </main>
  )
}
