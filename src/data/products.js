// Product catalogue. Everything here is PLACEHOLDER data, safe to swap later.
// `model` holds the parameters the procedural 3D fastener generator reads (Phase 2+):
//   type: 'bolt' | 'screw' | 'nut' | 'washer' | 'turned' | 'bracket' | 'clip' | 'connector'
//   head: variant key from `variants[type]` below
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

export const heads = {
  // PLACEHOLDER
  hex: 'Hex',
  socket: 'Socket cap',
  pan: 'Pan',
  countersunk: 'Countersunk',
}

/** Variants per part type (the `head` prop of <Fastener />). */
export const variants = {
  bolt: { hex: 'Hex head', socket: 'Socket head', pan: 'Pan head', countersunk: 'Countersunk' },
  nut: { hex: 'Hex nut', nyloc: 'Nyloc', flange: 'Flange nut', wing: 'Wing nut' },
  washer: { flat: 'Flat', spring: 'Spring' },
  screw: { pan: 'Pan head', countersunk: 'Countersunk' },
  bracket: { angle: 'Angle bracket' },
  turned: { stepped: 'Stepped shaft' },
  clip: { tree: 'Tree clip' },
  connector: { cam: 'Cam + connecting bolt' },
}

export const threads = {
  // PLACEHOLDER — ISO metric coarse / fine
  coarse: { label: 'Metric coarse', pitchFactor: 1 },
  fine: { label: 'Metric fine', pitchFactor: 0.75 },
}

export const materials = [
  // PLACEHOLDER
  'Mild steel',
  'High tensile steel (8.8 / 10.9)',
  'Stainless steel SS 304 / 316',
  'Brass',
  'Aluminium',
  'Nylon / PP / ABS',
]

export const sizes = {
  // PLACEHOLDER
  metric: ['M3', 'M4', 'M5', 'M6', 'M8', 'M10', 'M12', 'M16', 'M20'],
  lengths: [6, 8, 10, 12, 16, 20, 25, 30, 40, 50, 60, 80, 100],
}

