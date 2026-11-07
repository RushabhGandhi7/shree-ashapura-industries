// All user-facing copy lives here so a Hindi / Gujarati layer can be added later.
// Shape: one object per locale. Components read from `content` (the active locale).

// Real company facts: client-assets/CLIENT_FACTS.md (its OVERRIDES win).
export const company = {
  name: 'Shree Ashapura Industries',
  shortName: 'Ashapura',
  tagline: 'Your trust, our mission.',
  founded: 1990,
  iso: 'ISO 9001:2015', // CONFIRM certificate details (number, body, validity)
  address: {
    lines: ['Gala No. 24 & 25, Agarwal Co-op. Industrial Estate Ltd.', '121 S.V. Road, near Dahisar Petrol Pump', 'Dahisar (East), Mumbai 400068'],
    street: 'Gala No. 24 & 25, Agarwal Co-op. Industrial Estate Ltd., 121 S.V. Road, near Dahisar Petrol Pump',
    locality: 'Dahisar (East), Mumbai',
    postalCode: '400068',
    mapQuery: 'Agarwal Co-op Industrial Estate, 121 S.V. Road, Dahisar East, Mumbai 400068',
  },
  phone: { display: '+91 70215 80583', e164: '+917021580583', wa: '917021580583' },
  landline: { display: '022-2089 1665', e164: '+912220891665' },
  emails: ['ashapura56@gmail.com', 'b_jaan@hotmail.com'],
  email: 'ashapura56@gmail.com', // primary (mailto from the enquiry form)
}

/** Show the "Trusted by" customer marquee (customer list: `customers` in products.js). */
export const SHOW_CUSTOMERS = true

/**
 * Machines in units 24 & 25 only (client override). Read by the Capability section and
 * the Manufacturing stations, so the numbers live in one place.
 */
export const machines = [
  { key: 'heading', name: 'Cold heading', count: 5, min: 1.6, max: 7.5, unit: 'mm' }, // CONFIRM
  { key: 'rolling', name: 'Thread rolling', count: 8, min: 3, max: 50, unit: 'mm' }, // CONFIRM
  { key: 'slotting', name: 'Slotting & BT', count: 4, min: 4, max: 55, unit: 'mm' }, // CONFIRM
]
const mSpec = (key) => {
  const m = machines.find((x) => x.key === key)
  return `${m.count} machines · ${m.min} – ${m.max} ${m.unit}`
}

/** Whole years in business, computed so it never goes stale. */
export const yearsInBusiness = () => new Date().getFullYear() - company.founded

