// Product catalogue: real categories and lists from the client's catalogue
// (client-assets/CLIENT_FACTS.md), plus the parameters the procedural 3D library reads:
//   type: see `variants` below (bolt, screw, nut, washer, bracket, insert, castor, ...)
//   head: variant key from `variants[type]`
//   diameter / length / pitch in mm, finish: key of `finishes`.

// Surface finishes. Colours / PBR values are read by src/three/materials.js.
// `aniso` = strength of the brushed/turned highlight; `clearcoat` / `iridescence` are optional extras.
export const finishes = {
  zinc: { label: 'Zinc plated', color: '#D9DCDE', metalness: 1, roughness: 0.24, aniso: 0.35 },
  blackOxide: { label: 'Black oxide', color: '#2E2F31', metalness: 0.85, roughness: 0.42, aniso: 0.25 },
  brass: { label: 'Brass', color: '#D8B26A', metalness: 1, roughness: 0.26, aniso: 0.4 },
  stainless: { label: 'Stainless steel', color: '#C6C7C4', metalness: 1, roughness: 0.17, aniso: 0.45 },
  redAnodised: { label: 'Red anodised', color: '#A3202F', metalness: 0.55, roughness: 0.3, aniso: 0.2, clearcoat: 0.45 },
  yellowZinc: { label: 'Yellow zinc', color: '#DCC47E', metalness: 0.92, roughness: 0.3, aniso: 0.3, iridescence: 0.35 },
  mildSteel: { label: 'Bright mild steel', color: '#C4C6C7', metalness: 0.92, roughness: 0.36, aniso: 0.5 },
  nylon: { label: 'Nylon (natural)', color: '#EEE8D9', metalness: 0, roughness: 0.55 },
  nylonBlack: { label: 'Nylon (black)', color: '#2A2A2B', metalness: 0, roughness: 0.6 },
}

/** The five finishes offered for metal parts (customiser, lab). */
export const metalFinishes = ['zinc', 'blackOxide', 'brass', 'stainless', 'redAnodised']

/** Variants per part type (the `head` prop of <Fastener />). */
export const variants = {
  bolt: { hex: 'Hex head', socket: 'Socket head', pan: 'Pan head', countersunk: 'Countersunk' },
  nut: { hex: 'Hex nut', nyloc: 'Nyloc', flange: 'Flange nut', wing: 'Wing nut' },
  washer: { flat: 'Plain', spring: 'Spring', star: 'Star', circlip: 'Circlip', cap: 'Cap' },
  screw: {
    pan: 'Pan head',
    countersunk: 'Countersunk',
    cskPhillips: 'CSK Phillips chipboard',
    phhd: 'PHHD chipboard',
    combi: 'Combi head',
    combiWasher: 'Phillips combi washer',
    umbrella: 'Umbrella head',
    button: 'Allen button head',
    allenFlat: 'Allen flat head',
  },
  bracket: { angle: 'L bracket', door: 'Door bracket', T: 'T bracket', square: 'Square plate', hook: 'Hook' },
  turned: { stepped: 'Stepped shaft' },
  clip: { tree: 'Tree clip' },
  connector: { cam: 'Cam + connecting bolt' },
  cam: { cam: 'Cam lock' },
  rivet: { round: 'Round head rivet' },
  maleFemale: { button: 'Male-female screw' },
  stud: { collar: 'Stud with hex collar' },
  cotterPin: { split: 'Cotter pin' },
  leveller: { hex: 'Leveller' },
  insert: { threaded: 'Threaded insert', knurled: 'Knurled insert', pin: 'Brass pin', bush: 'Ferrule / bush' },
  castor: { plate: 'Plate castor', stem: 'Threaded-stem castor' },
}

