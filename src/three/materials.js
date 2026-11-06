import { finishes } from '../data/products.js'

/** meshStandardMaterial props for a finish key from products.js. */
export function finishProps(key = 'zinc') {
  const f = finishes[key] ?? finishes.zinc
  return { color: f.color, metalness: f.metalness, roughness: f.roughness, envMapIntensity: 1.1 }
}

export const plateProps = { color: '#B9BBBC', metalness: 0.85, roughness: 0.42, envMapIntensity: 0.9 }
export const boreProps = { color: '#7C7E81', metalness: 0.9, roughness: 0.5, envMapIntensity: 0.7 }