// The 7 "What we make" cards. `parts` are rendered with the procedural library
// (src/three, detail "low"); `pose.tilt` angles the group in the card, and the spin
// on hover turns it about its own axis. Everything here is PLACEHOLDER copy.
export const categories = [
  {
    slug: 'screws',
    code: '01',
    name: 'Screws',
    blurb: 'Self-tapping, machine and chipboard screws in every common head and drive.', // PLACEHOLDER
    callout: 'ST 4.2 × 25',
    parts: [{ type: 'screw', head: 'pan', diameter: 4.2, length: 25, finish: 'zinc' }],
    pose: { tilt: [0, 0, -1.05] },
    specs: [
      ['Sizes', 'ST 2.9 – 6.3, M3 – M8'],
      ['Heads', 'Pan, countersunk, wafer, hex washer'],
      ['Drives', 'Phillips, Pozi, Torx, slot'],
      ['Points', 'Sharp, drill, blunt'],
    ], // PLACEHOLDER
    materials: ['Case-hardened steel', 'Stainless SS 304', 'Brass'], // PLACEHOLDER
    sizes: ['ST 2.9', 'ST 3.5', 'ST 4.2', 'ST 4.8', 'ST 5.5', 'ST 6.3'], // PLACEHOLDER
    finishes: ['zinc', 'blackOxide', 'yellowZinc', 'stainless'],
  },
  {
    slug: 'nuts-bolts',
    code: '02',
    name: 'Nuts & Bolts',
    blurb: 'Hex and socket bolts with matching hex, nyloc, flange and wing nuts.', // PLACEHOLDER
    callout: 'M10 × 1.5',
    parts: [
      { type: 'bolt', head: 'hex', diameter: 10, length: 30, finish: 'zinc' },
      { type: 'nut', head: 'hex', diameter: 10, finish: 'zinc', position: [0, -1.6, 0], rotation: [0, 0.4, 0] },
    ],
    pose: { tilt: [0, 0, -1.1] },
    specs: [
      ['Sizes', 'M5 – M24'],
      ['Grades', '4.6, 8.8, 10.9 · nut class 6 – 10'],
      ['Lengths', '10 – 150 mm'],
      ['Standards', 'ISO 4014 / 4017 / 4762 / 4032'],
    ], // PLACEHOLDER
    materials: ['Mild steel', 'High tensile steel', 'Stainless SS 304 / 316'], // PLACEHOLDER
    sizes: ['M5', 'M6', 'M8', 'M10', 'M12', 'M16', 'M20', 'M24'], // PLACEHOLDER
    finishes: ['zinc', 'blackOxide', 'yellowZinc', 'stainless'],
  },
  {
    slug: 'washers',
    code: '03',
    name: 'Washers',
    blurb: 'Plain, spring and star washers, stamped flat and true.', // PLACEHOLDER
    callout: 'Ø12 × 2.2',
    parts: [
      { type: 'washer', head: 'flat', diameter: 12, finish: 'stainless', position: [-0.75, 0, 0] },
      { type: 'washer', head: 'spring', diameter: 12, finish: 'blackOxide', position: [1.05, 0.05, 0.2] },
    ],
    pose: { tilt: [0.75, 0, 0] },
    specs: [
      ['Types', 'Plain, spring, star, fender'],
      ['Inner Ø', '3.2 – 25 mm'],
      ['Thickness', '0.5 – 4 mm'],
      ['Standards', 'ISO 7089, DIN 127'],
    ], // PLACEHOLDER
    materials: ['Mild steel', 'Spring steel', 'Stainless', 'Brass'], // PLACEHOLDER
    sizes: ['M3', 'M4', 'M5', 'M6', 'M8', 'M10', 'M12', 'M16'], // PLACEHOLDER
    finishes: ['zinc', 'blackOxide', 'stainless', 'brass'],
  },
  {
    slug: 'turned',
    code: '04',
    name: 'Precision Turned',
    blurb: 'CNC and traub-turned parts held to tight tolerances, made to your drawing.', // PLACEHOLDER
    callout: 'Ø16 h7',
    parts: [{ type: 'turned', diameter: 16, length: 40, finish: 'brass' }],
    pose: { tilt: [0, 0, -1.3] },
    specs: [
      ['Diameters', '2 – 40 mm'],
      ['Tolerance', '± 0.02 mm'],
      ['Operations', 'Turning, grooving, knurling, threading'],
      ['Supply', 'To your drawing or sample'],
    ], // PLACEHOLDER
    materials: ['Brass', 'Free-cutting steel', 'Stainless', 'Aluminium'], // PLACEHOLDER
    sizes: ['Ø2 – Ø10', 'Ø10 – Ø25', 'Ø25 – Ø40'], // PLACEHOLDER
    finishes: ['brass', 'zinc', 'stainless'],
  },
  {
    slug: 'pressed',
    code: '05',
    name: 'Press Components',
    blurb: 'Brackets, clips and stampings from progressive and single-stage tools.', // PLACEHOLDER
    callout: 't 2.0',
    parts: [{ type: 'bracket', diameter: 20, length: 40, finish: 'yellowZinc' }],
    pose: { tilt: [0.35, 0.6, 0] },
    specs: [
      ['Sheet', '0.5 – 4 mm'],
      ['Operations', 'Blank, pierce, form, bend'],
      ['Tooling', 'Progressive & single-stage'],
      ['Batch', 'Prototype to high volume'],
    ], // PLACEHOLDER
    materials: ['CRCA', 'Spring steel', 'Stainless', 'Aluminium'], // PLACEHOLDER
    sizes: ['To drawing'], // PLACEHOLDER
    finishes: ['yellowZinc', 'zinc', 'blackOxide'],
  },
  {
    slug: 'moulded',
    code: '06',
    name: 'Plastic Moulded',
    blurb: 'Injection-moulded clips, caps, inserts and spacers in engineering plastics.', // PLACEHOLDER
    callout: 'Ø6 PA6',
    parts: [{ type: 'clip', diameter: 6, length: 18, finish: 'nylon' }],
    pose: { tilt: [0, 0, -1.2] },
    specs: [
      ['Parts', 'Clips, caps, bushes, spacers'],
      ['Polymers', 'PA6, PA66, PP, ABS, POM'],
      ['Colours', 'Natural, black, to order'],
      ['Tooling', 'In-house mould maintenance'],
    ], // PLACEHOLDER
    materials: ['Nylon PA6 / PA66', 'Polypropylene', 'ABS', 'Acetal (POM)'], // PLACEHOLDER
    sizes: ['To drawing'], // PLACEHOLDER
    finishes: ['nylon', 'nylonBlack'],
  },
  {
    slug: 'furniture',
    code: '07',
    name: 'Furniture Kits',
    blurb: 'Cam locks, connecting bolts, dowels and complete fittings packs for flat-pack kits.', // PLACEHOLDER
    callout: 'Ø15 cam',
    parts: [{ type: 'connector', diameter: 5, finish: 'zinc' }],
    pose: { tilt: [0.5, -0.5, 0] },
    specs: [
      ['Fittings', 'Cam locks, connecting bolts, dowels'],
      ['Cam Ø', '12, 15, 20 mm'],
      ['Packing', 'Counted kit packs, labelled'],
      ['Supply', 'Loose or kitted to BOM'],
    ], // PLACEHOLDER
    materials: ['Zinc alloy', 'Steel', 'Nylon'], // PLACEHOLDER
    sizes: ['Cam 12', 'Cam 15', 'Cam 20'], // PLACEHOLDER
    finishes: ['zinc', 'blackOxide', 'brass'],
  },
]

/** Options for the customisation showcase (visual only). PLACEHOLDER ranges. */
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
export const heroBolt = { type: 'bolt', head: 'hex', diameter: 12, length: 30, pitch: 1.75, finish: 'zinc', grade: '8.8' } // PLACEHOLDER

export default categories
