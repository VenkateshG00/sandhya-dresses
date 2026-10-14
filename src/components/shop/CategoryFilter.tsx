import { useQuery } from '@tanstack/react-query'
import { fetchCategories } from '@/lib/api'

interface Props {
  value: string
  onChange: (slug: string) => void
}

export default function CategoryFilter({ value, onChange }: Props) {
  const { data } = useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories,
    staleTime: 10 * 60 * 1000,
  })

  const categories = data ?? []

  return (
    <fieldset>
      <legend className="text-xs font-semibold text-charcoal-600 uppercase tracking-wider mb-3">
        Category
      </legend>
      <ul className="space-y-1">
        <li>
          <button
            type="button"
            onClick={() => onChange('')}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
              value === ''
                ? 'bg-burgundy-50 text-burgundy-700 font-medium'
                : 'text-charcoal-600 hover:bg-ivory-200 hover:text-charcoal-800'
            }`}
            aria-pressed={value === ''}
          >
            All Categories
          </button>
        </li>
        {categories.map((cat) => (
          <li key={cat.id}>
            <button
              type="button"
              onClick={() => onChange(cat.slug)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                value === cat.slug
                  ? 'bg-burgundy-50 text-burgundy-700 font-medium'
                  : 'text-charcoal-600 hover:bg-ivory-200 hover:text-charcoal-800'
              }`}
              aria-pressed={value === cat.slug}
            >
              {cat.name}
            </button>
          </li>
        ))}
      </ul>
    </fieldset>
  )
}
