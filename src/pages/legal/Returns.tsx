import Breadcrumbs from '@/components/ui/Breadcrumbs'
import { useSiteConfig } from '@/lib/config'

export default function Returns() {
  const { data: config } = useSiteConfig()

  return (
    <main>
      <div className="bg-cream border-b border-sand py-10">
        <div className="page-container">
          <Breadcrumbs crumbs={[{ label: 'Home', to: '/' }, { label: 'Returns & Exchanges' }]} className="mb-3" />
          <h1 className="font-serif text-display-sm text-charcoal-900">Returns & Exchanges</h1>
        </div>
      </div>

      <div className="page-container py-12">
        <div className="max-w-3xl prose-fashion space-y-8 text-sm leading-relaxed">
          {config?.return_policy ? (
            <div className="p-5 bg-ivory-100 rounded-xl border border-sand">
              <p className="text-charcoal-700">{config.return_policy}</p>
            </div>
          ) : (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-xs">
              [OWNER NOTE: Return policy not yet configured. Add it in the Admin dashboard under
              Settings → Store Config → return_policy.]
            </div>
          )}

          <section>
            <h2 className="font-serif text-xl font-medium text-charcoal-900 mb-3">How to Initiate a Return</h2>
            <ol className="list-decimal list-inside space-y-2 ml-2 text-charcoal-600">
              <li>Contact us via WhatsApp or phone within the return window</li>
              <li>Share your order number and reason for return</li>
              <li>We will confirm eligibility and provide return instructions</li>
              <li>Return the item in original packaging, unused</li>
              <li>Refund or exchange will be processed after we receive and inspect the item</li>
            </ol>
          </section>

          <section>
            <h2 className="font-serif text-xl font-medium text-charcoal-900 mb-3">
              Items Not Eligible for Return
            </h2>
            <ul className="list-disc list-inside space-y-1 ml-2 text-charcoal-600">
              <li>Items worn, washed, or altered</li>
              <li>Items without original tags or packaging</li>
              <li>Custom-stitched or tailored items</li>
              <li className="italic text-charcoal-400">[OWNER: add any other exceptions]</li>
            </ul>
          </section>

          <section>
            <h2 className="font-serif text-xl font-medium text-charcoal-900 mb-3">Refunds</h2>
            <p>
              Refunds are processed via the original payment method.{' '}
              <span className="italic text-charcoal-400">
                [OWNER: specify refund timeline, e.g. "within 5–7 business days".]
              </span>
            </p>
          </section>
        </div>
      </div>
    </main>
  )
}
