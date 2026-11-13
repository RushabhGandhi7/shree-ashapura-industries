// All user-facing copy lives here so a Hindi / Gujarati layer can be added later.
// Shape: one object per locale. Components read from `content` (the active locale).

// Real company facts: client-assets/CLIENT_FACTS.md (its OVERRIDES win).

/* ── Company facts ──────────────────────────────────────────────────────────────────
   Each value lives in ONE constant below and every string on the site reads it from here.
   Confirmed by the client (phase 11b): firm name, year, address, phones, emails, machine
   counts, Bharat Jain as CEO, ISO 9001:2015. Still open (// CONFIRM, see CONFIRM.md):
   customer list and logos, PPAP and Lean text. The ISO certificate number and validity
   are not shown anywhere until the client supplies them. */
export const FIRM_NAME = 'Shree Ashapura Industries'
export const FOUNDED = 1990
/** The address, written once. Every place that shows it (contact, footer, map, JSON-LD, SEO) derives from this. */
export const ADDRESS_TEXT = 'Gala No. 24 & 25, Agarwal Co-op. Industrial Estate Ltd., 121 S.V. Road, near Dahisar Petrol Pump, Dahisar (East), Mumbai 400068' // CONFIRM Agarwal vs Agrawal
// Display lines: "Gala … Ltd." / "121 S.V. Road, near … Pump" / "Dahisar (East), Mumbai 400068".
const addressLines = ADDRESS_TEXT.replace(/(Ltd\.|Pump),\s*/g, '$1\n').split('\n')
export const ADDRESS = {
  text: ADDRESS_TEXT,
  lines: addressLines,
  street: addressLines.slice(0, -1).join(', '),
  locality: addressLines.at(-1).replace(/\s*\d{6}$/, ''),
  postalCode: ADDRESS_TEXT.match(/\d{6}$/)[0],
}
/** The only phone number (mobile + WhatsApp). The landline was removed in phase 12A. */
export const PHONES = {
  mobile: { display: '+91 70215 80583', e164: '+917021580583', wa: '917021580583' },
}
export const EMAILS = ['ashapura56@gmail.com', 'b_jaan@hotmail.com'] // first = primary
/** Machines in units 24 & 25 only. Read by Capability and the Manufacturing stations. */
export const MACHINE_COUNTS = [
  { key: 'heading', name: 'Cold heading', count: 5, min: 1.6, max: 7.5, unit: 'mm' },
  { key: 'rolling', name: 'Thread rolling', count: 8, min: 3, max: 50, unit: 'mm' },
  { key: 'slotting', name: 'Slotting & BT', count: 4, min: 4, max: 55, unit: 'mm' },
]
/** Customer names (wordmarks; `customers` in products.js adds the logo field). */
export const CUSTOMER_NAMES = ['Godrej Interio', 'IFB', 'Elica', 'Crompton Greaves', 'Belden', 'SmartLink', 'Saakshi', 'CA.BE Springs & Fasteners'] // CONFIRM customer list (and logo files)
export const LEADER = { name: 'Bharat Jain', title: 'Chief Executive Officer' }
export const ISO_TEXT = 'ISO 9001:2015' // certificate number and validity: open in CONFIRM.md, not shown yet
export const PPAP_TEXT = [
  // CONFIRM PPAP document list
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
]
export const LEAN_TEXT = {
  // CONFIRM Lean text
  cluster: 'Lean Cluster Mumbai',
  practices: ['5S', 'Standard operating process', 'OEE', 'Value stream mapping', 'Kaizen blitz', 'Poka-yoke', '7QC', 'SMED', '3M and seven wastes training'],
}

export const company = {
  name: FIRM_NAME,
  shortName: 'Ashapura',
  tagline: 'Your trust, our mission.',
  founded: FOUNDED,
  iso: ISO_TEXT,
  address: ADDRESS,
  phone: PHONES.mobile,
  emails: EMAILS,
  email: EMAILS[0], // primary (mailto from the enquiry form)
}

/** Show the "Trusted by" customer marquee (customer list: `customers` in products.js). */
export const SHOW_CUSTOMERS = true

export const machines = MACHINE_COUNTS
const mSpec = (key) => {
  const m = machines.find((x) => x.key === key)
  return `${m.count} machines · ${m.min} – ${m.max} ${m.unit}`
}

