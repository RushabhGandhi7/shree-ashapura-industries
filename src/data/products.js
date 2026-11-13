// Product catalogue: real categories and lists from the client's catalogue
// (client-assets/CLIENT_FACTS.md), plus the parameters the procedural 3D library reads:
//   type: see `variants` below (bolt, screw, nut, washer, bracket, insert, axle, ...)
//   head: variant key from `variants[type]`
//   diameter / length / pitch in mm, finish: key of `finishes`.

import { CUSTOMER_NAMES, itemsOf } from './content.js'

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

/** Washers are never brass: zinc, steel (bright mild steel / stainless) or black oxide only. */
export const washerFinishes = ['zinc', 'mildSteel', 'stainless', 'blackOxide']
/** The finish a part is actually drawn in: a washer outside `washerFinishes` falls back to zinc. */
export const finishFor = (type, finish) => (type === 'washer' && !washerFinishes.includes(finish) ? 'zinc' : finish)

/** The five finishes offered for metal parts (customiser, lab). */
export const metalFinishes = ['zinc', 'blackOxide', 'brass', 'stainless', 'redAnodised']

/** Variants per part type (the `head` prop of <Fastener />). */
export const variants = {
  bolt: { hex: 'Hex head', socket: 'Socket head', pan: 'Pan head', countersunk: 'Countersunk', flange: 'Hex flange', carriage: 'Carriage' },
  nut: { hex: 'Hex nut', nyloc: 'Nyloc', flange: 'Flange nut', wing: 'Wing nut', dome: 'Dome nut' },
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
  insert: { threaded: 'Threaded insert', knurled: 'Knurled brass bush' },
  axle: { knurled: 'Axle / rod, double-side knurl' },
  taperPin: { plain: 'Taper pin' },
  plug: { finned: 'Tube end plug' },
}

