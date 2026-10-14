import { Link } from 'react-router-dom'
import { MapPin, ArrowRight } from 'lucide-react'
import Breadcrumbs from '@/components/ui/Breadcrumbs'

export default function About() {
  return (
    <main>
      <div className="bg-cream border-b border-sand py-10">
        <div className="page-container">
          <Breadcrumbs crumbs={[{ label: 'Home', to: '/' }, { label: 'About' }]} className="mb-3" />
          <h1 className="font-serif text-display-sm text-charcoal-900">About Sandhya Dresses</h1>
        </div>
      </div>

      <div className="page-container py-12 lg:py-16">
        <div className="max-w-3xl">
          {/* Story */}
          <section aria-labelledby="story-heading" className="mb-12">
            <h2 id="story-heading" className="font-serif text-2xl text-charcoal-900 mb-4">
              Our Story
            </h2>
            <div className="prose-fashion space-y-4">
              <p>
                Sandhya Dresses is a fashion boutique based in Challur, Karimnagar District, Telangana.
                Located near Union Bank on Elabaka Road, we are a trusted local destination for
                ethnic wear in the Veenavanka Mandal area.
              </p>
              <p>
                We carry a curated selection of sarees, salwar kameez, lehengas, kurtis, and dress
                materials — for daily wear, festivals, weddings, and every occasion in between.
              </p>
              <p className="text-xs italic text-charcoal-400">
                [OWNER NOTE: Please add your business story, founding year, and personal message here
                before launching.]
              </p>
            </div>
          </section>

          {/* Philosophy */}
          <section aria-labelledby="philosophy-heading" className="mb-12">
            <h2 id="philosophy-heading" className="font-serif text-2xl text-charcoal-900 mb-4">
              What We Offer
            </h2>
            <ul className="grid sm:grid-cols-2 gap-4">
              {[
                { title: 'Sarees', desc: 'Silk, cotton, georgette, and designer sarees for every taste and budget.' },
                { title: 'Salwar Kameez', desc: 'Anarkali, straight cuts, palazzo sets, and more.' },
                { title: 'Lehengas', desc: 'Bridal and party wear lehengas with matching dupattas.' },
                { title: 'Kurtis', desc: 'Casual, festive, and office-wear kurtis in a range of styles.' },
                { title: 'Dress Materials', desc: 'Quality fabrics for custom stitching as per your measurements.' },
              ].map((item) => (
                <li
                  key={item.title}
                  className="p-5 bg-ivory-100 rounded-xl border border-sand"
                >
                  <h3 className="font-medium text-charcoal-900 mb-1">{item.title}</h3>
                  <p className="text-sm text-charcoal-500">{item.desc}</p>
                </li>
              ))}
            </ul>
          </section>

          {/* Location */}
          <section aria-labelledby="location-heading" className="mb-12">
            <h2 id="location-heading" className="font-serif text-2xl text-charcoal-900 mb-4">
              Find Us
            </h2>
            <div className="flex items-start gap-3 p-5 bg-ivory-100 rounded-xl border border-sand">
              <MapPin className="w-5 h-5 mt-0.5 text-burgundy-500 shrink-0" aria-hidden />
              <div>
                <p className="font-medium text-charcoal-800 mb-1">Sandhya Dresses</p>
                <address className="not-italic text-sm text-charcoal-600 leading-relaxed">
                  Near Union Bank, Elabaka Road,<br />
                  Challur, Veenavanka Mandal,<br />
                  Karimnagar District, Telangana — 505505
                </address>
                <a
                  href="https://maps.app.goo.gl/dMNkKumTVDBtwT3z8"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm text-burgundy-600 hover:text-burgundy-700 font-medium mt-3 transition-colors"
                >
                  Get directions on Google Maps
                  <ArrowRight className="w-3.5 h-3.5" aria-hidden />
                </a>
              </div>
            </div>
          </section>

          {/* CTAs */}
          <div className="flex flex-wrap gap-4">
            <Link to="/shop" className="btn-primary">
              Browse Collection
            </Link>
            <Link to="/contact" className="btn-secondary">
              Contact Us
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
