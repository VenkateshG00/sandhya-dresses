import Breadcrumbs from '@/components/ui/Breadcrumbs'

export default function Privacy() {
  return (
    <main>
      <div className="bg-cream border-b border-sand py-10">
        <div className="page-container">
          <Breadcrumbs crumbs={[{ label: 'Home', to: '/' }, { label: 'Privacy Policy' }]} className="mb-3" />
          <h1 className="font-serif text-display-sm text-charcoal-900">Privacy Policy</h1>
          <p className="text-charcoal-500 mt-1 text-sm">Last updated: October 2024</p>
        </div>
      </div>

      <div className="page-container py-12">
        <div className="max-w-3xl prose-fashion space-y-8 text-sm leading-relaxed">
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-xs">
            [OWNER NOTE: This is a draft privacy policy. Please review with a legal adviser before
            launch. Update the contact email, phone, and business registration details where indicated.]
          </div>

          <section>
            <h2 className="font-serif text-xl font-medium text-charcoal-900 mb-3">1. Who We Are</h2>
            <p>
              Sandhya Dresses is a retail clothing boutique located at Near Union Bank, Elabaka Road,
              Challur, Veenavanka Mandal, Karimnagar District, Telangana, 505505, India. This policy
              explains how we collect, use, and protect your personal information when you use our
              website or place an order.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl font-medium text-charcoal-900 mb-3">2. Information We Collect</h2>
            <p>When you place an order, we collect:</p>
            <ul className="list-disc list-inside space-y-1 mt-2 ml-4 text-charcoal-600">
              <li>Your name</li>
              <li>Mobile number</li>
              <li>Email address (optional)</li>
              <li>Delivery address</li>
              <li>Order details (products, quantities, size preferences)</li>
              <li>Payment status (we do not store card numbers)</li>
            </ul>
          </section>

          <section>
            <h2 className="font-serif text-xl font-medium text-charcoal-900 mb-3">3. How We Use Your Information</h2>
            <p>We use your information solely to:</p>
            <ul className="list-disc list-inside space-y-1 mt-2 ml-4 text-charcoal-600">
              <li>Process and fulfill your order</li>
              <li>Contact you about your order status</li>
              <li>Respond to your enquiries</li>
              <li>Improve our service</li>
            </ul>
            <p className="mt-3">
              We do not sell, rent, or share your personal information with third parties for
              marketing purposes.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl font-medium text-charcoal-900 mb-3">4. Payments</h2>
            <p>
              Online payments are processed by Razorpay, a PCI-DSS compliant payment gateway. We
              never see or store your card details. Razorpay's privacy policy applies to payment
              processing.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl font-medium text-charcoal-900 mb-3">5. Data Retention</h2>
            <p>
              We retain order data for a period necessary to fulfill orders, handle returns, and meet
              any applicable legal obligations. You may request deletion of your personal data by
              contacting us.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl font-medium text-charcoal-900 mb-3">6. Your Rights</h2>
            <p>You have the right to:</p>
            <ul className="list-disc list-inside space-y-1 mt-2 ml-4 text-charcoal-600">
              <li>Request access to the personal data we hold about you</li>
              <li>Request correction of inaccurate data</li>
              <li>Request deletion of your data</li>
              <li>Withdraw consent at any time</li>
            </ul>
          </section>

          <section>
            <h2 className="font-serif text-xl font-medium text-charcoal-900 mb-3">7. Contact</h2>
            <p>
              For privacy-related questions or requests, contact us at:{' '}
              <span className="italic text-charcoal-400">[OWNER: insert email or phone]</span>
            </p>
          </section>
        </div>
      </div>
    </main>
  )
}
