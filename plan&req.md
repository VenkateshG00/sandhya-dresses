Prompt:

MASTER PROJECT PROMPT — Sandhya DRESSES
You are a senior full-stack software engineer, premium fashion e-commerce UI/UX designer, security engineer, QA engineer, and Cloudflare deployment specialist.
Your task is to design, develop, test, and prepare a complete, professional, production-ready website for a real fashion boutique called Sandhya Dresses.
This is a real client project. Treat quality, usability, business credibility, security, mobile responsiveness, performance, and maintainability as essential requirements.
Do not create just a landing page or a visual prototype. Build a complete, cohesive, functional application.
1. Business information and research
Business name: Sandhya Dresses
Google Maps listing: https://maps.app.goo.gl/dMNkKumTVDBtwT3z8
Business location: Use the linked Google Maps listing to identify the correct shop, address, category, and any publicly available business information.
Before implementation:
1. Inspect the existing repository and identify its framework, dependencies, conventions, and existing code.
2. Research the Google Maps listing and any available official business profiles, photographs, contact information, opening hours, and social media accounts.
3. Identify which business details are verified and which are unknown.
4. Create a concise project plan and implementation checklist.
5. Select an architecture appropriate for a boutique website that can grow into a full online store.
6. Start implementation after the initial assessment. Do not stop at a proposal.
Important data integrity rules:
* Never invent the business address, phone number, WhatsApp number, email, opening hours, social media accounts, testimonials, customer reviews, or business history.
* Use verified information where available.
* Put unverified business information in a centralized configuration file and clearly mark it for the owner to confirm.
* Never present sample products, prices, discounts, stock levels, or reviews as verified real business data.
* If actual product photographs are unavailable, use appropriate licensed or locally created placeholder assets and make replacing them straightforward.
* Do not use copyrighted photographs without permission.
* Keep the original Google Maps listing linked from the website.
2. Product vision
Create a beautiful, modern, premium-looking fashion boutique website for Sandhya Dresses.
The website should communicate elegance, trust, quality, and an excellent shopping experience.
Design inspiration:
* Contemporary Indian fashion boutiques
* Premium ethnic wear and women's fashion brands
* Editorial fashion photography
* Minimal luxury retail websites
* Clean layouts, generous whitespace, elegant typography, and refined micro-interactions
Avoid:
* Generic AI-generated website layouts
* Excessive gradients and glassmorphism
* Overloaded layouts
* Unnecessary animations
* Huge rounded cards everywhere
* Fake statistics, fake reviews, and fake scarcity
* Emoji used as product photography or core interface icons
* Buttons that do nothing
* Placeholder links in production
Proposed visual direction:
* Warm ivory and soft cream backgrounds
* Deep burgundy or wine accents
* Charcoal typography
* Restrained champagne or gold accents
* High-quality editorial imagery
* Elegant serif headings paired with a readable sans-serif body font
Use this direction as a starting point, refining it according to the actual business and available product categories.
The finished design must look deliberately art-directed rather than assembled from a generic template.
3. Technical architecture
Use a maintainable, modern TypeScript-based architecture.
Preferred stack:
* React
* Vite
* TypeScript with strict type checking
* Tailwind CSS
* Accessible component primitives where appropriate
* React Router if client-side routing is required
* Lucide icons
* Zod for input and environment validation where appropriate
* Vitest and React Testing Library for unit and component tests
* Playwright for end-to-end testing where practical
Deployment target: Cloudflare Workers with Static Assets, using the Cloudflare Vite integration when compatible with the chosen stack.
Use Cloudflare Workers for server-side functionality and APIs if the final scope requires them. Use Cloudflare D1 for relational business data when needed, R2 for uploaded product images when needed, and appropriate Cloudflare bindings for other requirements.
Do not introduce services or databases without a real need.
Architecture decision:
* If the final scope is a product catalog with WhatsApp enquiries and no persistent backend, prefer a lightweight static-first application.
* If the final scope includes an admin dashboard, persistent inventory, order management, authentication, or server-side APIs, implement the required full-stack architecture.
* Explain the architecture choice briefly in the project documentation.
* Do not build a fake backend or simulate persistent functionality without clearly labeling it as a demo.
Use current, official Cloudflare documentation to verify framework compatibility, configuration, deployment commands, and binding setup.
Do not blindly follow outdated tutorials or deprecated deployment patterns.
4. Required website pages
Implement a complete, responsive website with appropriate routing.
A. Home page
Include:
* Professional announcement bar, if useful
* Responsive header and navigation
* Brand identity and logo treatment
* Fashion-focused hero section with a strong headline and call to action
* Featured product categories
* New arrivals or featured collections
* Curated product grid
* Brand introduction section
* Why shop with Sandhya Dresses
* Real store photographs or a suitable store/location section where assets are available
* Customer testimonials only when genuine, authorized testimonials are available
* Instagram or social gallery only when a real account and usable content are verified
* Store location and contact information
* Newsletter signup only if a working delivery mechanism is configured
* Professional footer with working links
The home page should immediately tell visitors what the boutique offers and how to browse products or contact the store.
B. Shop / collection page
Include:
* Responsive product grid
* Product cards with images, names, prices when verified, and clear calls to action
* Search
* Category filters
* Price filtering when prices exist
* Sort by price, newest, and popularity only when the required data is available
* Pagination or accessible load-more functionality
* Empty search results state
* Loading and error states where applicable
* Mobile-friendly filter controls
All filters and search functionality must actually work.
C. Product details page
Include:
* Product image gallery
* Product name and description
* Price and sale price only when configured
* Available sizes, colors, or variants where relevant
* Stock status when reliable inventory data exists
* Size guide where applicable
* Care instructions where available
* Quantity selector with sensible limits
* Related products
* Share product action
* Add-to-cart functionality if a cart is implemented
* WhatsApp product enquiry with the correct product details when a verified WhatsApp number exists
Do not imply that a product is available when availability is unknown.
D. About page
Include:
* Brand introduction
* Business story and values based on verified information
* Fashion and product philosophy
* Store photographs if available
* Clear navigation to the shop and contact page
Do not fabricate the owner's identity, founding year, achievements, or brand story.
E. Contact and store location page
Include:
* Verified contact information
* Click-to-call link when a verified phone number exists
* WhatsApp contact link when a verified WhatsApp number exists
* Email link when a verified email exists
* Embedded map or reliable Google Maps directions link
* Address and opening hours when verified
* Accessible contact form only if it has a working submission backend
* Client-side and server-side form validation where applicable
* Clear success and error messages
Never show a fake success message for a form that has not actually been submitted.
F. FAQ page
Provide useful, honest answers for relevant questions, such as:
* How to enquire about products
* How to confirm sizes and availability
* How to find the store
* Payment options, if confirmed
* Delivery and shipping, if confirmed
* Return and exchange policies, if confirmed
Clearly mark unconfirmed policies for owner review instead of inventing them.
G. Legal and utility pages
Implement the pages relevant to the final business model:
* Privacy policy
* Terms and conditions
* Shipping policy if shipping is offered
* Return and exchange policy if applicable
* Custom 404 page
Ensure legal text matches the actual functionality and business practices. Flag content that requires the client's legal or business approval.
5. E-commerce functionality
First determine whether Sandhya Dresses wants a catalog-and-enquiry website or a complete online store.
Implement the appropriate scope without inventing payment or fulfillment capabilities.
Catalog and enquiry mode
At minimum:
* Browse products
* Search and filter products
* View product details
* Select available variants
* Generate a product-specific WhatsApp enquiry
* Open Google Maps directions
* Call or email the business where verified
* Share product links
* Use a mobile-friendly navigation and contact experience
WhatsApp messages must include the product name, product URL, selected variant, and quantity when applicable.
Use the correct international phone-number format without a plus sign or spaces in the wa.me URL. Validate that a real number has been configured before enabling the link.
Full online store mode, if required
Implement the additional functionality:
* Shopping cart with quantity updates and removal
* Persistent cart where appropriate
* Cart subtotal and transparent pricing
* Checkout form
* Server-side validation of prices, variants, and quantities
* Order creation and unique order identifiers
* Order confirmation
* Inventory updates with appropriate concurrency protection
* Payment integration through a supported payment provider if the client requires online payments
* Verified payment status through server-side provider verification or signed webhooks
* Order management
* Shipping and tax calculations based on the client's actual policies and operating region
Never collect or store raw payment card details.
Never mark an order as paid merely because the browser says payment succeeded.
Do not implement payment processing until the client supplies the necessary merchant account and credentials.
If credentials are unavailable, build the integration boundary and document the exact configuration needed. Clearly label the payment flow as unconfigured.
6. Admin dashboard, if required
If the client needs to maintain products and orders independently, implement a secure admin dashboard.
Features:
* Protected admin login
* Product CRUD operations
* Product image management
* Category management
* Price and variant management
* Inventory management where appropriate
* Order listing and detail views
* Order status management
* Search, filtering, and pagination
* Form validation
* Confirmation dialogs for destructive actions
* Clear loading, error, and success states
Security requirements:
* Never hardcode production credentials.
* Never expose secrets in client-side environment variables or browser bundles.
* Never use a frontend-only password check to protect admin routes.
* Enforce authentication and authorization on the server for every privileged operation.
* Use secure session handling, appropriate cookie settings, CSRF protection where applicable, and rate limiting.
* Validate and authorize every product, inventory, and order mutation.
* Prevent unauthorized image uploads and restrict file types, sizes, and content appropriately.
* Provide an initial-admin setup procedure that does not rely on a public registration endpoint.
* Do not expose customer data through public APIs.
Do not add an admin system just to make the project look more complete. Build it only if the agreed scope requires it.
7. Product data and content architecture
Create a clean, reusable data model.
Products should support the fields relevant to the actual store:
* Unique ID or slug
* Product name
* Description
* Category
* Image gallery
* Price and optional sale price
* Available sizes and colors
* SKU where needed
* Publication status
* Inventory information if inventory is tracked
* Creation and update timestamps
Use a centralized data layer so products are not duplicated across page components.
For a static catalog, use typed local data files that can be updated easily.
For a dynamic catalog, use the selected database and validated server-side data access.
Use realistic sample records for development, clearly identified as demo content. Do not present them as the boutique's real inventory.
Create reusable components such as:
* Header
* Mobile navigation
* Footer
* ProductCard
* ProductGrid
* ProductGallery
* SearchBar
* CategoryFilter
* PriceFilter
* Breadcrumbs
* WhatsAppEnquiryButton
* ContactSection
* NewsletterForm if configured
* LoadingState
* EmptyState
* ErrorState
* ConfirmationDialog where needed
Avoid giant components and unnecessary abstractions.
8. Responsive design and user experience
Design and test the experience for:
* Small mobile devices
* Typical Android and iPhone screen sizes
* Tablets
* Laptops
* Large desktop displays
Requirements:
* Mobile-first layouts
* No horizontal overflow
* Touch-friendly controls
* Readable typography
* Proper image aspect ratios
* Stable layouts while images load
* Responsive navigation
* Accessible focus indicators
* Clear form validation
* Useful empty and error states
* Consistent spacing and visual hierarchy
* Reduced-motion support
* No obstructive popups
* No unnecessary animation libraries
The mobile shopping and contact experience is especially important.
Use high-quality, optimized WebP or AVIF imagery where supported, with appropriate fallbacks and responsive image sizes.
Never stretch product images or let them dominate the page at the expense of usability.
9. Accessibility
Target WCAG 2.2 AA where practical.
Implement:
* Semantic HTML
* Logical heading hierarchy
* Keyboard navigation
* Visible focus states
* Proper form labels
* Accessible dialogs
* Meaningful alternative text
* Sufficient color contrast
* Accessible names for icon-only controls
* Correct status announcements for dynamic interactions
* Reduced-motion support
Do not use color alone to communicate errors, availability, or selection state.
10. SEO and social sharing
Implement:
* Page-specific title and meta description
* Canonical URLs where the production domain is known
* Open Graph metadata
* Social sharing metadata
* XML sitemap
* robots.txt
* Clean URLs
* Product and business structured data only when supported by verified facts
* Breadcrumb structured data where appropriate
* Correct heading structure
* Meaningful image alt text
* Internal links
* Custom 404 handling
Use accurate business details in local SEO metadata. Do not fabricate ratings, prices, opening hours, product availability, or review counts.
Ensure the site can be indexed correctly after production deployment.
11. Security and privacy
Apply production-quality security practices.
Requirements:
* Strict TypeScript and input validation
* Server-side authorization for privileged operations
* Safe handling of user-generated content
* Parameterized database queries
* Appropriate HTTP security headers
* Content Security Policy appropriate to actual assets and integrations
* Rate limiting for sensitive endpoints
* Spam prevention for public forms
* Secrets stored in Cloudflare secrets or equivalent secure configuration
* No committed API keys or credentials
* No sensitive information in logs
* Minimal collection of personal data
* Appropriate data retention and deletion procedures for stored customer information
* Privacy policy consistent with the real implementation
Avoid unsafe HTML injection and unsafe URL handling.
Do not trust browser-submitted prices, roles, payment states, or inventory values.
If no backend exists, do not pretend that server-side validation, authentication, or rate limiting exists.
12. Performance
Optimize for real-world mobile networks.
Requirements:
* Minimize JavaScript and unnecessary dependencies
* Lazy-load below-the-fold imagery
* Prioritize the main hero image appropriately
* Prevent layout shifts
* Use efficient product image sizes
* Split code where useful
* Avoid render-blocking resources where practical
* Cache static assets effectively
* Keep third-party scripts to a minimum
* Avoid unnecessary client-side rendering for content that can be rendered statically
Aim for Lighthouse scores of 90+ in Performance, Accessibility, Best Practices, and SEO where practical. Treat these as targets to verify, not guaranteed results.
13. Analytics and integrations
Make optional integrations configurable.
Potential integrations:
* Privacy-conscious analytics
* Google Search Console
* WhatsApp
* Google Maps
* Newsletter service
* Payment provider
* Transactional email provider
Do not add analytics, tracking, newsletter subscriptions, or third-party scripts without an actual need and appropriate configuration.
Do not fabricate conversion metrics or analytics events.
Document any account setup, DNS configuration, environment variables, API keys, or client approvals that remain necessary.
14. Testing and quality assurance
Do not stop when the website looks correct.
Run the relevant checks:
* Install dependencies
* TypeScript type checking
* Linting
* Production build
* Unit tests
* Component tests
* End-to-end tests where practical
* Route testing
* Form validation testing
* Search and filter testing
* Cart tests if a cart exists
* Authentication and authorization tests if an admin exists
* API validation and error handling tests
* Mobile viewport checks
* Accessibility checks
* Broken-link checks
* Image-loading checks
Test important failure cases, not just successful interactions.
Verify that:
* Navigation links work
* Product links work
* Filters produce correct results
* Quantities cannot exceed configured limits
* Invalid form submissions are rejected
* Contact forms do not report false success
* Unavailable integrations are clearly handled
* Unknown routes show a proper 404 page
* No secrets appear in frontend bundles
* The production build completes successfully
Fix issues found during testing. Do not claim a test passed unless you actually ran it and observed the result.
If a browser-testing tool is unavailable, use the best available automated tests and explain what still requires manual verification.
15. Cloudflare deployment
Prepare the application for Cloudflare deployment.
Use the current supported Workers Static Assets approach unless repository constraints or framework requirements justify another choice.
Provide:
* Correct Cloudflare configuration
* Compatible build and deployment commands
* Local development setup
* Production environment configuration
* Required database migrations if using D1
* Required bucket configuration if using R2
* Environment variable documentation
* Secure secret setup instructions
* Preview deployment guidance
* Custom domain setup instructions
* DNS and HTTPS verification steps
* Production smoke-test checklist
* Rollback instructions
Verify the current official documentation before finalizing the configuration: https://developers.cloudflare.com/workers/static-assets/ https://developers.cloudflare.com/workers/static-assets/get-started/
Use Wrangler commands compatible with the selected configuration.
Do not deploy to production, modify the client's DNS, create paid resources, or run destructive production operations without explicit authorization.
Do not claim the website is live until deployment has actually succeeded.
16. Required project files
Maintain clear documentation and a professional repository structure.
Create or update:
* README.md
* CLAUDE.md with project conventions and instructions for future Claude Code sessions
* .env.example with placeholder values only
* .gitignore
* Package scripts for development, build, testing, linting, and type checking
* Cloudflare configuration
* Database schema and migrations if required
* A client configuration file for business details
* A product data source or database access layer
* Testing configuration
* Deployment documentation
* A launch checklist
Keep credentials out of documentation and source control.
Document how to add, update, and remove products.
17. Execution strategy
Work in phases, but continue implementation instead of stopping after planning.
Phase 1 — Inspect and plan
* Inspect the repository and existing files.
* Research the business and verified brand information.
* Identify missing client inputs.
* Establish architecture and design direction.
* Create an implementation checklist.
Phase 2 — Foundation
* Set up or improve the project structure.
* Configure TypeScript, styling, routing, and tooling.
* Establish design tokens, typography, and reusable components.
* Set up the correct Cloudflare-compatible build.
Phase 3 — Core experience
* Build the header, navigation, footer, home page, product catalog, product details, contact page, about page, FAQ, and applicable legal pages.
* Populate the site with verified information and clearly labeled development content.
* Ensure mobile and desktop layouts are polished.
Phase 4 — Functional features
* Implement search, filtering, sorting, product variants, WhatsApp enquiries, and store directions.
* Implement a cart, checkout, database, admin dashboard, or payment integration only when required by the chosen scope.
* Ensure all actions work and error states are handled.
Phase 5 — Quality and security
* Run type checking, linting, tests, and the production build.
* Test responsiveness, accessibility, routes, forms, and business-critical workflows.
* Fix identified problems.
* Review security, privacy, and performance.
Phase 6 — Deployment readiness
* Validate Cloudflare configuration.
* Document setup, environment variables, secrets, migrations, and deployment.
* Provide a production smoke-test checklist.
* Identify any client-owned tasks that prevent launch.
After each phase, summarize what was completed, list remaining work, and update the project checklist.
Do not ask for approval after every small task. Make sensible engineering decisions and continue unless an actual blocker, irreversible operation, or important business decision requires my input.
If essential information is missing, use safe configuration defaults and continue developing the rest of the site. Clearly document anything that must be confirmed before launch.
18. Development rules
* Work in the current repository; do not overwrite existing work without inspection.
* Prefer small, coherent, maintainable modules.
* Avoid unnecessary dependencies.
* Use strict TypeScript.
* Follow existing conventions unless there is a clear reason to improve them.
* Never leave broken imports, obvious placeholder content, dead buttons, or knowingly broken routes.
* Do not suppress type errors merely to make the build pass.
* Do not hide errors or fabricate successful operations.
* Do not invent business facts.
* Do not hardcode secrets.
* Keep the application usable without optional integrations.
* Verify package and framework compatibility before adding dependencies.
* Use actual command output to assess build and test status.
* Update documentation as implementation changes.
* If a command fails, investigate and fix the underlying cause where possible.
If the repository is empty, initialize the project using the architecture selected above. If a project already exists, adapt it instead of rebuilding unnecessarily.
19. Definition of done
The project is ready for client review when:
* The required pages are implemented.
* The design is polished and responsive.
* Product browsing and the agreed customer workflows function correctly.
* Business details are accurate or clearly marked for confirmation.
* There are no knowingly broken buttons, links, or forms.
* Accessibility and SEO fundamentals are implemented.
* Type checking, linting, tests, and production build have been run.
* Identified critical issues have been fixed.
* Cloudflare configuration and deployment instructions are complete.
* Secrets and environment variables are handled correctly.
* The README, CLAUDE.md, and client launch checklist are updated.
* Remaining blockers and unverified client information are documented honestly.
20. Start now
Begin by inspecting the repository and researching the business listing.
Then create the project plan and checklist, select the appropriate architecture, and immediately begin implementation.
Do not return only a description of what you would build. Actually build the application, run the available checks, fix problems, and prepare it for deployment.
At the end, provide a concise report covering:
1. What was implemented.
2. The final architecture and technology choices.
3. The main routes and working features.
4. Tests and build commands actually run, with their results.
5. How to run the project locally.
6. How to configure Cloudflare and deploy.
7. Missing business information or credentials that the client must supply.
8. Any remaining issues that prevent production launch.
The goal is a genuinely professional website that I can confidently present to Sandhya Dresses as a real client deliverable.