/* ── Full product catalogue (phase 12B) ───────────────────────────────────────────────
   Every product in the client's catalogue, by name. One item = { slug, name, category,
   group?, spec?, model?, drawing, photo }:
     category  category slug (categories in products.js)
     group     sub-heading inside a category (screws / bolts / nuts)
     spec      short spec line, only where the catalogue states it
     model     key into `itemModels` (products.js): real procedural 3D in the shared canvas
     drawing   line-drawing family (components/products/ItemDrawing.jsx) when there is no model
     photo     path to a real photo (e.g. '/products/photos/<slug>.webp'); null = "Photo coming"
   No catalogue photos, ever. Slugs are unique across the whole catalogue (deep links:
   /products/<category>#<slug>). */
const SBN = 'screws-fasteners'
const W = 'washers'
const PL = 'plastic-components'
const BR = 'brackets-press-parts'
const BS = 'brass-parts'
const ST = 'studs-pins-turned'
const FF = 'furniture-fittings'
const item = (slug, name, category, o = {}) => ({ slug, name, category, group: null, spec: null, model: null, drawing: 'moulded', photo: null, ...o })
const screw = (slug, name, o) => item(slug, name, SBN, { group: 'screws', drawing: 'screw', ...o })
const bolt = (slug, name, o) => item(slug, name, SBN, { group: 'bolts', drawing: 'bolt', ...o })
const nut = (slug, name, o) => item(slug, name, SBN, { group: 'nuts', drawing: 'nut', ...o })