// The 7 "What we make" cards. Item lists from the client's new catalogue (phase 11, client-assets/CLIENT_FACTS.md).
// `items` (names) is derived from `catalogueItems` in content.js (the full catalogue, phase 12B);
// `materials` / `notes` are the client's own lists.
// `parts` are rendered with the procedural library (src/three, detail "low"); `pose.tilt`
// angles the group in the card and the hover spin turns it about its own axis.
// `image` is rendered from /lab by `npm run render:products` (never a catalogue photo).
export const categories = [
  {
    slug: 'screws-fasteners',
    code: '01',
    name: 'Screws, Bolts & Nuts',
    blurb: 'Hex, Phillips, chipboard and special screws; nut, step, carriage and flange bolts; dome, nyloc and flange nuts.',
    callout: 'CSK · PHHD',
    parts: [
      { type: 'screw', head: 'cskPhillips', diameter: 4.2, length: 30, finish: 'zinc', position: [-0.6, 0, 0] },
      { type: 'screw', head: 'combiWasher', diameter: 5, length: 16, finish: 'zinc', position: [0.7, 0.9, 0] },
    ],
    pose: { tilt: [0, 0, -1.05] },
    materials: [],
    notes: ['Special sizes made to your drawing.'],
  },
  {
    slug: 'washers',
    code: '02',
    name: 'Washers',
    blurb: 'Plain, spring and lock washers, and circlips.',
    callout: 'Ø12',
    parts: [
      { type: 'washer', head: 'flat', diameter: 12, finish: 'zinc', position: [-1.2, 0, 0.2] },
      { type: 'washer', head: 'spring', diameter: 12, finish: 'blackOxide', position: [0.35, 0.05, -0.5] },
      { type: 'washer', head: 'star', diameter: 12, finish: 'zinc', position: [1.15, 0, 0.75] },
    ],
    pose: { tilt: [0.75, 0, 0] },
    materials: [],
    notes: [],
  },
  {
    slug: 'plastic-components',
    code: '03',
    name: 'Plastic Components',
    blurb: 'Caps and legs, levellers, adjustable glide bases and moulded plastic parts, in the colour you need.',
    callout: 'M8 stud',
    parts: [{ type: 'leveller', diameter: 8, length: 28, finish: 'zinc' }],
    pose: { tilt: [0.35, 0, 0] },
    materials: ['PP', 'LD', 'ABS', 'HD-Nylon', 'EPDM'], // CONFIRM EPDM
    notes: ['Colour as required.'],
  },
  {
    slug: 'brackets-press-parts',
    code: '04',
    name: 'Brackets & Press Parts',
    blurb: 'L and C brackets and press parts from sheet.',
    callout: 'L · T',
    parts: [
      { type: 'bracket', head: 'angle', diameter: 20, length: 40, finish: 'zinc', position: [-2.2, 0, 0] },
      { type: 'bracket', head: 'T', diameter: 14, length: 50, finish: 'zinc', position: [2.0, 0.2, 0.5], rotation: [0, 0.4, 0] },
    ],
    pose: { tilt: [0.35, 0.5, 0] },
    materials: [],
    notes: [],
  },
  {
    slug: 'brass-parts',
    code: '05',
    name: 'Brass Parts',
    blurb: 'Brass nozzles, pins and turned brass parts, made to the size you need.',
    callout: 'Ø6 knurl',
    parts: [{ type: 'insert', head: 'knurled', diameter: 6, length: 14, finish: 'brass' }], // the knurled brass turned bush only
    pose: { tilt: [0.55, 0, 0.3] },
    materials: ['Brass'],
    notes: ['Size as required.'],
  },
  {
    slug: 'studs-pins-turned',
    code: '06',
    name: 'Studs, Pins & Turned Parts',
    blurb: 'Studs, taper and cotter pins, knurled axles and machine parts.',
    callout: 'M10 stud',
    parts: [
      { type: 'stud', diameter: 10, length: 60, finish: 'zinc', position: [-1.5, 0, 0] },
      { type: 'cotterPin', diameter: 3, length: 28, finish: 'zinc', position: [0, 1.6, 0] },
      { type: 'axle', head: 'knurled', diameter: 8, length: 50, finish: 'mildSteel', position: [1.5, -0.4, 0] },
    ],
    pose: { tilt: [0, 0, -0.35] },
    materials: [],
    notes: ['Made to your drawing or sample.'],
  },
  {
    slug: 'furniture-fittings',
    code: '07',
    name: 'Furniture Fittings & Cams',
    blurb: 'Cams, door and bed handles, and lock components.',
    callout: 'Ø15 cam',
    parts: [
      { type: 'cam', diameter: 5, finish: 'zinc', position: [-0.75, 0, 0] },
      { type: 'insert', head: 'threaded', diameter: 6, length: 13, finish: 'zinc', position: [0.85, 0.3, 0] },
    ],
    pose: { tilt: [0.5, -0.5, 0] },
    materials: [],
    notes: [],
  },
].map((c) => ({ ...c, image: `/products/${c.slug}.webp`, items: itemsOf(c.slug).map((i) => i.name) }))

/**
 * Real procedural 3D for the priority catalogue items (phase 12B), keyed by `model` in
 * `catalogueItems` (content.js). Same shape as a category card: `parts` + `pose.tilt`.
 * Rendered in the category page's single shared canvas; posters from `npm run render:products`
 * (public/products/items/<key>.webp).
 */