// The 8 "What we make" cards, from the client's catalogue (client-assets/CLIENT_FACTS.md).
// `items` / `materials` / `notes` are the client's own lists (shown in the drawer).
// `parts` are rendered with the procedural library (src/three, detail "low"); `pose.tilt`
// angles the group in the card and the hover spin turns it about its own axis.
// `image` is rendered from /lab by `npm run render:products` (never a catalogue photo).
export const categories = [
  {
    slug: 'screws-fasteners',
    code: '01',
    name: 'Screws & Fasteners',
    blurb: 'Chipboard, Allen, combi, machine and self-tapping screws, rivets, nuts and high-tensile items.',
    callout: 'CSK · PHHD',
    parts: [
      { type: 'screw', head: 'cskPhillips', diameter: 4.2, length: 30, finish: 'zinc', position: [-0.6, 0, 0] },
      { type: 'screw', head: 'combiWasher', diameter: 5, length: 16, finish: 'zinc', position: [0.7, 0.9, 0] },
    ],
    pose: { tilt: [0, 0, -1.05] },
    items: [
      'CSK Phillips chipboard screw',
      'PHHD chipboard screw',
      'Allen flat head screw',
      'Allen button head screw',
      'Combi head screw',
      'Phillips combi washer screw',
      'Male-female screw',
      'Rivet',
      'Pan head slotted screw',
      'Hex head screw',
      'Hex nut',
      'Wood screw',
      'Self-tapping screw',
      'Machine screw',
      'Hex flange head screw',
      'Locking screw',
      'Umbrella screw',
      'High-tensile items',
    ],
    materials: [],
    notes: ['Special sizes made to your drawing.'],
  },
  {
    slug: 'washers',
    code: '02',
    name: 'Washers',
    blurb: 'Plain, spring, circlip, star and cap washers.',
    callout: 'Ø12',
    parts: [
      { type: 'washer', head: 'flat', diameter: 12, finish: 'zinc', position: [-1.2, 0, 0.2] },
      { type: 'washer', head: 'spring', diameter: 12, finish: 'blackOxide', position: [0.35, 0.05, -0.5] },
      { type: 'washer', head: 'star', diameter: 12, finish: 'zinc', position: [1.15, 0, 0.75] },
    ],
    pose: { tilt: [0.75, 0, 0] },
    items: ['Plain washer', 'Spring washer', 'Circlip', 'Star washer', 'Cap washer'],
    materials: [],
    notes: [],
  },
  {
    slug: 'plastic-components',
    code: '03',
    name: 'Plastic Components',
    blurb: 'Levellers, leg tube caps and male-female parts, moulded in the colour you need.',
    callout: 'M8 stud',
    parts: [{ type: 'leveller', diameter: 8, length: 28, finish: 'zinc' }],
    pose: { tilt: [0.35, 0, 0] },
    items: ['Leveller', 'Leg tube cap', 'Male-female parts'],
    materials: ['PP', 'LD', 'ABS', 'HD-Nylon', 'EPDM'], // CONFIRM EPDM
    notes: ['Colour as required.'],
  },
  {
    slug: 'brackets-press-parts',
    code: '04',
    name: 'Brackets & Press Parts',
    blurb: 'L, T, door, square and hook brackets pressed from sheet.',
    callout: 'L · T',
    parts: [
      { type: 'bracket', head: 'angle', diameter: 20, length: 40, finish: 'zinc', position: [-2.2, 0, 0] },
      { type: 'bracket', head: 'T', diameter: 14, length: 50, finish: 'zinc', position: [2.0, 0.2, 0.5], rotation: [0, 0.4, 0] },
    ],
    pose: { tilt: [0.35, 0.5, 0] },
    items: ['L bracket', 'Door bracket', 'T bracket', 'Square bracket', 'Hook'],
    materials: [],
    notes: [],
  },
  {
    slug: 'brass-parts',
    code: '05',
    name: 'Brass Parts',
    blurb: 'Brass pins and knurled inserts, turned to the size you need.',
    callout: 'Ø6 knurl',
    parts: [
      { type: 'insert', head: 'knurled', diameter: 6, length: 12, finish: 'brass', position: [-0.6, 0, 0] },
      { type: 'insert', head: 'pin', diameter: 5, length: 30, finish: 'brass', position: [0.7, 0, 0] },
    ],
    pose: { tilt: [0, 0, -0.5] },
    items: ['Brass pins', 'Knurled inserts'],
    materials: ['Brass'],
    notes: ['Size as required.'],
  },
  {
    slug: 'studs-pins-turned',
    code: '06',
    name: 'Studs, Pins & Turned Parts',
    blurb: 'Studs, cotter pins, machine parts and precision turned parts.',
    callout: 'M10 stud',
    parts: [
      { type: 'stud', diameter: 10, length: 60, finish: 'zinc', position: [-1.5, 0, 0] },
      { type: 'cotterPin', diameter: 3, length: 28, finish: 'zinc', position: [0, 1.6, 0] },
      { type: 'turned', diameter: 14, length: 34, finish: 'brass', position: [1.4, -0.2, 0] },
    ],
    pose: { tilt: [0, 0, -0.35] },
    items: ['Stud', 'Cotter pin', 'Machine parts', 'Precision turned parts'],
    materials: [],
    notes: ['Made to your drawing or sample.'],
  },
  {
    slug: 'castors',
    code: '07',
    name: 'Castors',
    blurb: 'Plate castors with wheel and threaded-stem castors.',
    callout: 'Ø50 wheel',
    parts: [{ type: 'castor', head: 'plate', diameter: 50, finish: 'zinc' }],
    pose: { tilt: [0.25, 0.6, 0] },
    items: ['Plate castor with wheel', 'Threaded-stem castor'],
    materials: [],
    notes: [],
  },
  {
    slug: 'furniture-fittings',
    code: '08',
    name: 'Furniture Fittings & Cams',
    blurb: 'Cams, cam locks, threaded inserts, ferrules and complete furniture fitting kits.',
    callout: 'Ø15 cam',
    parts: [
      { type: 'cam', diameter: 5, finish: 'zinc', position: [-0.75, 0, 0] },
      { type: 'insert', head: 'threaded', diameter: 6, length: 13, finish: 'zinc', position: [0.85, 0.3, 0] },
    ],
    pose: { tilt: [0.5, -0.5, 0] },
    items: ['Cam', 'Furniture fitting kits', 'Cam lock', 'Threaded insert', 'Ferrule / bush', 'Locks'],
    materials: [],
    notes: [],
  },
].map((c) => ({ ...c, image: `/products/${c.slug}.webp` }))

