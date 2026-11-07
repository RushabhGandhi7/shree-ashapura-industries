// Finishes offered per material in the /custom configurator. The swatch row, the spec
// readout, the DWG NO. code and the WhatsApp message all read from here, so a finish that
// is not offered for a material can never be shown or sent.
// Keys are the render finishes in products.js `finishes` (colour / metalness for the 3D).

/** Labels and DWG codes as offered to customers. */
export const customFinishes = {
  zinc: { label: 'Zinc plated', code: 'ZN' },
  blackOxide: { label: 'Black oxide', code: 'BO' },
  redAnodised: { label: 'Red', code: 'RD' },
  stainless: { label: 'Natural stainless', code: 'SS' },
  brass: { label: 'Natural brass', code: 'BR' },
}

/** Material key (customiser.materials) -> allowed finishes, first = default. */
export const finishesByMaterial = {
  ms46: ['zinc', 'blackOxide', 'redAnodised'],
  ht88: ['zinc', 'blackOxide', 'redAnodised'], // CONFIRM with client
  ht109: ['zinc', 'blackOxide', 'redAnodised'], // CONFIRM with client
  a2: ['stainless'],
  a4: ['stainless'],
  brass: ['brass'], // CONFIRM with client
}

export const allowedFinishes = (material) => finishesByMaterial[material] ?? ['zinc']

/** The finish to use for a material: the requested one if offered, otherwise the first offered. */
export const resolveFinish = (material, finish) => {
  const list = allowedFinishes(material)
  return list.includes(finish) ? finish : list[0]
}