export const itemModels = {
  hexBolt: { parts: [{ type: 'bolt', head: 'hex', diameter: 10, length: 40, finish: 'zinc' }], pose: { tilt: [0, 0, -0.9] } },
  carriageBolt: { parts: [{ type: 'bolt', head: 'carriage', diameter: 8, length: 40, finish: 'zinc' }], pose: { tilt: [0, 0, -0.9] } },
  flangeBolt: { parts: [{ type: 'bolt', head: 'flange', diameter: 8, length: 30, finish: 'zinc' }], pose: { tilt: [0, 0, -0.9] } },
  panScrew: { parts: [{ type: 'screw', head: 'pan', diameter: 5, length: 20, finish: 'zinc' }], pose: { tilt: [0, 0, -0.9] } },
  chipboardScrew: { parts: [{ type: 'screw', head: 'cskPhillips', diameter: 4.2, length: 40, finish: 'yellowZinc' }], pose: { tilt: [0, 0, -0.9] } },
  hexNut: { parts: [{ type: 'nut', head: 'hex', diameter: 10, finish: 'zinc' }], pose: { tilt: [0.7, 0, 0] } },
  nylocNut: { parts: [{ type: 'nut', head: 'nyloc', diameter: 10, finish: 'stainless' }], pose: { tilt: [0.7, 0, 0] } },
  flangeNut: { parts: [{ type: 'nut', head: 'flange', diameter: 10, finish: 'zinc' }], pose: { tilt: [0.7, 0, 0] } },
  domeNut: { parts: [{ type: 'nut', head: 'dome', diameter: 10, finish: 'zinc' }], pose: { tilt: [0.5, 0, 0] } },
  plainWasher: { parts: [{ type: 'washer', head: 'flat', diameter: 12, finish: 'zinc' }], pose: { tilt: [0.8, 0, 0] } },
  springWasher: { parts: [{ type: 'washer', head: 'spring', diameter: 12, finish: 'blackOxide' }], pose: { tilt: [0.8, 0, 0] } },
  taperPin: { parts: [{ type: 'taperPin', diameter: 6, length: 40, finish: 'mildSteel' }], pose: { tilt: [0, 0, -0.9] } },
  cotterPin: { parts: [{ type: 'cotterPin', diameter: 3, length: 30, finish: 'zinc' }], pose: { tilt: [0, 0, -0.9] } },
  lBracket: { parts: [{ type: 'bracket', head: 'angle', diameter: 20, length: 40, finish: 'zinc' }], pose: { tilt: [0.35, 0.5, 0] } },
  knurledAxle: { parts: [{ type: 'axle', head: 'knurled', diameter: 8, length: 50, finish: 'mildSteel' }], pose: { tilt: [0, 0, -0.9] } },
  brassBush: { parts: [{ type: 'insert', head: 'knurled', diameter: 6, length: 14, finish: 'brass' }], pose: { tilt: [0.55, 0, 0.3] } },
  cam: { parts: [{ type: 'cam', diameter: 5, finish: 'zinc' }], pose: { tilt: [0.6, -0.4, 0] } },
  levellerBolt: { parts: [{ type: 'leveller', diameter: 8, length: 28, finish: 'zinc' }], pose: { tilt: [0.35, 0, 0] } },
  plasticPlug: { parts: [{ type: 'plug', diameter: 25, length: 18, finish: 'nylonBlack' }], pose: { tilt: [0.5, 0, 0] } },
}

/** Customers (approved for the site; shown when SHOW_CUSTOMERS in content.js). Names: CUSTOMER_NAMES in content.js (// CONFIRM list and logo files). Set `logo: '/brand/customers/<file>.svg'` when files arrive. */
const customerLogos = {}
export const customers = CUSTOMER_NAMES.map((name) => ({ name, logo: customerLogos[name] ?? null }))

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
    // finishes per material: src/data/materialFinishes.js
    { key: 'ms46', label: 'Mild steel 4.6', short: 'MS 4.6' },
    { key: 'ht88', label: 'High tensile 8.8', short: 'HT 8.8' },
    { key: 'ht109', label: 'High tensile 10.9', short: 'HT 10.9' },
    { key: 'a2', label: 'Stainless A2-70 (304)', short: 'A2-70' },
    { key: 'a4', label: 'Stainless A4-80 (316)', short: 'A4-80' },
    { key: 'brass', label: 'Brass CZ121', short: 'BRASS' },
  ],
  defaults: { head: 'hex', diameter: 8, length: 40, fine: false, material: 'ht88', finish: 'zinc' },
}

export default categories