export const catalogueItems = [
  // 1 · Screws, Bolts & Nuts — screws
  screw('hex-screw', 'Hex screw', { drawing: 'hexScrew' }),
  screw('phillips-pan-head-screw', 'Phillips pan-head screw', { model: 'panScrew' }),
  screw('slotted-screw', 'Slotted screw', { drawing: 'slottedScrew' }),
  screw('countersunk-screw', 'Countersunk screw', { drawing: 'cskScrew' }),
  screw('chipboard-screw', 'Chipboard screw', { model: 'chipboardScrew' }),
  screw('machine-screw', 'Machine screw', { drawing: 'machineScrew' }),
  screw('special-screw', 'Special (SPL) screw', { drawing: 'splScrew' }),
  screw('projection-weld-screw', 'Projection weld screw', { drawing: 'weldScrew' }),
  screw('step-screw', 'Step screw', { drawing: 'stepScrew' }),
  screw('flange-screw', 'Flange screw', { drawing: 'flangeBolt' }),
  screw('self-tapping-screw', 'Self-tapping screw', { drawing: 'tappingScrew' }),
  screw('screw-assortment-set', 'Screw assortment set', { drawing: 'set' }),
  // bolts
  bolt('hex-bolt', 'Hex bolt', { model: 'hexBolt' }),
  bolt('nut-bolt', 'Nut bolt', { drawing: 'nutBolt' }),
  bolt('step-bolt', 'Step bolt', { drawing: 'stepScrew' }),
  bolt('carriage-bolt', 'Carriage bolt', { model: 'carriageBolt' }),
  bolt('flange-bolt', 'Flange bolt', { model: 'flangeBolt' }),
  bolt('projection-weld-bolt', 'Projection weld bolt', { drawing: 'weldScrew' }),
  bolt('bolt-nut-washer-set', 'Bolt + nut + washer set', { drawing: 'set' }),
  // nuts
  nut('hex-nut', 'Hex nut', { model: 'hexNut' }),
  nut('thin-lock-nut', 'Thin / lock nut', { drawing: 'thinNut' }),
  nut('nyloc-nut', 'Nyloc nut', { model: 'nylocNut' }),
  nut('flange-nut', 'Flange (serrated) nut', { model: 'flangeNut' }),
  nut('castle-nut', 'Castle nut', { drawing: 'castleNut' }),
  nut('dome-nut', 'Dome nut', { model: 'domeNut' }),
  nut('brass-nut', 'Brass nut', { spec: 'Brass' }),

  // 2 · Washers (finishes: zinc, steel or black)
  item('plain-washer', 'Plain washer', W, { model: 'plainWasher', spec: 'Zinc / steel / black' }),
  item('spring-washer', 'Spring washer', W, { model: 'springWasher', spec: 'Zinc / steel / black' }),
  item('circlip', 'Circlip', W, { drawing: 'circlip', spec: 'Zinc / steel / black' }),
  item('star-lock-washer', 'Star / tooth lock washer', W, { drawing: 'starWasher', spec: 'Zinc / steel / black' }),
  item('fibre-washer', 'Fibre / coloured washer', W, { drawing: 'washer' }), // CONFIRM fibre / coloured washer

  // 3 · Plastic Components
  item('round-cap-leg', 'Cap / leg (round)', PL, { drawing: 'cap' }),
  item('plastic-plug', 'Plastic plug', PL, { model: 'plasticPlug' }),
  item('rectangular-tube-end-cap', 'Rectangular tube end cap', PL, { drawing: 'rectCap' }),
  item('square-tube-end-cap', 'Square tube end cap', PL, { drawing: 'squareCap' }),
  item('moulded-plastic-parts', 'Moulded plastic parts (plastic compound)', PL, { drawing: 'moulded' }),
  item('leveller', 'Leveller', PL, { drawing: 'leveller' }),
  item('leveller-bolt', 'Leveller bolt', PL, { model: 'levellerBolt' }),
  item('adjustable-glide-base', 'Adjustable glide base', PL, { drawing: 'glide' }),
  item('nylon-bush-ring', 'Nylon bush / ring', PL, { drawing: 'bush', spec: 'Nylon' }),
  item('nylon-cam-wheel', 'Nylon cam wheel', PL, { drawing: 'camWheel', spec: 'Nylon' }),
  // unnamed "new solutions" parts
  item('cream-nylon-ring', 'Cream nylon ring', PL, { drawing: 'ring', spec: 'Nylon' }), // CONFIRM name
  item('brown-two-hole-plate', 'Brown 2-hole plate', PL, { drawing: 'plate2' }), // CONFIRM name
  item('cream-nylon-disc', 'Cream nylon disc', PL, { drawing: 'disc', spec: 'Nylon' }), // CONFIRM name
  item('black-moulded-part', 'Black moulded part', PL, { drawing: 'moulded' }), // CONFIRM name

  // 4 · Brackets & Press Parts
  item('l-bracket', 'L bracket', BR, { model: 'lBracket' }),
  item('c-bracket', 'C bracket', BR, { drawing: 'cBracket' }),
  item('t-plate', 'T plate', BR, { drawing: 'tPlate' }),
  item('flat-plate-with-holes', 'Flat plate with holes', BR, { drawing: 'plate' }),
  item('corner-bracket', 'Corner bracket', BR, { drawing: 'corner' }),
  item('u-clamp-bracket', 'U-clamp bracket', BR, { drawing: 'uClamp' }),
  item('press-sheet-metal-parts', 'Press / sheet-metal parts', BR, { drawing: 'press' }),

  // 5 · Brass Parts
  item('knurled-turned-bush', 'Knurled turned bush', BS, { model: 'brassBush', spec: 'Brass' }),
  item('brass-nozzle', 'Brass nozzle', BS, { drawing: 'nozzle', spec: 'Brass' }),
  item('brass-turned-pin', 'Brass turned pin', BS, { drawing: 'pin', spec: 'Brass' }),
  item('brass-cross-connector', 'Brass cross connector', BS, { drawing: 'cross', spec: 'Brass' }),
  item('brass-bush', 'Brass bush', BS, { drawing: 'bush', spec: 'Brass' }),

  // 6 · Studs, Pins & Turned Parts
  item('stud', 'Stud (threaded both ends)', ST, { drawing: 'stud' }),
  item('machine-part', 'Machine part (turned / hex / square rod)', ST, { drawing: 'rod' }),
  item('taper-pin', 'Taper pin', ST, { model: 'taperPin' }),
  item('cotter-pin', 'Cotter pin', ST, { model: 'cotterPin' }),
  item('dowel-pin', 'Dowel pin', ST, { drawing: 'dowelPin' }),
  item('knurled-axle', 'Axle / rod with double-side knurling', ST, { model: 'knurledAxle' }),

  // 7 · Furniture Fittings & Cams
  item('cam', 'Cam', FF, { model: 'cam' }),
  item('cam-lock-with-keys', 'Cam lock with keys', FF, { drawing: 'camLock' }),
  item('door-handle', 'Door handle', FF, { drawing: 'handle' }),
  item('bed-handle', 'Bed handle', FF, { drawing: 'bedHandle' }),
  item('threaded-insert', 'Threaded insert (ribbed / knurled)', FF, { drawing: 'insert' }),
  item('cam-connector-bolt', 'Cam connector bolt', FF, { drawing: 'connector' }),
  item('wooden-dowel', 'Wooden dowel', FF, { drawing: 'woodDowel' }),
  item('slide-clip-fitting', 'Slide / clip fitting', FF, { drawing: 'slide' }),
  item('metal-cup-ferrule', 'Metal cup / ferrule', FF, { drawing: 'cup' }),
  item('furniture-lock-fastener-kits', 'Furniture and lock fastener kits', FF, { drawing: 'kit' }),
  // unnamed "new solutions" parts
  item('metal-cup', 'Metal cup', FF, { drawing: 'cup' }), // CONFIRM name
  item('zinc-cam-housing', 'Zinc cam housing', FF, { drawing: 'camHousing', spec: 'Zinc' }), // CONFIRM name
]

