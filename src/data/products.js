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

export const categories = [
  {
    slug: 'screws',
    name: 'Screws',
    code: '01',
    blurb: 'Machine, self-tapping and furniture screws in every common head and drive.', // PLACEHOLDER
    callout: 'M5 × 0.8',
    specs: ['M3 – M12', 'Pan / CSK / Button', 'Zinc · Black · SS'], // PLACEHOLDER
    model: { type: 'screw', head: 'pan', diameter: 5, length: 30, pitch: 0.8, finish: 'zinc' },
  },
  {
    slug: 'bolts',
    name: 'Bolts',
    code: '02',
    blurb: 'Hex and socket bolts, fully or partly threaded, in standard and high-tensile grades.', // PLACEHOLDER
    callout: 'M8 × 1.25',
    specs: ['M6 – M20', 'Grade 4.6 – 10.9', 'L 16 – 150'], // PLACEHOLDER
    model: { type: 'bolt', head: 'hex', diameter: 8, length: 40, pitch: 1.25, finish: 'zinc' },
  },
  {
    slug: 'nuts',
    name: 'Nuts',
    code: '03',
    blurb: 'Hex, nyloc, flange, dome and insert nuts, made to match every bolt we make.', // PLACEHOLDER
    callout: 'M10 × 1.5',
    specs: ['M3 – M24', 'Hex / Nyloc / Flange', 'Class 6 – 10'], // PLACEHOLDER
    model: { type: 'nut', head: 'hex', diameter: 10, length: 8, pitch: 1.5, finish: 'blackOxide' },
  },
  {
    slug: 'washers',
    name: 'Washers',
    code: '04',
    blurb: 'Plain, spring and star washers stamped flat and true.', // PLACEHOLDER
    callout: 'Ø12 × 1.6',
    specs: ['Ø3 – Ø30', 'Plain / Spring / Star', 'MS · SS · Brass'], // PLACEHOLDER
    model: { type: 'washer', head: 'flat', diameter: 12, length: 1.6, pitch: 0, finish: 'stainless' },
  },
  {
    slug: 'turned',
    name: 'Precision Turned Components',
    code: '05',
    blurb: 'CNC and traub-turned parts held to tight tolerances, made to your drawing.', // PLACEHOLDER
    callout: 'Ø16 h7',
    specs: ['± 0.02 mm', 'Brass · MS · SS · Al', 'To drawing'], // PLACEHOLDER
    model: { type: 'turned', head: 'stepped', diameter: 16, length: 32, pitch: 1, finish: 'brass' },
  },
  {
    slug: 'pressed',
    name: 'Press Components',
    code: '06',
    blurb: 'Brackets, clips and stampings from progressive and single-stage tools.', // PLACEHOLDER
    callout: 't 2.0',
    specs: ['0.5 – 4 mm sheet', 'Blank / Pierce / Form', 'Plated or raw'], // PLACEHOLDER
    model: { type: 'bracket', head: 'angle', diameter: 20, length: 40, pitch: 0, finish: 'yellowZinc' },
  },
  {
    slug: 'moulded-furniture',
    name: 'Plastic Moulded & Furniture Kit Specials',
    code: '07',
    blurb: 'Moulded caps, inserts and connectors, plus complete fittings packs for furniture kits.', // PLACEHOLDER
    callout: 'Ø10 PA6',
    specs: ['Nylon · PP · ABS', 'Cam locks · Dowels', 'Kit packing'], // PLACEHOLDER
    model: { type: 'clip', head: 'tree', diameter: 10, length: 20, pitch: 0, finish: 'nylon' },
  },
]

/** The bolt that threads into the plate in the hero. */
export const heroBolt = { type: 'bolt', head: 'hex', diameter: 12, length: 30, pitch: 1.75, finish: 'zinc', grade: '8.8' } // PLACEHOLDER

export default categories
