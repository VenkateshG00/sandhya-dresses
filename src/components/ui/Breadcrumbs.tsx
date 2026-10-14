import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'

export interface Crumb {
  label: string
  to?: string
}

interface Props {
  crumbs: Crumb[]
  className?: string
}

export default function Breadcrumbs({ crumbs, className = '' }: Props) {
  return (
    <nav aria-label="Breadcrumb" className={className}>
      <ol className="flex flex-wrap items-center gap-1 text-sm text-charcoal-500">
        {crumbs.map((crumb, i) => {
          const isLast = i === crumbs.length - 1
          return (
            <li key={i} className="flex items-center gap-1">
              {i > 0 && <ChevronRight className="w-3.5 h-3.5 text-charcoal-400 shrink-0" aria-hidden />}
              {crumb.to && !isLast ? (
                <Link
                  to={crumb.to}
                  className="hover:text-burgundy-600 transition-colors"
                >
                  {crumb.label}
                </Link>
              ) : (
                <span
                  className={isLast ? 'text-charcoal-800 font-medium' : ''}
                  aria-current={isLast ? 'page' : undefined}
                >
                  {crumb.label}
                </span>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