/** Items of one category, in catalogue order. */
export const itemsOf = (category) => catalogueItems.filter((i) => i.category === category)

/** Whole years in business, computed so it never goes stale. */
export const yearsInBusiness = () => new Date().getFullYear() - company.founded

const BRAND_SHORT = FIRM_NAME.replace(/ Industries$/, '')

const en = {
  skipLink: 'Skip to content',
  nav: {
    label: 'Primary',
    links: [
      { to: '/', label: 'Home' },
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
    menuLabel: 'Menu',
    homeLabel: `${FIRM_NAME}, home`,
    brandLine: BRAND_SHORT.toUpperCase(),
    subline: 'Industries · Mumbai',
    progress: (n) => `${String(n).padStart(3, '0')} / 100`,
    progressLabel: 'Page scroll progress',
  },
  loader: {
    spec: 'THREAD M12 × 1.75',
    status: 'Cutting thread',
    done: 'Tolerance OK',
    skip: 'Skip intro',
  },
  hero: {
    eyebrow: `Since ${FOUNDED} · ${ISO_TEXT}`,
    title: ['Your trust,', 'our mission.'],
    lead: 'Fasteners and machine components for the lock and furniture industry, plus precision turned, press and plastic moulded parts. Special products developed to your requirement and design.',
    callCta: 'Call now',
    whatsappCta: 'WhatsApp us',
    tolerance: `EST. ${FOUNDED}`,
    posterAlt: 'Steel hex bolt threaded into a tapped steel plate',
  },
  products: {
    label: 'What we make',
    title: 'Seven product lines, made to order.',
    lead: 'From screws, bolts and nuts to washers, brass parts, and fittings for furniture and locks.',
    open: 'View range',
    hint: 'Hover to turn the part. Click a card for the full range.',
    hintTouch: 'Tap a card for the full range.',
    custom: {
      tag: 'DWG → PART',
      title: 'Custom products made to your drawing',
      shortTitle: 'Made to your drawing',
      text: 'Send a drawing or a sample. We develop and produce special-purpose parts to your requirement and design, drawn in AutoCAD 2D & 3D.',
      cta: 'Send your drawing',
      message: `Hello ${FIRM_NAME}, I would like a custom part made to my drawing. Part / quantity: `,
    },
    // From the client's new catalogue (phase 11). Text only; the configurator's options are separate.
    catalogue: {
      rangeLabel: 'Range',
      range: 'M2 – M14 · #2 – #14 · L 3 – 100 mm',
      materialsLabel: 'Materials',
      materials: ['M.S.', 'S.S.', 'Brass', 'Aluminium', 'Copper', 'EN8 high tensile', 'Plastic'],
      kits: 'We make kits for furniture and locks, and parts to your drawing and raw material.',
    },
    // searchable list of every catalogue item (phase 12B)
    index: {
      label: 'Full catalogue',
      title: 'Every product, by name.',
      lead: 'Search the full list or filter by product line. Each item links to its card on the product line page.',
      search: 'Search products',
      placeholder: 'e.g. nyloc, bracket, brass',
      all: 'All',
      filterLabel: 'Filter by product line',
      results: (n, total) => (n === total ? `${total} products` : `${n} of ${total} products`),
      none: 'No product matches. We also make parts to your drawing.',
      noneCta: 'Custom orders',
      model3d: '3D',
    },
    drawer: {
      close: 'Close',
      items: 'Products',
      materials: 'Materials',
      notes: 'Notes',
      imageAlt: (name) => `${name}: rendered example parts`,
      enquire: 'Enquire on WhatsApp',
      enquireMsg: (name) => `Hello ${FIRM_NAME}, I would like a quote for ${name}. Part / size / quantity: `,
      custom: 'Need something not listed? We make parts to your drawing.',
    },
  },
  customise: {
    label: 'Customise',
    title: ['Specify it.', 'We make it.'],
    lead: 'Pick a head, size, length, material and finish. The part on the stage updates as you go, and the title block below becomes your enquiry.',
    controls: { head: 'Head', size: 'Thread size', pitch: 'Pitch', coarse: 'Coarse', fine: 'Fine', length: 'Length', material: 'Material', finish: 'Finish' },
    note: 'Visual preview only. Options are examples; final specification follows your drawing.', // CONFIRM options with the client
    block: { part: 'Part', thread: 'Thread', length: 'Length', head: 'Standard', headDim: 'Head', view: 'View', material: 'Material', finish: 'Finish', dwg: 'Dwg no.', scale: 'Scale', rev: 'Rev', company: FIRM_NAME },
    cta: 'Request a custom order',
    dragHint: 'Drag to turn',
    views: { label: 'View', front: 'Front (3D)', top: 'Top', block: 'Front (3D) / Top' },
    topView: {
      title: 'View A · Top',
      scale: (r) => `Scale ${r}`,
      root: 'root',
      drive: { hex: (k) => `Hex S${k}`, cross: 'Phillips', none: 'Plain top' },
      csk: '90° CSK',
      aria: (x) => `Top view of the ${x.head}: ${x.key}, ${x.thread} thread, root diameter ${x.root} mm.`,
    },
    headSpec: {
      hex: (v) => `Hex head (AF ${v.af} mm, head height ${v.height} mm)`,
      socket: (v) => `Socket cap (head Ø${v.dk} mm, hex key ${v.key} mm)`,
      pan: (v) => `Pan head (head Ø${v.dk} mm, Phillips)`,
      countersunk: (v) => `Countersunk (head Ø${v.dk} mm, 90°, hex key ${v.key} mm)`,
    },
    message: ({ part, head, thread, root, length, material, finish, dwg }) =>
      [
        `Hello ${FIRM_NAME}, I would like a quote for a custom part:`,
        `• Part: ${part}`,
        `• Head: ${head}`,
        `• Thread: ${thread}`,
        `• Root Ø: ${root} mm`,
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
      { key: 'heading', name: 'Cold heading', short: 'Heading', spec: mSpec('heading'), text: 'Wire is cut and struck cold between dies to form the head. The first piece is approved before the run starts.' },
      { key: 'slotting', name: 'Slotting & BT', short: 'Slotting', spec: mSpec('slotting'), text: 'Slotting and BT machines finish the head before the thread is formed.' },
      { key: 'rolling', name: 'Thread rolling', short: 'Rolling', spec: mSpec('rolling'), text: 'Dies roll the thread into the blank, checked with calibrated thread ring gauges.' },
      {
        key: 'heatPlating',
        name: 'Heat treatment & plating',
        short: 'Heat & plate',
        spec: 'Via approved partners', // CONFIRM
        tag: 'APPROVED PARTNERS', // CONFIRM (drawn in the vignette)
        text: 'Hardening and plating are done by approved partners, backed by hardening / plating TC reports and third-party lab reports.', // CONFIRM
      },
      {
        key: 'inspection',
        name: 'Inspection, packing & dispatch',
        short: 'Inspect & pack',
        spec: 'In-process check every 2 hours · then packed & dispatched',
        text: 'Go checks the part is not too tight. No-Go checks it is not too loose. A good part passes Go and fails No-Go.',
        wide: true, // the Go / No-Go vignette tells two cases, so its panel is wider
        gauge: {
          go: 'GO',
          nogo: 'NO-GO',
          goPass: 'GO: must pass ✓',
          nogoHold: 'NO-GO: must NOT pass ✓',
          nogoEntered: 'NO-GO: entered ✗',
          accepted: 'PART ACCEPTED',
          rejected: 'PART REJECTED',
          case1: 'CASE 1 · GOOD PART',
          case2: 'CASE 2 · WORN / OVERSIZE',
          min: 'MIN',
          max: 'MAX',
          part: 'PART',
        },
      },
    ],
    track: 'Part journey',
    scrollCue: 'Scroll',
    hint: 'Scroll up / down to continue',
  },
  capability: {
    label: 'Capability',
    title: ['Capacity on', 'the shop floor.'],
    lead: 'Machine ranges in units 24 & 25, on one scale. Wire and part diameters in millimetres.',
    scale: 'Ø mm',
    productRange: 'Product range',
    // Secondary list (phase 11, from the catalogue). Does not change `machines` above.
    extra: {
      title: 'Also on the shop floor',
      items: ['Traub A25 · 1.6 – 25 mm', 'Drilling & tapping', 'Grinding', 'Milling', 'Lathe', 'Drum polish', 'Welding'],
    },
    machinesLabel: (n) => `${n} machines`,
    rangeLabel: (m) => `Ø${m.min} – Ø${m.max} ${m.unit}`,
    drawing: {
      eyebrow: 'Made to your drawing',
      title: 'Send a drawing or a sample. We develop the part.',
      text: 'Special-purpose parts are developed to your requirement and design. Drawings are made in AutoCAD 2D & 3D.',
      cta: 'Send your drawing',
      message: `Hello ${FIRM_NAME}, I would like a part made to my drawing. Part / size / quantity: `,
      tags: ['AutoCAD 2D', 'AutoCAD 3D', 'Sample to part'],
    },
  },
  // Machining (phase 12C): secondary operations, same blueprint style. Capacities only where
  // given: turning on the Traub A25.
  machining: {
    label: 'Machining',
    title: ['Turned, drilled,', 'finished in-house.'],
    lead: 'Secondary operations that take a headed or rolled part to its final shape and finish.',
    steps: [
      { key: 'turning', name: 'Turning', spec: 'Traub A25 · 1.6 – 25 mm · 0.02 mm accuracy', text: 'Bar stock is turned to profile: shafts, pins, bushes and special parts.' }, // CONFIRM 0.02 mm accuracy (given in the phase 12C brief, not in the client facts)
      { key: 'drilling', name: 'Drilling & tapping', spec: 'Holes and internal threads', text: 'Cross holes are drilled and internal threads are tapped.' },
      { key: 'milling', name: 'Milling', spec: 'Flats, slots and steps', text: 'Flats, slots and steps are milled where a part needs them.' },
      { key: 'grinding', name: 'Grinding', spec: 'Fine size and finish', text: 'Grinding brings diameters to size with a fine surface finish.' },
      { key: 'slotting', name: 'Slotting', spec: 'Screwdriver slots', text: 'A slitting saw cuts the drive slot across the head.' },
      { key: 'polishing', name: 'Drum polishing', spec: 'Deburring and finish', text: 'Parts tumble in a drum to remove burrs and brighten the surface.' },
      { key: 'welding', name: 'Welding', spec: 'Joined assemblies', text: 'Parts are welded where an assembly needs a permanent joint.' },
    ],
  },
  // Types of machines (phase 12C). `count` reads MACHINE_COUNTS by key (never typed here).
  // video / poster: drop files into public/videos/ and set the paths; null = "Video coming".
  machineTypes: {
    label: 'Types of machines',
    title: ['The machines', 'behind the parts.'],
    lead: 'What each machine does on the shop floor. Short silent clips of each one are on the way.',
    videoComing: 'Video coming',
    playLabel: (name) => `${name}: silent video`,
    cards: [
      { key: 'heading', machine: 'heading', name: 'Header (cold heading)', text: 'Cuts wire and forms the head cold between dies.', video: null, poster: null },
      { key: 'rolling', machine: 'rolling', name: 'Thread rolling', text: 'Rolls the thread into the blank between flat dies.', video: null, poster: null },
      { key: 'slotting', machine: 'slotting', name: 'Slotting', text: 'Cuts the screwdriver slot across the head.', video: null, poster: null },
      { key: 'turning', machine: null, name: 'Traub / turning', text: 'Turns bar stock to profile, 1.6 – 25 mm.', video: null, poster: null }, // CONFIRM range shown as in the brief
      { key: 'drilling', machine: null, name: 'Drilling & tapping', text: 'Drills holes and taps internal threads.', video: null, poster: null },
      { key: 'grinding', machine: null, name: 'Grinding, milling & lathe', text: 'Brings parts to size, cuts flats and steps, finishes diameters.', video: null, poster: null },
    ],
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
    lead: `${FIRM_NAME} was established in ${FOUNDED} to provide fasteners and machine components to the lock and furniture industry. We work to an ${ISO_TEXT} quality system.`,
    isoBadge: { title: ISO_TEXT, text: 'Quality management system' },
    inProcess: {
      title: 'In-process checks',
      steps: [
        { k: '01', title: 'First-piece approval', text: 'Every run starts only after the first piece is approved.' },
        { k: '02', title: 'Every 2 hours', text: 'Parts are checked again every two hours while the run continues.' },
      ],
    },
    ppap: {
      title: 'PPAP documents',
      items: PPAP_TEXT,
    },
    lean: {
      title: 'Lean manufacturing',
      text: `We are part of ${LEAN_TEXT.cluster}.`,
      items: LEAN_TEXT.practices,
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
      name: LEADER.name,
      role: LEADER.title,
    },
  },
  industries: {
    label: 'Industries & why us',
    title: `Trusted since ${FOUNDED}.`,
    lead: 'Fasteners and components for furniture, appliance, electrical, lock and cable makers.', // CONFIRM industries list
    // 'years' / 'categories' / 'industries' are computed in Industries.jsx
    counters: [
      { value: 'years', suffix: '+', label: 'Years in business', note: `Since ${FOUNDED}` },
      { value: 'categories', label: 'Product lines', note: 'Plus parts to drawing' },
      { value: 'industries', label: 'Industries supplied', note: 'Furniture to cables' },
    ],
    iso: { title: ISO_TEXT, note: 'Quality system' },
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
        `Hello ${FIRM_NAME}, I would like a custom quote.`,
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
          `Hello ${FIRM_NAME}, I have an enquiry:`,
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
    mapTitle: `Map showing ${FIRM_NAME}, Dahisar East, Mumbai`,
  },
  footer: {
    blurb: `Manufacturer and supplier of fasteners and machine components for the lock and furniture industry, plus precision turned, press and plastic moulded parts. Since ${FOUNDED}.`,
    addressTitle: 'Works',
    contactTitle: 'Contact',
    linksTitle: 'Site',
    productsTitle: 'Products',
    mobile: 'Mobile / WhatsApp',
    email: 'Email',
    rights: 'All rights reserved.',
  },
  pages: {
    home: { title: 'Fastener Manufacturer in Mumbai | Screws, Turned Parts & Furniture Fittings', description: `${FIRM_NAME}, Mumbai, since ${FOUNDED}: screws, bolts, nuts, washers, turned and brass parts, and kits for furniture and locks, made to your drawing.` },
    products: { title: 'Products: Screws, Bolts, Nuts, Washers, Brackets & Furniture Fittings', description: `Seven product lines from ${FIRM_NAME}, Mumbai: screws, bolts and nuts, washers, plastic components, brackets and press parts, brass parts, studs and turned parts, furniture fittings and cams. M2 to M14, length 3 to 100 mm.`, crumb: 'Products' },
    category: {
      title: (c) => `${c.name}: ${c.items.slice(0, 3).join(', ')}`,
      description: (c) => `${c.name} from ${FIRM_NAME}, Mumbai: ${c.items.join(', ')}. Made to your drawing; request a quote on WhatsApp.`.slice(0, 300),
    },
    custom: { title: 'Custom Fasteners & Parts Made to Your Drawing', description: `Configure a custom bolt or screw, or send your drawing or sample. ${FIRM_NAME} develops special-purpose parts to your requirement, drawn in AutoCAD 2D & 3D.`, crumb: 'Custom orders' },
    manufacturing: { title: 'Manufacturing: Cold Heading, Slotting & Thread Rolling', description: 'From wire coil to dispatch: cold heading, slotting, thread rolling, heat treatment and plating via approved partners, Go / No-Go inspection, plus turning, drilling, milling, grinding and polishing, in units 24 & 25, Dahisar (East), Mumbai.', crumb: 'Manufacturing' }, // CONFIRM approved partners
    quality: { title: `Quality & Certifications: ${ISO_TEXT}, PPAP, Inspection`, description: `${ISO_TEXT} quality system, first-piece approval and in-process checks every 2 hours, calibrated gauges, HRC testing, full PPAP documents and Lean practices.`, crumb: 'Quality' },
    about: { title: `About Us: Fastener Makers Since ${FOUNDED}`, description: `${FIRM_NAME} has made fasteners and machine components for the lock and furniture industry since ${FOUNDED}. Meet the team, our industries and customers.`, crumb: 'About' },
    gallery: { title: 'Gallery: Parts, Machines & the Works', description: 'Our parts rendered from their drawings, and the cold-heading, thread-rolling and slotting areas of units 24 & 25 in Dahisar (East), Mumbai.', crumb: 'Gallery' },
    contact: { title: 'Contact: Call, WhatsApp or Visit Us in Dahisar (East), Mumbai', description: `Send your requirement on WhatsApp or email, call ${PHONES.mobile.display}, or visit ${ADDRESS_TEXT}.`, crumb: 'Contact' },
    notFound: { title: 'Page not found', description: `This page does not exist. Browse our products or contact ${FIRM_NAME}.`, crumb: 'Not found' },
    home_crumb: 'Home',
    titleSuffix: ` | ${FIRM_NAME}`,
  },
  teasers: {
    products: { label: 'What we make', title: 'Seven product lines.', lead: 'From screws, bolts and nuts to washers, brass parts, and fittings for furniture and locks.', cta: 'All products' },
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
    quoteMsg: (name) => `Hello ${FIRM_NAME}, I would like a quote for ${name}. Part / size / quantity: `,
    call: 'Call',
    custom: 'Need something not listed? We make parts to your drawing.',
    customCta: 'Custom orders',
    related: 'Related product lines',
    view: 'View range',
    imageAlt: (name) => `${name}: rendered example parts`,
    // item grid (phase 12B)
    count: (n) => `${n} ${n === 1 ? 'item' : 'items'}`,
    groups: { screws: 'Screw', bolts: 'Bolt', nuts: 'Nut' },
    groupSummary: (g) => g.map(([label, n]) => `${n} ${label.toLowerCase()}${n === 1 ? '' : 's'}`).join(' · '),
    photoComing: 'Photo coming',
    itemCode: (code, i) => `${code}-${String(i + 1).padStart(2, '0')}`,
    itemAlt: (name) => `${name}: rendered part`,
    photoAlt: (name) => `${name}: photo`,
    notListed: 'Not listed?',
    notListedText: 'We make parts to your drawing or sample.',
    notListedCta: 'Custom orders',
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
    message: `Hello ${FIRM_NAME}, I would like a custom part made to my drawing. Part / size / quantity: `,
  },
  about: {
    label: 'About us',
    title: ['Your trust,', 'our mission.'],
    story: [
      `${FIRM_NAME} was established in ${FOUNDED} to provide fasteners and machine components to the lock and furniture industry.`,
      'Today we manufacture and supply screws, bolts and nuts, washers, plastic components, brackets and press parts, brass parts, studs and precision turned parts, and furniture fittings, from units 24 & 25 in Dahisar (East), Mumbai.',
      'We make kits for furniture and locks, and develop special-purpose products to customer drawings and raw material, drawn in AutoCAD 2D & 3D.',
    ],
    facts: [
      { k: 'Established', v: String(FOUNDED) },
      { k: 'Quality system', v: ISO_TEXT },
      { k: 'Lean', v: LEAN_TEXT.cluster },
      { k: 'Design', v: 'AutoCAD 2D & 3D' },
    ],
    leader: { name: LEADER.name, role: LEADER.title, quote: 'Our mission: high-quality parts for manufacturing industries.' },
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
    general: `Hello ${FIRM_NAME}, I would like to enquire about your products.`,
  },
}

export const locales = { en }
export const content = locales.en
export default content
