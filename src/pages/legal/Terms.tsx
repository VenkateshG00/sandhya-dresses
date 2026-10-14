import Breadcrumbs from '@/components/ui/Breadcrumbs'

export default function Terms() {
  return (
    <main>
      <div className="bg-cream border-b border-sand py-10">
        <div className="page-container">
          <Breadcrumbs crumbs={[{ label: 'Home', to: '/' }, { label: 'Terms & Conditions' }]} className="mb-3" />
          <h1 className="font-serif text-display-sm text-charcoal-900">Terms & Conditions</h1>
          <p className="text-charcoal-500 mt-1 text-sm">Last updated: October 2024</p>
        </div>
      </div>

      <div className="page-container py-12">
        <div className="max-w-3xl prose-fashion space-y-8 text-sm leading-relaxed">
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-xs">
            [OWNER NOTE: Draft terms for review. Please verify with a legal adviser before launch.]
          </div>

          <section>
            <h2 className="font-serif text-xl font-medium text-charcoal-900 mb-3">1. Acceptance of Terms</h2>
            <p>
              By using the Sandhya Dresses website, you agree to these terms. If you do not agree,
              please do not use the website.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl font-medium text-charcoal-900 mb-3">2. Products & Pricing</h2>
            <p>
              All products are subject to availability. Prices are in Indian Rupees (INR) and include
              applicable taxes. We reserve the right to change prices without prior notice. Product
              images are for illustration; actual products may vary slightly in color due to display
              settings.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl font-medium text-charcoal-900 mb-3">3. Orders</h2>
            <p>
              Placing an order constitutes an offer to purchase. We reserve the right to cancel orders
              for reasons including stock unavailability or pricing errors. You will be notified and
              refunded promptly if an order is cancelled.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl font-medium text-charcoal-900 mb-3">4. Payment</h2>
            <p>
              We accept Cash on Delivery, UPI, and online payments via Razorpay. Payments must be
              completed before dispatch (except Cash on Delivery). We never store card or bank details.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl font-medium text-charcoal-900 mb-3">5. Shipping</h2>
            <p className="italic text-charcoal-400">
              [OWNER: Insert your shipping timeline, areas covered, and charges here.]
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl font-medium text-charcoal-900 mb-3">6. Returns & Refunds</h2>
            <p>
              See our{' '}
              <a href="/returns" className="text-burgundy-600 underline">
                Returns Policy
              </a>{' '}
              for full details.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl font-medium text-charcoal-900 mb-3">7. Intellectual Property</h2>
            <p>
              All content on this website including text, images, and design belongs to Sandhya
              Dresses and may not be copied or reproduced without permission.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl font-medium text-charcoal-900 mb-3">8. Governing Law</h2>
            <p>
              These terms are governed by the laws of India. Disputes are subject to the jurisdiction
              of courts in Karimnagar District, Telangana.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl font-medium text-charcoal-900 mb-3">9. Contact</h2>
            <p>
              Questions about these terms:{' '}
              <span className="italic text-charcoal-400">[OWNER: insert contact details]</span>
            </p>
          </section>
        </div>
      </div>
    </main>
  )
}