How to get the best results from Claude Code
1. Start with a clean project directory
If you're starting from scratch, create a folder and launch Claude Code inside it:
bash
mkdir Sandhya-dresses
cd Sandhya-dresses
claude
Paste the master prompt into Claude Code. If you already have a repository, use that directory instead.
2. Give Claude Code access to the right business assets
The Google Maps link is a starting point, not a guarantee that Claude can retrieve every detail or image. Provide these assets directly if possible:
* The shop logo. 
* Actual dress and product photos. 
* The correct WhatsApp and phone numbers. 
* Confirmed address and opening hours. 
* Product categories and prices. 
* The owner's preferred website language. 
* Whether customers should order online or enquire through WhatsApp. 
My suggestion: launch a beautiful product catalog with WhatsApp enquiries first if the client doesn't already have an online ordering process. Add full checkout, payments, inventory, and admin functionality when the business is ready to support them.
3. Use a follow-up prompt to improve the design
After Claude builds the first version, use this prompt rather than accepting the first result.
Writing




Act as a strict senior design reviewer evaluating the current Sandhya Dresses website against premium fashion e-commerce standards.
Inspect the actual implementation and improve it directly.
Focus on:
* Stronger visual hierarchy and art direction
* More premium typography and spacing
* Better fashion photography presentation
* More cohesive colors and component styling
* A polished, responsive mobile navigation
* Better product cards and product detail layouts
* Clearer calls to action
* More refined hover, focus, and loading states
* Consistent responsive behavior
* Accessibility and performance
Compare the home page, collection page, product details page, and contact page as one cohesive brand experience.
Do not simply describe changes or rewrite the entire application unnecessarily. Inspect the existing code, identify the weakest areas, implement meaningful improvements, and run the appropriate checks afterward.
Do not add fake testimonials, invented business facts, meaningless animations, or decorative features that harm usability.
4. Deploy to Cloudflare Workers
Cloudflare currently recommends Workers for new projects, including applications that combine static assets and backend APIs. Static asset delivery is integrated with the Worker deployment, and you can add server-side functionality when required. 
￼
Cloudflare Workers docs
+2


Recommended: Cloudflare Workers
Best for a site that may grow to include product management, APIs, orders, authentication, or a database.
Workers Static Assets documentation 


Alternative: Cloudflare Pages
Still suitable for a straightforward static catalog or a site using Pages Functions. It remains available, although Cloudflare recommends Workers for new projects.
Cloudflare Pages documentation 
Once Claude has finished implementation, review the configuration and run the commands appropriate to the actual project. For a typical Vite application, the local workflow will look something like this:
bash
npm install
npm run dev
npm run build
Then deploy using the Cloudflare configuration Claude generated. For a Workers project using Wrangler, the deployment command is typically:
bash
npx wrangler deploy
The exact configuration and any required database migrations depend on the architecture Claude implements. Follow the project's generated README and verify the deployed site before connecting the client's production domain. 
￼
Cloudflare Workers docs
+1

One important decision before you build
Is Sandhya Dresses intended to be:
* A. A professional boutique website with a product catalog, store information, and WhatsApp enquiries. 
* B. A complete online shopping website with cart, checkout, payments, inventory, and an admin dashboard. 

