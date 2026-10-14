import { useState } from 'react'

interface Props {
  minPrice: number | undefined
  maxPrice: number | undefined
  onChange: (min: number | undefined, max: number | undefined) => void
}

const PRESETS = [
  { label: 'All', min: undefined, max: undefined },
  { label: 'Under ₹500', min: undefined, max: 50000 },
  { label: '₹500–₹1,500', min: 50000, max: 150000 },
  { label: '₹1,500–₹5,000', min: 150000, max: 500000 },
  { label: '₹5,000+', min: 500000, max: undefined },
]

export default function PriceFilter({ minPrice, maxPrice, onChange }: Props) {
  const [activePreset, setActivePreset] = useState(0)

  function selectPreset(i: number) {
    setActivePreset(i)
    onChange(PRESETS[i].min, PRESETS[i].max)
  }

  return (
    <fieldset>
      <legend className="text-xs font-semibold text-charcoal-600 uppercase tracking-wider mb-3">
        Price Range
      </legend>
      <ul className="space-y-1">
        {PRESETS.map((preset, i) => (
          <li key={preset.label}>
            <button
              type="button"
              onClick={() => selectPreset(i)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                activePreset === i && (preset.min === minPrice && preset.max === maxPrice)
                  ? 'bg-burgundy-50 text-burgundy-700 font-medium'
                  : 'text-charcoal-600 hover:bg-ivory-200 hover:text-charcoal-800'
              }`}
              aria-pressed={activePreset === i}
            >
              {preset.label}
            </button>
          </li>
        ))}
      </ul>
    </fieldset>
  )
}
