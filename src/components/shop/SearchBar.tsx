import { useState, useEffect, useRef } from 'react'
import { Search, X } from 'lucide-react'
import { debounce } from '@/lib/utils'

interface Props {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export default function SearchBar({ value, onChange, placeholder = 'Search sarees, kurtis…' }: Props) {
  const [local, setLocal] = useState(value)
  const inputRef = useRef<HTMLInputElement>(null)

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedChange = debounce((v: unknown) => onChange(v as string), 350)

  useEffect(() => {
    setLocal(value)
  }, [value])

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setLocal(e.target.value)
    debouncedChange(e.target.value)
  }

  function clear() {
    setLocal('')
    onChange('')
    inputRef.current?.focus()
  }

  return (
    <div className="relative w-full">
      <Search
        className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal-400 pointer-events-none"
        aria-hidden
      />
      <input
        ref={inputRef}
        type="search"
        value={local}
        onChange={handleChange}
        placeholder={placeholder}
        aria-label="Search products"
        className="input-base pl-9 pr-8"
      />
      {local && (
        <button
          type="button"
          onClick={clear}
          aria-label="Clear search"
          className="absolute right-3 top-1/2 -translate-y-1/2 text-charcoal-400 hover:text-charcoal-600 transition-colors"
        >
          <X className="w-4 h-4" aria-hidden />
        </button>
      )}
    </div>
  )
}