const en = {
  skipLink: 'Skip to content',
  nav: {
    label: 'Primary',
    links: [
      { to: '/products', label: 'Products' },
      { to: '/custom', label: 'Custom' },
      { to: '/manufacturing', label: 'Manufacturing' },
      { to: '/quality', label: 'Quality' },
      { to: '/about', label: 'About' },
      { to: '/gallery', label: 'Gallery' },
      { to: '/contact', label: 'Contact' },
    ],
    call: 'Call',
    whatsapp: 'WhatsApp',
    callWhatsapp: 'Call / WhatsApp',
    openMenu: 'Open menu',
    closeMenu: 'Close menu',
    homeLabel: 'Shree Ashapura Industries, home',
  },
  loader: {
    spec: 'THREAD M12 × 1.75',
    status: 'Cutting thread',
    done: 'Tolerance OK',
    skip: 'Skip intro',
  },
  hero: {
    eyebrow: 'Since 1990 · ISO 9001:2015', // CONFIRM ISO certificate details
    title: ['Your trust,', 'our mission.'],
    lead: 'Fasteners and machine components for the lock and furniture industry, plus precision turned, press and plastic moulded parts. Special products developed to your requirement and design.',
    callCta: 'Call now',
    whatsappCta: 'WhatsApp us',
    tolerance: 'EST. 1990',
    scrollCue: 'Scroll to thread it in',
    posterAlt: 'Steel bolt above a tapped steel plate',
    dims: { dia: 'Ø12', len: 'L 30', thread: 'M12 × 1.75', pitch: 'P 1.75', af: 'AF 18' },
    readout: {
      aria: 'Torque readout for the bolt being threaded into the plate',
      torque: 'Torque',
      turns: 'Turns',
      spec: 'M12 × 1.75',
      phases: { align: 'Aligning', thread: 'Threading', seat: 'Torquing', seated: 'Seated ✓' },
    },
  },
  products: {
    label: 'What we make',
    title: 'Eight product lines, made to order.',
    lead: 'From chipboard screws and washers to castors, brass inserts and complete furniture fitting kits.',
    open: 'View range',
    hint: 'Hover to turn the part. Click a card for the full range.',
    hintTouch: 'Tap a card for the full range.',
    custom: {
      title: 'Custom products made to your drawing',
      text: 'Send a drawing or a sample. We develop and produce special-purpose parts to your requirement and design, drawn in AutoCAD 2D & 3D.',
      cta: 'Send your drawing',
      message: 'Hello Shree Ashapura Industries, I would like a custom part made to my drawing. Part / quantity: ',
    },
    drawer: {
      close: 'Close',
      items: 'Products',
      materials: 'Materials',
      notes: 'Notes',
      imageAlt: (name) => `${name}: rendered example parts`,
      enquire: 'Enquire on WhatsApp',
      enquireMsg: (name) => `Hello Shree Ashapura Industries, I would like a quote for ${name}. Part / size / quantity: `,
      custom: 'Need something not listed? We make parts to your drawing.',
    },
  },
  exploded: {
    label: 'Exploded view',
    title: ['Every part,', 'to drawing.'],
    lead: 'Bolt, washer and nut, taken apart. Every dimension is checked against the drawing with calibrated gauges.',
    scrollCue: 'Scroll to take it apart',
    parts: [
      { name: 'Hex bolt', std: 'M8 × 1.25' },
      { name: 'Plain washer', std: 'Ø16' },
      { name: 'Hex nut', std: 'AF 13' },
    ],
    dims: { dia: 'Ø8', len: 'L 25', thread: 'M8 × 1.25', washer: 'Ø16', nut: 'AF 13', nutH: 'm 6.8' },
  },
  customise: {
    label: 'Customise',
    title: ['Specify it.', 'We make it.'],
    lead: 'Pick a head, size, length, material and finish. The part on the stage updates as you go, and the title block below becomes your enquiry.',
    controls: { head: 'Head', size: 'Thread size', pitch: 'Pitch', coarse: 'Coarse', fine: 'Fine', length: 'Length', material: 'Material', finish: 'Finish' },
    note: 'Visual preview only. Options are examples; final specification follows your drawing.', // CONFIRM options with the client
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
    label: 'Manufacturing',
    title: 'From wire coil to dispatch.',
    lead: 'Six stations, one part. Follow a screw through units 24 & 25.',
    // Machine counts and ranges: units 24 & 25 only (client override).
    stations: [
      {
        key: 'coil',
        name: 'Wire coil & incoming inspection',
        short: 'Wire coil',
        spec: 'Raw-material test reports',
        text: "Wire is checked against the supplier's chemical test report and third-party lab reports before it reaches the machines.",
      },
      { key: 'heading', name: 'Cold heading', short: 'Heading', spec: mSpec('heading'), text: 'Wire is cut and struck cold between dies to form the head. The first piece is approved before the run starts.' }, // CONFIRM
      { key: 'slotting', name: 'Slotting & BT', short: 'Slotting', spec: mSpec('slotting'), text: 'Slotting and BT machines finish the head before the thread is formed.' }, // CONFIRM
      { key: 'rolling', name: 'Thread rolling', short: 'Rolling', spec: mSpec('rolling'), text: 'Dies roll the thread into the blank, checked with calibrated thread ring gauges.' }, // CONFIRM
      {
        key: 'heatPlating',
        name: 'Heat treatment & plating',
        short: 'Heat & plate',
        spec: 'Via approved partners', // CONFIRM
        text: 'Hardening and plating are done by approved partners, backed by hardening / plating TC reports and third-party lab reports.',
      },
      {
        key: 'inspection',
        name: 'Inspection, packing & dispatch',
        short: 'Inspect & pack',
        spec: 'In-process check every 2 hours',
        text: 'Parts are checked with verniers, micrometers, thread gauges and hardness testing, then packed in our standard packing format and dispatched.',
      },
    ],
    track: 'Part journey',
  },
  capability: {
    label: 'Capability',
    title: ['Capacity on', 'the shop floor.'],
    lead: 'Machine ranges in units 24 & 25, on one scale. Wire and part diameters in millimetres.',
    scale: 'Ø mm',
    machinesLabel: (n) => `${n} machines`,
    rangeLabel: (m) => `Ø${m.min} – Ø${m.max} ${m.unit}`,
    drawing: {
      eyebrow: 'Made to your drawing',
      title: 'Send a drawing or a sample. We develop the part.',
      text: 'Special-purpose parts are developed to your requirement and design. Drawings are made in AutoCAD 2D & 3D.',
      cta: 'Send your drawing',
      message: 'Hello Shree Ashapura Industries, I would like a part made to my drawing. Part / size / quantity: ',
      tags: ['AutoCAD 2D', 'AutoCAD 3D', 'Sample to part'],
    },
  },
  quality: {
    label: 'Quality & certifications',
    title: ['Checked at', 'every step.'],
    mission: 'Our mission: high-quality parts for manufacturing industries.',
    instrumentsTitle: 'Inspection instruments',
    instruments: [
      { icon: 'vernier', name: 'Vernier calipers', note: 'Calibrated' },
      { icon: 'micrometer', name: 'Micrometers', note: 'Calibrated' },
      { icon: 'ring', name: 'Thread ring gauges', note: 'External threads' },
      { icon: 'plug', name: 'Thread plug gauges', note: 'Internal threads' },
      { icon: 'hardness', name: 'Hardness tester', note: 'HRC' },
      { icon: 'jig', name: 'Jigs & fixtures', note: 'In-house, critical dimensions' },
      { icon: 'report', name: 'Test reports', note: 'Raw material, plating, TC' },
    ],
    ppapProgress: (n, total) => `${String(n).padStart(2, '0')} / ${String(total).padStart(2, '0')}`,
    lead: 'Shree Ashapura Industries was established in 1990 to provide fasteners and machine components to the lock and furniture industry. We work to an ISO 9001:2015 quality system.', // CONFIRM ISO certificate details
    isoBadge: { title: 'ISO 9001:2015', text: 'Quality management system' }, // CONFIRM
    inProcess: {
      title: 'In-process checks',
      steps: [
        { k: '01', title: 'First-piece approval', text: 'Every run starts only after the first piece is approved.' },
        { k: '02', title: 'Every 2 hours', text: 'Parts are checked again every two hours while the run continues.' },
      ],
    },
    ppap: {
      title: 'PPAP documents',
      items: [
        'PSW',
        'In-process drawing',
        'Process flow diagram',
        'Control plan',
        'PFMEA',
        'Final-cum-PDIR inspection reports',
        'Layout inspection',
        'In-process inspection reports',
        'Check list',
        'Standard packing format',
        'Raw material test reports',
        'Cross-lab test reports',
        'Hardening / plating TC reports',
      ],
    },
    lean: {
      title: 'Lean manufacturing',
      text: 'We are part of Lean Cluster Mumbai.',
      items: ['5S', 'Standard operating process', 'OEE', 'Value stream mapping', 'Kaizen blitz', 'Poka-yoke', '7QC', 'SMED', '3M and seven wastes training'],
    },
    design: 'Drawings and development in AutoCAD 2D & 3D.',
    policy: {
      title: 'Quality policy',
      intro: 'We are committed to quality, quantity and on-time delivery, through:',
      principles: [
        'Monitoring customer feedback',
        'Selecting suppliers and monitoring their performance',
        'Training and developing our employees',
        'Defining quality objectives',
        'Management reviews of internal audits and customer complaints',
      ],
      name: 'Bharat Jain',
      role: 'Chief Executive Officer',
    },
  },
  industries: {
    label: 'Industries & why us',
    title: 'Trusted since 1990.',
    lead: 'Fasteners and components for furniture, appliance, electrical, lock and cable makers.', // CONFIRM industries list
    // 'years' / 'categories' / 'industries' are computed in Industries.jsx
    counters: [
      { value: 'years', suffix: '+', label: 'Years in business', note: 'Since 1990' },
      { value: 'categories', label: 'Product lines', note: 'Plus parts to drawing' },
      { value: 'industries', label: 'Industries supplied', note: 'Furniture to cables' },
    ],
    iso: { title: 'ISO 9001:2015', note: 'Quality system' }, // CONFIRM
    whyTitle: 'Why Ashapura',
    why: [
      { icon: 'clock', title: 'Quality, quantity, on time', text: 'The right parts, in the quantity you need, delivered on time.' },
      { icon: 'check', title: 'We understand your needs', text: 'Every order starts with understanding what you need and expect.' },
      { icon: 'caliper', title: 'Lower cost', text: 'New approaches that bring the cost of your part down.' },
      { icon: 'gear', title: 'Always improving', text: 'Continuous improvement of our quality systems, with Lean practices on the shop floor.' },
      { icon: 'drawing', title: 'Made to your design', text: 'Special-purpose parts developed to your requirement and drawing, in AutoCAD 2D & 3D.' },
      { icon: 'box', title: 'Furniture fitting kits', text: 'Cams, screws, inserts and fittings supplied together as kits.' },
    ],
    listTitle: 'Industries we supply',
    // CONFIRM: derived from the customer list.
    list: [
      { key: 'furniture', name: 'Furniture & Interiors' },
      { key: 'appliances', name: 'Home & Kitchen Appliances' },
      { key: 'electrical', name: 'Electrical' },
      { key: 'locks', name: 'Locks & Hardware' },
      { key: 'networking', name: 'Networking & Cables' },
    ],
    customersTitle: 'Trusted by',
    customersMore: 'and other customers',
  },
  gallery: {
    label: 'Gallery',
    title: 'Parts, machines and the works.',
    lead: 'Our parts, rendered from their drawings, and the machine areas of units 24 & 25. Workshop photos and a unit video are on the way.',
    open: 'Open image',
    close: 'Close',
    prev: 'Previous image',
    next: 'Next image',
    lowRes: 'Low resolution',
    count: (i, n) => `${String(i + 1).padStart(2, '0')} / ${String(n).padStart(2, '0')}`,
    renderAlt: (name, items) => `Rendered ${name}: ${items}`,
    renderCaption: (name) => name,
    illustrations: [
      { file: 'header', alt: 'Line drawing of a cold-heading machine: wire feed, cut-off, dies and punch', caption: 'Cold-heading area' },
      { file: 'thread-roller', alt: 'Line drawing of a flat-die thread rolling machine with a blank between the dies', caption: 'Thread-rolling area' },
      { file: 'slotter', alt: 'Line drawing of a slotting machine: slitting saw above a screw head in its fixture', caption: 'Slotting & BT area' },
    ],
    video: {
      title: 'Unit walkthrough',
      soon: 'Video coming soon',
      text: 'A short walk through units 24 & 25.',
      play: 'Play the unit video',
    },
  },
  quote: {
    title: ['Request a', 'custom quote.'],
    lead: 'Pick a product line, add the size and quantity, and send it on WhatsApp. Drawings welcome.',
    categoryLabel: 'Product line',
    other: 'Something else',
    detailsLabel: 'Size, quantity or drawing reference',
    detailsHint: 'e.g. M6 × 20, 10,000 pcs',
    optional: 'optional',
    cta: 'Request on WhatsApp',
    fromDrawer: 'Request a custom quote',
    message: ({ category, details }) =>
      [
        'Hello Shree Ashapura Industries, I would like a custom quote.',
        `Product line: ${category}`,
        details && `Details: ${details}`,
      ]
        .filter(Boolean)
        .join('\n'),
  },
  contact: {
    label: 'Contact',
    title: ['Send us your', 'requirement.'],
    lead: 'Tell us the part, size and quantity, or send your drawing. We reply on WhatsApp or by email.',
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
    emailTitle: 'Email',
    hoursTitle: 'Hours',
    hours: null, // CONFIRM working hours with the client (hidden until supplied)
    mapTitle: 'Map showing Shree Ashapura Industries, Dahisar East, Mumbai',
  },
  footer: {
    blurb: 'Manufacturer and supplier of fasteners and machine components for the lock and furniture industry, plus precision turned, press and plastic moulded parts. Since 1990.',
    addressTitle: 'Works',
    contactTitle: 'Contact',
    linksTitle: 'Site',
    productsTitle: 'Products',
    mobile: 'Mobile / WhatsApp',
    landline: 'Landline',
    email: 'Email',
    rights: 'All rights reserved.',
    backToTop: 'Back to top',
    drawingNo: 'DWG NO. SA-001 · REV A',
  },
  pages: {
    home: { title: 'Fastener Manufacturer in Mumbai | Screws, Turned Parts & Furniture Fittings', description: 'Shree Ashapura Industries, Mumbai, since 1990: fasteners, screws, washers, precision turned parts, brass inserts, castors and furniture fittings, made to your drawing.' },
    products: { title: 'Products: Fasteners, Washers, Brackets, Castors & Furniture Fittings', description: 'Eight product lines from Shree Ashapura Industries, Mumbai: screws and fasteners, washers, plastic components, brackets and press parts, brass parts, studs and turned parts, castors, furniture fittings and cams.', crumb: 'Products' },
    category: {
      title: (c) => `${c.name}: ${c.items.slice(0, 3).join(', ')}`,
      description: (c) => `${c.name} from Shree Ashapura Industries, Mumbai: ${c.items.join(', ')}. Made to your drawing; request a quote on WhatsApp.`.slice(0, 300),
    },
    custom: { title: 'Custom Fasteners & Parts Made to Your Drawing', description: 'Configure a custom bolt or screw, or send your drawing or sample. Shree Ashapura Industries develops special-purpose parts to your requirement, drawn in AutoCAD 2D & 3D.', crumb: 'Custom orders' },
    manufacturing: { title: 'Manufacturing: Cold Heading, Slotting & Thread Rolling', description: 'From wire coil to dispatch: cold heading, slotting and BT, thread rolling, heat treatment and plating via approved partners, inspection and packing, in units 24 & 25, Dahisar (East), Mumbai.', crumb: 'Manufacturing' },
    quality: { title: 'Quality & Certifications: ISO 9001:2015, PPAP, Inspection', description: 'ISO 9001:2015 quality system, first-piece approval and in-process checks every 2 hours, calibrated gauges, HRC testing, full PPAP documents and Lean practices.', crumb: 'Quality' },
    about: { title: 'About Us: Fastener Makers Since 1990', description: 'Shree Ashapura Industries has made fasteners and machine components for the lock and furniture industry since 1990. Meet the team, our industries and customers.', crumb: 'About' },
    gallery: { title: 'Gallery: Parts, Machines & the Works', description: 'Our parts rendered from their drawings, and the cold-heading, thread-rolling and slotting areas of units 24 & 25 in Dahisar (East), Mumbai.', crumb: 'Gallery' },
    contact: { title: 'Contact: Call, WhatsApp or Visit Us in Dahisar (East), Mumbai', description: 'Send your requirement on WhatsApp or email, call +91 70215 80583, or visit Gala No. 24 & 25, Agarwal Co-op. Industrial Estate, S.V. Road, Dahisar (East), Mumbai 400068.', crumb: 'Contact' },
    notFound: { title: 'Page not found', description: 'This page does not exist. Browse our products or contact Shree Ashapura Industries.', crumb: 'Not found' },
    home_crumb: 'Home',
    titleSuffix: ' | Shree Ashapura Industries',
  },
  teasers: {
    products: { label: 'What we make', title: 'Eight product lines.', lead: 'From chipboard screws and washers to castors, brass inserts and complete furniture fitting kits.', cta: 'All products' },
    capability: { cta: 'See manufacturing' },
    quality: { label: 'Quality', title: ['Checked at', 'every step.'], cta: 'Quality & certifications' },
    final: { cta: 'Contact us' },
  },
  category: {
    back: 'All products',
    items: 'Products in this line',
    materials: 'Materials',
    notes: 'Notes',
    quote: 'Request a quote on WhatsApp',
    quoteMsg: (name) => `Hello Shree Ashapura Industries, I would like a quote for ${name}. Part / size / quantity: `,
    call: 'Call',
    custom: 'Need something not listed? We make parts to your drawing.',
    customCta: 'Custom orders',
    related: 'Related product lines',
    view: 'View range',
    imageAlt: (name) => `${name}: rendered example parts`,
  },
  howCustom: {
    label: 'How custom orders work',
    title: 'From your drawing to production.',
    steps: [
      { k: '01', title: 'Send a drawing or sample', text: 'Share your drawing, a sample part or the requirement on WhatsApp or email.' },
      { k: '02', title: 'We review', text: 'We study the part, the material and the quantity, and come back with questions or a quote.' },
      { k: '03', title: 'Sample approval', text: 'Samples are made for your approval before the run.' },
      { k: '04', title: 'Production', text: 'The approved part goes into production, with first-piece approval and in-process checks.' },
    ],
    cta: 'Send your drawing',
    message: 'Hello Shree Ashapura Industries, I would like a custom part made to my drawing. Part / size / quantity: ',
  },
  about: {
    label: 'About us',
    title: ['Your trust,', 'our mission.'],
    story: [
      'Shree Ashapura Industries was established in 1990 to provide fasteners and machine components to the lock and furniture industry.',
      'Today we manufacture and supply screws and fasteners, washers, plastic components, brackets and press parts, brass parts, studs and precision turned parts, castors and furniture fittings, from units 24 & 25 in Dahisar (East), Mumbai.',
      'We also develop and produce special-purpose products to customer requirement and design, drawn in AutoCAD 2D & 3D.',
    ],
    facts: [
      { k: 'Established', v: '1990' },
      { k: 'Quality system', v: 'ISO 9001:2015' }, // CONFIRM certificate details
      { k: 'Lean', v: 'Lean Cluster Mumbai' },
      { k: 'Design', v: 'AutoCAD 2D & 3D' },
    ],
    leader: { name: 'Bharat Jain', role: 'Chief Executive Officer', quote: 'Our mission: high-quality parts for manufacturing industries.' },
  },
  notFound: {
    code: 'ERR 404',
    title: ['Part not', 'found.'],
    lead: 'This page is not on our drawing. Try one of these instead.',
    category: (slug) => `There is no product line called "${slug}".`,
    didYouMean: 'Did you mean',
    links: 'Main pages',
    home: 'Back to home',
  },
  whatsappMessages: {
    general: 'Hello Shree Ashapura Industries, I would like to enquire about your products.',
  },
}

export const locales = { en }
export const content = locales.en
export default content
