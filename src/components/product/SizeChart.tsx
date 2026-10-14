import { useState } from 'react'
import { Ruler, X } from 'lucide-react'

const SIZE_CHART = [
  { size: 'XS', bust_in: 32, bust_cm: 81, waist_in: 26, waist_cm: 66, hip_in: 35, hip_cm: 89 },
  { size: 'S',  bust_in: 34, bust_cm: 86, waist_in: 28, waist_cm: 71, hip_in: 37, hip_cm: 94 },
  { size: 'M',  bust_in: 36, bust_cm: 91, waist_in: 30, waist_cm: 76, hip_in: 39, hip_cm: 99 },
  { size: 'L',  bust_in: 38, bust_cm: 96, waist_in: 32, waist_cm: 81, hip_in: 41, hip_cm: 104 },
  { size: 'XL', bust_in: 40, bust_cm: 101, waist_in: 34, waist_cm: 86, hip_in: 43, hip_cm: 109 },
  { size: 'XXL',bust_in: 42, bust_cm: 107, waist_in: 36, waist_cm: 91, hip_in: 45, hip_cm: 114 },
  { size: 'XXXL', bust_in: 44, bust_cm: 112, waist_in: 38, waist_cm: 97, hip_in: 47, hip_cm: 119 },
]

type Unit = 'inches' | 'cm'

interface Props {
  availableSizes?: string[]
}

export default function SizeChart({ availableSizes }: Props) {
  const [open, setOpen] = useState(false)
  const [unit, setUnit] = useState<Unit>('cm')

  const rows = availableSizes?.length
    ? SIZE_CHART.filter((r) =>
        availableSizes.some((s) => s.toUpperCase() === r.size.toUpperCase()),
      )
    : SIZE_CHART

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 text-xs text-burgundy-600 hover:text-burgundy-700 font-medium underline-offset-2 hover:underline transition-colors"
      >
        <Ruler className="w-3.5 h-3.5" aria-hidden />
        Size guide
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-charcoal-900/50 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        >
          <div
            className="bg-white rounded-xl shadow-modal w-full max-w-xl max-h-[90vh] overflow-auto"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="size-chart-title"
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-sand">
              <h2 id="size-chart-title" className="font-serif text-lg font-medium text-charcoal-900">
                Size Guide — Indian Sizing
              </h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close size guide"
                className="p-1.5 rounded-full hover:bg-ivory-100 transition-colors"
              >
                <X className="w-5 h-5 text-charcoal-500" aria-hidden />
              </button>
            </div>

            <div className="px-5 py-4">
              {/* Unit toggle */}
              <div className="flex items-center gap-3 mb-4">
                <span className="text-xs text-charcoal-500 font-medium">Measurements in:</span>
                <div className="flex rounded-lg border border-sand overflow-hidden text-xs font-medium">
                  <button
                    type="button"
                    onClick={() => setUnit('cm')}
                    className={`px-3 py-1.5 transition-colors ${
                      unit === 'cm'
                        ? 'bg-burgundy-500 text-white'
                        : 'hover:bg-ivory-100 text-charcoal-600'
                    }`}
                  >
                    Centimetres
                  </button>
                  <button
                    type="button"
                    onClick={() => setUnit('inches')}
                    className={`px-3 py-1.5 transition-colors ${
                      unit === 'inches'
                        ? 'bg-burgundy-500 text-white'
                        : 'hover:bg-ivory-100 text-charcoal-600'
                    }`}
                  >
                    Inches
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto rounded-lg border border-sand">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-ivory-100 text-charcoal-600 text-xs uppercase tracking-wide">
                      <th className="px-4 py-2.5 text-left font-semibold">Size</th>
                      <th className="px-4 py-2.5 text-center font-semibold">
                        Bust {unit === 'cm' ? '(cm)' : '(in)'}
                      </th>
                      <th className="px-4 py-2.5 text-center font-semibold">
                        Waist {unit === 'cm' ? '(cm)' : '(in)'}
                      </th>
                      <th className="px-4 py-2.5 text-center font-semibold">
                        Hip {unit === 'cm' ? '(cm)' : '(in)'}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-sand">
                    {rows.map((row) => (
                      <tr key={row.size} className="hover:bg-ivory-50 transition-colors">
                        <td className="px-4 py-2.5 font-semibold text-charcoal-800">
                          {row.size}
                        </td>
                        <td className="px-4 py-2.5 text-center text-charcoal-600">
                          {unit === 'cm' ? row.bust_cm : row.bust_in}
                        </td>
                        <td className="px-4 py-2.5 text-center text-charcoal-600">
                          {unit === 'cm' ? row.waist_cm : row.waist_in}
                        </td>
                        <td className="px-4 py-2.5 text-center text-charcoal-600">
                          {unit === 'cm' ? row.hip_cm : row.hip_in}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <p className="mt-3 text-xs text-charcoal-400 leading-relaxed">
                Measurements are body measurements, not garment measurements. If you're between sizes, we recommend sizing up. For custom sizing or queries, contact us via WhatsApp.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
