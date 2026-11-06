// All user-facing copy lives here so a Hindi / Gujarati layer can be added later.
// Shape: one object per locale. Components read from `content` (the active locale).

export const company = {
  name: 'Shree Ashapura Industries',
  shortName: 'Ashapura',
  tagline: 'Fasteners & precision components',
  address: {
    lines: [
      'Gala No. 24/25, Agrawal Industrial Estate',
      'Near Dahisar Petrol Pump, S.V. Road',
      'Dahisar (E), Mumbai - 400068',
    ],
    mapQuery: 'Agrawal Industrial Estate, S.V. Road, Dahisar East, Mumbai 400068',
  },
  phone: { display: '+91 70215 80583', e164: '+917021580583', wa: '917021580583' },
  landline: { display: '022-2089 1665', e164: '+912220891665' },
  email: 'ashapura56@gmail.com',
}

const en = {
  skipLink: 'Skip to content',
  nav: {
    label: 'Primary',
    links: [
      { id: 'products', label: 'Products' },
      { id: 'process', label: 'Process' },
      { id: 'industries', label: 'Industries' },
      { id: 'gallery', label: 'Gallery' },
      { id: 'contact', label: 'Contact' },
    ],
    call: 'Call',
    whatsapp: 'WhatsApp',
    callWhatsapp: 'Call / WhatsApp',
    openMenu: 'Open menu',
    closeMenu: 'Close menu',
    homeLabel: 'Shree Ashapura Industries, back to top',
  },
  loader: {
    spec: 'THREAD M12 × 1.75',
    status: 'Cutting thread',
    done: 'Tolerance OK',
    skip: 'Skip intro',
  },
  hero: {
    // PLACEHOLDER — final hero copy arrives in Phase 2
    eyebrow: 'Est. Mumbai · Fastener manufacturers',
    title: ['Precision', 'in motion.'],
    lead: 'Screws, nuts, bolts, washers, turned, pressed and moulded components, made to drawing and delivered on time.',
    primaryCta: 'Request a quote',
    secondaryCta: 'See what we make',
  },
  placeholderSections: {
    // PLACEHOLDER — temporary anchors so navigation can be tested in Phase 1
    products: { label: '03 / What we make', title: 'Product range', customCell: 'Need a part to drawing? We make specials.' },
    process: { label: '06 / Manufacturing', title: 'From wire coil to inspection' },
    industries: { label: '07 / Industries', title: 'Industries & why us' },
    gallery: { label: '08 / Gallery', title: 'Gallery' },
    contact: { label: '09 / Contact', title: 'Send an enquiry' },
  },
  footer: {
    blurb: 'Manufacturers of all kinds of fasteners, precision turned, press and plastic moulded components, and special items for furniture kits.',
    addressTitle: 'Works',
    contactTitle: 'Contact',
    linksTitle: 'Site',
    mobile: 'Mobile / WhatsApp',
    landline: 'Landline',
    email: 'Email',
    rights: 'All rights reserved.',
    backToTop: 'Back to top',
    drawingNo: 'DWG NO. SA-001 · REV A',
  },
  whatsappMessages: {
    general: 'Hello Shree Ashapura Industries, I would like to enquire about your products.',
  },
}

export const locales = { en }
export const content = locales.en
export default content
