import { RotateCcw } from 'lucide-react'
import { useSiteConfig } from '@/lib/config'

export default function ReturnPolicySnippet() {
  const { data: config } = useSiteConfig()
  const policy = config?.return_policy

  if (!policy) return null

  return (
    <div className="flex items-start gap-3 p-4 bg-ivory-100 rounded-lg border border-sand text-sm">
      <RotateCcw className="w-4 h-4 mt-0.5 shrink-0 text-burgundy-500" aria-hidden />
      <div>
        <p className="font-medium text-charcoal-800 mb-0.5">Return Policy</p>
        <p className="text-charcoal-600 leading-relaxed text-xs">{policy}</p>
      </div>
    </div>
  )
}
