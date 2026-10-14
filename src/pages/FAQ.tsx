import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import Breadcrumbs from '@/components/ui/Breadcrumbs'
import { useSiteConfig } from '@/lib/config'

interface FAQItem {
  q: string
  a: string | React.ReactNode
  ownerReview?: boolean
}

function FAQAccordion({ items }: { items: FAQItem[] }) {
  const [open, setOpen] = useState<number | null>(null)

  return (
    <div className="space-y-2">
      {items.map((item, i) => (
        <div key={i} className="border border-sand rounded-xl overflow-hidden">
          <button
            type="button"
            aria-expanded={open === i}
            aria-controls={`faq-${i}`}
            onClick={() => setOpen(open === i ? null : i)}
            className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left hover:bg-ivory-100 transition-colors"
          >
            <span className="font-medium text-charcoal-800 text-sm leading-snug">
              {item.q}
            </span>
            <ChevronDown
              className={`w-5 h-5 text-charcoal-400 shrink-0 transition-transform duration-200 ${
                open === i ? 'rotate-180' : ''
              }`}
              aria-hidden
            />
          </button>
          {open === i && (
            <div
              id={`faq-${i}`}
              className="px-5 pb-5 text-sm text-charcoal-600 leading-relaxed border-t border-sand"
            >
              <div className="pt-4">{item.a}</div>
              {item.ownerReview && (
                <p className="mt-3 text-xs italic text-charcoal-400">
                  [OWNER NOTE: Please review and update this answer before launch.]
                </p>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

export default function FAQ() {
  const { data: config } = useSiteConfig()
  const waNumber = config?.store_whatsapp?.replace(/\D/g, '')
  const waLink = waNumber ? `https://wa.me/91${waNumber}` : null

  const enquiryFAQs: FAQItem[] = [
    {
      q: 'How do I enquire about a product?',
      a: waLink ? (
        <>
          The easiest way is to{' '}
          <a href={waLink} target="_blank" rel="noopener noreferrer" className="text-burgundy-600 underline">
            message us on WhatsApp
          </a>
          . On any product page, tap <strong>Enquire on WhatsApp</strong> — it pre-fills your
          message with the product name and size so we can respond quickly.
        </>
      ) : (
        'Use the "Enquire on WhatsApp" button on any product page. Once our store WhatsApp number is configured, this button will open a pre-filled message for you.'
      ),
    },
    {
      q: 'How do I confirm product availability before visiting the store?',
      a: 'Send us a WhatsApp message with the product name and your preferred size and color. We will check availability and confirm before you make the trip.',
    },
    {
      q: 'Can I order online and have it delivered to my home?',
      a: 'Yes — you can place an order through our website and choose from Cash on Delivery, UPI, or online payment. Shipping details and charges will be shown at checkout.',
      ownerReview: true,
    },
  ]

  const storeFAQs: FAQItem[] = [
    {
      q: 'Where is Sandhya Dresses located?',
      a: (
        <>
          We are located at{' '}
          <a
            href="https://maps.app.goo.gl/dMNkKumTVDBtwT3z8"
            target="_blank"
            rel="noopener noreferrer"
            className="text-burgundy-600 underline"
          >
            Near Union Bank, Elabaka Road, Challur, Veenavanka Mandal, Karimnagar District,
            Telangana — 505505
          </a>
          . Click the link for turn-by-turn Google Maps directions.
        </>
      ),
    },
    {
      q: 'What are your store hours?',
      a: config?.store_hours
        ? config.store_hours
        : 'Store hours are not yet configured. Please call or WhatsApp us to confirm timing before visiting.',
    },
  ]

  const paymentFAQs: FAQItem[] = [
    {
      q: 'What payment methods do you accept at the store?',
      a: 'We accept cash and UPI at the store. For online orders, Cash on Delivery, UPI, and Razorpay (cards, net banking, wallets) are available.',
      ownerReview: true,
    },
    {
      q: 'Is online payment secure?',
      a: 'Yes. Online payments go through Razorpay, a PCI-DSS certified payment gateway. We never see or store your card details.',
    },
    {
      q: 'Can I pay on delivery (Cash on Delivery)?',
      a: config?.cod_enabled === 'true'
        ? 'Yes, Cash on Delivery is available. You pay in cash when your order arrives.'
        : 'Cash on Delivery may not be available in all areas. Check at checkout.',
    },
  ]

  const returnFAQs: FAQItem[] = [
    {
      q: 'What is your return policy?',
      a: config?.return_policy || 'Please contact us via WhatsApp for return queries.',
    },
    {
      q: 'How do I initiate a return or exchange?',
      a: waLink ? (
        <>
          Message us on{' '}
          <a href={waLink} target="_blank" rel="noopener noreferrer" className="text-burgundy-600 underline">
            WhatsApp
          </a>{' '}
          with your order number and reason for return. We will guide you through the process.
        </>
      ) : (
        'Contact us via WhatsApp or phone with your order number and reason for return.'
      ),
    },
    {
      q: 'Do you offer exchanges for different sizes?',
      a: 'We try our best to accommodate size exchanges when stock is available. Contact us within the return window and we will do our best.',
      ownerReview: true,
    },
  ]

  return (
    <main>
      <div className="bg-cream border-b border-sand py-10">
        <div className="page-container">
          <Breadcrumbs crumbs={[{ label: 'Home', to: '/' }, { label: 'FAQ' }]} className="mb-3" />
          <h1 className="font-serif text-display-sm text-charcoal-900">
            Frequently Asked Questions
          </h1>
        </div>
      </div>

      <div className="page-container py-12 lg:py-16">
        <div className="max-w-3xl space-y-12">
          {[
            { heading: 'Product Enquiries', items: enquiryFAQs },
            { heading: 'Store & Location', items: storeFAQs },
            { heading: 'Payments', items: paymentFAQs },
            { heading: 'Returns & Exchanges', items: returnFAQs },
          ].map((section) => (
            <section key={section.heading} aria-labelledby={`faq-${section.heading}`}>
              <h2
                id={`faq-${section.heading}`}
                className="font-serif text-xl text-charcoal-900 mb-5"
              >
                {section.heading}
              </h2>
              <FAQAccordion items={section.items} />
            </section>
          ))}

          <div className="p-5 bg-ivory-100 rounded-xl border border-sand text-sm">
            <p className="font-medium text-charcoal-800 mb-1">
              Didn't find your answer?
            </p>
            <p className="text-charcoal-600">
              {waLink ? (
                <>
                  Message us on{' '}
                  <a href={waLink} target="_blank" rel="noopener noreferrer" className="text-burgundy-600 underline font-medium">
                    WhatsApp
                  </a>{' '}
                  — we usually respond within a few hours during store hours.
                </>
              ) : (
                'Contact us via phone or visit our store on Elabaka Road, Challur.'
              )}
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}
