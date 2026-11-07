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
    eyebrow: 'Fasteners · Turned · Pressed · Moulded', // PLACEHOLDER
    title: ['Precision', 'in motion.'], // PLACEHOLDER
    lead: 'Screws, nuts, bolts and washers, plus precision turned, press and plastic moulded parts. Made to drawing in Mumbai, threaded to tolerance, delivered on time.', // PLACEHOLDER
    callCta: 'Call now',
    whatsappCta: 'WhatsApp us',
    tolerance: 'TOL ± 0.02 mm',
    scrollCue: 'Scroll to thread it in',
    posterAlt: 'Steel bolt above a tapped steel plate',
    dims: { dia: 'Ø12', len: 'L 30', thread: 'M12 × 1.75', pitch: 'P 1.75', af: 'AF 18' },
    readout: {
      aria: 'Torque readout for the bolt being threaded into the plate',
      torque: 'Torque',
      turns: 'Turns',
      spec: 'M12 · 8.8',
      phases: { align: 'Aligning', thread: 'Threading', seat: 'Torquing', seated: 'Seated ✓' },
    },
  },
  products: {
    label: '03 / What we make',
    title: 'Seven product lines, one workshop.', // PLACEHOLDER
    lead: 'From a single M3 screw to complete furniture fitting kits, made, finished and packed under one roof in Dahisar.', // PLACEHOLDER
    open: 'Specs',
    hint: 'Hover to turn the part. Tap a card for sizes and materials.',
    hintTouch: 'Tap a card for sizes and materials.',
    drawer: {
      close: 'Close',
      specs: 'Specifications',
      materials: 'Materials',
      sizes: 'Common sizes',
      finishes: 'Finishes',
      enquire: 'Enquire on WhatsApp',
      enquireMsg: (name) => `Hello Shree Ashapura Industries, I would like a quote for ${name}. Size / quantity: `,
      note: 'Placeholder specifications. Final ranges to be confirmed.', // PLACEHOLDER
    },
  },
  exploded: {
    label: '04 / Exploded view',
    title: ['Every part,', 'to drawing.'], // PLACEHOLDER
    lead: 'Bolt, washer and nut are made to the same thread standard, so every set fits first time, every time.', // PLACEHOLDER
    scrollCue: 'Scroll to take it apart',
    parts: [
      { name: 'Hex bolt', std: 'ISO 4017 · 8.8' },
      { name: 'Flat washer', std: 'ISO 7089 · 200 HV' },
      { name: 'Hex nut', std: 'ISO 4032 · class 8' },
    ], // PLACEHOLDER
    dims: { dia: 'Ø8', len: 'L 25', thread: 'M8 × 1.25', washer: 'Ø16', nut: 'AF 13', nutH: 'm 6.8' },
  },
  customise: {
    label: '05 / Customise',
    title: ['Specify it.', 'We make it.'], // PLACEHOLDER
    lead: 'Pick a head, size, length, material and finish. The part on the stage updates as you go, and the title block below becomes your enquiry.', // PLACEHOLDER
    controls: { head: 'Head', size: 'Thread size', pitch: 'Pitch', coarse: 'Coarse', fine: 'Fine', length: 'Length', material: 'Material', finish: 'Finish' },
    note: 'Visual preview. Final dimensions follow the standard and your drawing.', // PLACEHOLDER
    block: { part: 'Part', thread: 'Thread', length: 'Length', head: 'Standard', material: 'Material', finish: 'Finish', dwg: 'Dwg no.', scale: 'Scale', rev: 'Rev', company: 'Shree Ashapura Industries' },
    cta: 'Request a custom order',
    dragHint: 'Drag to turn',
    message: ({ part, thread, length, material, finish, dwg }) =>
      [
        'Hello Shree Ashapura Industries, I would like a quote for a custom part:',
        `• Part: ${part}`,
        `• Thread: ${thread}`,
        `• Length: ${length}`,
        `• Material: ${material}`,
        `• Finish: ${finish}`,
        `• Ref: ${dwg}`,
        'Quantity: ',
      ].join('\n'),
  },
  process: {
    label: '06 / Manufacturing',
    title: 'From wire coil to inspection.', // PLACEHOLDER
    lead: 'Six stations, one part. Follow a bolt through the shop floor.', // PLACEHOLDER
    stations: [
      { key: 'coil', name: 'Wire coil', spec: 'SAE 1018 · Ø 6.9 mm', text: 'Drawn steel wire is de-scaled, straightened and fed off the coil at a controlled tension.' },
      { key: 'heading', name: 'Cold heading', spec: '3-blow header · 180 pcs/min', text: 'A blank is cut and struck between dies until the head forms, cold, with unbroken grain flow.' },
      { key: 'rolling', name: 'Thread rolling', spec: 'Flat dies · ISO 6g', text: 'Two flat dies roll the thread into the blank. No material is cut away, so the thread is stronger.' },
      { key: 'heat', name: 'Heat treatment', spec: 'Harden 870 °C · temper 425 °C', text: 'Parts are hardened, quenched and tempered to reach their property class.' },
      { key: 'plating', name: 'Plating', spec: 'Zinc · yellow · black', text: 'Parts are plated or coated for corrosion resistance, in the finish the job calls for.' },
      { key: 'inspection', name: 'Quality inspection', spec: 'GO / NO-GO · 100% visual', text: 'Every lot is gauged, sampled and checked against the drawing before it is packed.' },
    ], // PLACEHOLDER
    track: 'Part journey',
  },
  // Kept for the products grid's 8th cell.
  placeholderSections: {
    products: { customCell: 'Need a part to drawing? We make specials.' }, // PLACEHOLDER
  },
  industries: {
    label: '07 / Industries & why us',
    title: 'Trusted on the shop floor.', // PLACEHOLDER
    lead: 'Fasteners and components for manufacturers who cannot afford a line stoppage.', // PLACEHOLDER
    // PLACEHOLDER numbers: replace with real figures before launch.
    counters: [
      { value: 25, suffix: '+', label: 'Years making fasteners' }, // PLACEHOLDER
      { value: 1200, suffix: '+', label: 'Part numbers in production' }, // PLACEHOLDER
      { value: 40, suffix: ' M', label: 'Pieces shipped a year' }, // PLACEHOLDER
      { value: 0.02, decimals: 2, prefix: '±', suffix: ' mm', label: 'Turning tolerance' }, // PLACEHOLDER
    ],
    whyTitle: 'Why Ashapura',
    why: [
      { icon: 'gear', title: 'Made in-house', text: 'Heading, rolling, turning and pressing under one roof.' }, // PLACEHOLDER
      { icon: 'drawing', title: 'To your drawing', text: 'Specials made from your drawing or a sample part.' }, // PLACEHOLDER
      { icon: 'caliper', title: 'Tight tolerance', text: 'Gauged to the standard, lot by lot.' }, // PLACEHOLDER
      { icon: 'clock', title: 'Quick turnaround', text: 'Stock sizes dispatched fast; specials on a clear date.' }, // PLACEHOLDER
      { icon: 'check', title: 'Every lot inspected', text: 'GO / NO-GO, hardness and finish checks before packing.' }, // PLACEHOLDER
      { icon: 'box', title: 'Kitted & packed', text: 'Counted kit packs for furniture and assembly lines.' }, // PLACEHOLDER
    ],
    listTitle: 'Industries we supply',
    list: [
      { key: 'furniture', name: 'Furniture', parts: 'Cam locks · connecting bolts · kit packs' }, // PLACEHOLDER
      { key: 'electrical', name: 'Electrical', parts: 'Brass terminals · earthing screws · inserts' }, // PLACEHOLDER
      { key: 'automotive', name: 'Automotive', parts: 'High tensile bolts · flange nuts · brackets' }, // PLACEHOLDER
      { key: 'appliances', name: 'Appliances', parts: 'Self-tapping screws · clips · spacers' }, // PLACEHOLDER
      { key: 'construction', name: 'Construction', parts: 'Anchor bolts · washers · structural nuts' }, // PLACEHOLDER
    ],
  },
  gallery: {
    label: '08 / Gallery',
    title: 'Inside the workshop.', // PLACEHOLDER
    lead: 'A look at the parts, the machines and the people. Real photos coming soon.', // PLACEHOLDER
    open: 'Open image',
    close: 'Close',
    prev: 'Previous image',
    next: 'Next image',
    count: (i, n) => `${String(i + 1).padStart(2, '0')} / ${String(n).padStart(2, '0')}`,
  },
  contact: {
    label: '09 / Contact',
    title: ['Send us your', 'requirement.'], // PLACEHOLDER
    lead: 'Tell us the part, size and quantity. We reply on WhatsApp, usually the same working day.', // PLACEHOLDER
    form: {
      name: 'Your name',
      company: 'Company',
      phone: 'Phone',
      requirement: 'Requirement',
      requirementHint: 'Part, size, material, finish, drawing reference…',
      quantity: 'Quantity',
      quantityHint: 'e.g. 5,000 pcs',
      optional: 'optional',
      submit: 'Send on WhatsApp',
      email: 'Send by email instead',
      sent: 'WhatsApp should have opened in a new tab. If it did not, send the same message by email.',
      errors: { name: 'Please enter your name.', phone: 'Please enter a phone number we can reach.', requirement: 'Please describe the part you need.' },
      message: ({ name, company, phone, requirement, quantity }) =>
        [
          'Hello Shree Ashapura Industries, I have an enquiry:',
          `Name: ${name}`,
          company && `Company: ${company}`,
          `Phone: ${phone}`,
          `Requirement: ${requirement}`,
          quantity && `Quantity: ${quantity}`,
        ]
          .filter(Boolean)
          .join('\n'),
      subject: (name) => `Enquiry from ${name}`,
    },
    addressTitle: 'Visit the works',
    callTitle: 'Call',
    call: 'Call now',
    whatsapp: 'WhatsApp',
    directions: 'Get directions',
    hoursTitle: 'Hours',
    hours: [
      ['Mon – Sat', '9:30 am – 7:00 pm'],
      ['Sunday', 'Closed'],
    ], // PLACEHOLDER
    mapTitle: 'Map showing Shree Ashapura Industries, Dahisar East, Mumbai',
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