/** Customers named in the catalogue (approved for the site; shown when SHOW_CUSTOMERS in content.js). Add `logo: '/brand/customers/<file>.svg'` when files arrive. */
export const customers = [
  { name: 'Godrej Interio', logo: null },
  { name: 'IFB', logo: null },
  { name: 'Elica', logo: null },
  { name: 'Crompton Greaves', logo: null },
  { name: 'Belden', logo: null },
  { name: 'SmartLink', logo: null },
  { name: 'Saakshi', logo: null },
  { name: 'CA.BE Springs & Fasteners', logo: null },
]

/** Options for the customisation showcase (visual only). // CONFIRM: illustrative heads, sizes, grades and finishes, not supplied by the client. */
export const customiser = {
  heads: [
    { key: 'hex', label: 'Hex head', part: 'Hex head bolt', std: 'ISO 4014 / 4017', code: 'HX' },
    { key: 'socket', label: 'Socket cap', part: 'Socket head cap screw', std: 'ISO 4762', code: 'SC' },
    { key: 'pan', label: 'Pan head', part: 'Pan head machine screw', std: 'ISO 7045', code: 'PN' },
    { key: 'countersunk', label: 'Countersunk', part: 'Countersunk socket screw', std: 'ISO 10642', code: 'CS' },
  ],
  sizes: [5, 6, 8, 10, 12, 16],
  lengthRange: (d) => [Math.max(10, Math.ceil((d * 1.5) / 5) * 5), Math.min(100, Math.ceil((d * 8) / 5) * 5)],
  lengthStep: 5,
  materials: [
    { key: 'ms46', label: 'Mild steel 4.6', short: 'MS 4.6', finishes: ['zinc', 'blackOxide', 'redAnodised'] },
    { key: 'ht88', label: 'High tensile 8.8', short: 'HT 8.8', finishes: ['zinc', 'blackOxide', 'redAnodised'] },
    { key: 'ht109', label: 'High tensile 10.9', short: 'HT 10.9', finishes: ['blackOxide', 'zinc'] },
    { key: 'a2', label: 'Stainless A2-70 (304)', short: 'A2-70', finishes: ['stainless'] },
    { key: 'a4', label: 'Stainless A4-80 (316)', short: 'A4-80', finishes: ['stainless'] },
    { key: 'brass', label: 'Brass CZ121', short: 'BRASS', finishes: ['brass'] },
  ],
  finishCodes: { zinc: 'ZN', blackOxide: 'BO', brass: 'BR', stainless: 'SS', redAnodised: 'RA' },
  defaults: { head: 'hex', diameter: 8, length: 40, fine: false, material: 'ht88', finish: 'zinc' },
}

/** The bolt that threads into the plate in the hero. */
export const heroBolt = { type: 'bolt', head: 'hex', diameter: 12, length: 30, pitch: 1.75, finish: 'zinc' } // visual only

export default categories
