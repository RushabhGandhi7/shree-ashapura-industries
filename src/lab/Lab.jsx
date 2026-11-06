// /lab — internal inspection stage for the procedural part library.
// Not linked from the site; marked noindex.
import { Suspense, useEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { ContactShadows, Html, OrbitControls } from '@react-three/drei'
import { VertexNormalsHelper } from 'three/examples/jsm/helpers/VertexNormalsHelper.js'
import { Fastener, buildPart } from '../three/Fastener.jsx'
import StudioEnvironment from '../three/StudioEnvironment.jsx'
import { DEFAULTS, metricSizes, pitchFor } from '../three/specs.js'
import { finishes, metalFinishes, variants } from '../data/products.js'

const TYPES = {
  bolt: 'Bolt',
  nut: 'Nut',
  washer: 'Washer',
  screw: 'Screw',
  bracket: 'Press bracket',
  turned: 'Turned part',
  clip: 'Moulded clip',
  connector: 'Furniture connector',
}
const DIAMETERS = {
  bolt: metricSizes,
  nut: metricSizes,
  washer: metricSizes,
  screw: [2.9, 3.5, 4.2, 4.8, 5.5, 6.3],
  bracket: [12, 16, 20, 25, 30],
  turned: [10, 12, 16, 20, 25],
  clip: [4, 5, 6, 8],
  connector: [4, 5, 6],
}
const LENGTHS = { bolt: [6, 100], screw: [10, 60], bracket: [20, 80], turned: [20, 80], clip: [10, 30] }
const FINISH_KEYS = [...metalFinishes, 'yellowZinc', 'mildSteel', 'nylon', 'nylonBlack']

const GALLERY = [
  { type: 'bolt', head: 'hex', finish: 'zinc' },
  { type: 'bolt', head: 'socket', diameter: 10, length: 35, finish: 'blackOxide' },
  { type: 'bolt', head: 'pan', diameter: 6, length: 20, finish: 'stainless' },
  { type: 'bolt', head: 'countersunk', diameter: 8, length: 30, finish: 'redAnodised' },
  { type: 'nut', head: 'hex', finish: 'zinc' },
  { type: 'nut', head: 'nyloc', finish: 'stainless' },
  { type: 'nut', head: 'flange', finish: 'yellowZinc' },
  { type: 'nut', head: 'wing', diameter: 8, finish: 'brass' },
  { type: 'washer', head: 'flat', finish: 'stainless' },
  { type: 'washer', head: 'spring', finish: 'blackOxide' },
  { type: 'screw', head: 'pan', finish: 'zinc' },
  { type: 'screw', head: 'countersunk', diameter: 4.8, length: 30, finish: 'brass' },
  { type: 'bracket', finish: 'yellowZinc' },
  { type: 'turned', finish: 'brass' },
  { type: 'clip', finish: 'nylon' },
  { type: 'connector', finish: 'zinc' },
]

const label = (it) => `${TYPES[it.type]} · ${variants[it.type]?.[it.head ?? DEFAULTS[it.type].head] ?? ''}`

/** Bounds of a part's geometry (all roles). */
function partBounds(params) {
  const { geos } = buildPart(params)
  const box = new THREE.Box3()
  Object.values(geos).forEach((g) => box.union(g.boundingBox))
  return box
}

/* ─────────── 3D bits ─────────── */

function NormalsHelpers({ target, size = 0.04 }) {
  const { scene } = useThree()
  useEffect(() => {
    const helpers = []
    target.current?.traverse((o) => {
      if (o.isMesh) {
        const h = new VertexNormalsHelper(o, size, 0xc8102e)
        scene.add(h)
        helpers.push(h)
      }
    })
    return () => helpers.forEach((h) => (scene.remove(h), h.dispose()))
  })
  return null
}

/** Stands a part on the floor (y = 0), centred in X/Z. */
function Placed({ params, position = [0, 0, 0], onPick, showLabel, wireframe, normals, spin }) {
  const ref = useRef(null)
  const box = useMemo(() => partBounds(params), [params])
  const c = box.getCenter(new THREE.Vector3())
  const s = box.getSize(new THREE.Vector3())
  useFrame((_, dt) => {
    if (spin && ref.current) ref.current.rotation.y += dt * 0.5
  })
  return (
    <group position={position}>
      <group ref={ref}>
        <Fastener
          {...params}
          position={[-c.x, -box.min.y, -c.z]}
          wireframe={wireframe}
          onClick={(e) => {
            e.stopPropagation()
            onPick?.()
          }}
          onPointerOver={() => onPick && (document.body.style.cursor = 'pointer')}
          onPointerOut={() => (document.body.style.cursor = '')}
        />
      </group>
      {normals && <NormalsHelpers target={ref} />}
      {showLabel && (
        <Html position={[0, 0.02, Math.max(s.z, s.x) / 2 + 0.5]} center zIndexRange={[10, 0]} className="pointer-events-none">
          <span className="label-mono whitespace-nowrap rounded-xs border border-steel-300 bg-paper/90 px-1.5 py-0.5 text-[10px] text-steel-700">
            {label(params)}
          </span>
        </Html>
      )}
    </group>
  )
}

function CameraRig({ mode, radius, cy }) {
  const { camera, controls } = useThree()
  useEffect(() => {
    if (mode === 'all') {
      camera.position.set(13, 15, 23)
      controls?.target.set(0, 0.6, 0.6)
    } else {
      const d = Math.max(2.2, radius * 3.2)
      camera.position.set(d * 0.75, cy + d * 0.42, d)
      controls?.target.set(0, cy, 0)
    }
    controls?.update()
  }, [mode, radius, cy, camera, controls])
  return null
}

function Stats({ statsRef }) {
  const { gl } = useThree()
  const last = useRef(0)
  useEffect(() => {
    gl.info.autoReset = false
    return () => (gl.info.autoReset = true)
  }, [gl])
  // useFrame runs before the render, so this reads the previous frame (all passes).
  useFrame((state) => {
    const r = gl.info.render
    if (state.clock.elapsedTime - last.current > 0.5 && statsRef.current) {
      last.current = state.clock.elapsedTime
      statsRef.current.textContent = `frame: ${r.triangles.toLocaleString()} tris · ${r.calls} draw calls (incl. shadow pass)`
    }
    gl.info.reset()
  })
  return null
}

function Stage({ mode, item, setItem, toggles, statsRef }) {
  const box = useMemo(() => partBounds(item), [item])
  const size = box.getSize(new THREE.Vector3())
  const radius = size.length() / 2
  const cy = size.y / 2 // parts stand on the floor, so their centre is half their height
  return (
    <>
      <color attach="background" args={['#dedcd8']} />
      <fog attach="fog" args={['#dedcd8', 28, 70]} />
      <StudioEnvironment />
      <ambientLight intensity={0.25} />
      <directionalLight position={[5, 10, 6]} intensity={0.9} />
      <mesh rotation-x={-Math.PI / 2} position-y={-0.001} receiveShadow>
        <planeGeometry args={[200, 200]} />
        <meshStandardMaterial color="#d8d6d1" roughness={1} metalness={0} />
      </mesh>
      <ContactShadows position-y={0.002} scale={mode === 'all' ? 30 : 12} blur={2.4} far={5} opacity={0.5} resolution={1024} />

      {mode === 'all' ? (
        GALLERY.map((g, i) => {
          const col = i % 4
          const row = Math.floor(i / 4)
          return (
            <Placed
              key={i}
              params={g}
              position={[(col - 1.5) * 3.8 + 2.6, 0, (row - 1.5) * 3.6]}
              showLabel
              wireframe={toggles.wireframe}
              onPick={() => setItem({ ...DEFAULTS[g.type], ...g })}
            />
          )
        })
      ) : (
        <Placed params={item} wireframe={toggles.wireframe} normals={toggles.normals} spin={toggles.spin} />
      )}
      <OrbitControls makeDefault enableDamping dampingFactor={0.08} minDistance={0.6} maxDistance={40} maxPolarAngle={Math.PI * 0.49} />
      <CameraRig mode={mode} radius={radius} cy={cy} />
      <Stats statsRef={statsRef} />
    </>
  )
}

/* ─────────── UI ─────────── */

const Seg = ({ value, options, onChange, ariaLabel }) => (
  <div role="radiogroup" aria-label={ariaLabel} className="flex flex-wrap gap-1">
    {Object.entries(options).map(([k, v]) => (
      <button
        key={k}
        type="button"
        role="radio"
        aria-checked={value === k}
        onClick={() => onChange(k)}
        className={`rounded-xs border px-2 py-1 text-[12px] transition-colors ${
          value === k ? 'border-ink bg-ink text-paper' : 'border-steel-300 bg-paper text-ink hover:border-ink'
        }`}
      >
        {v}
      </button>
    ))}
  </div>
)

const Field = ({ label: l, children, hint }) => (
  <div className="space-y-1.5">
    <div className="flex items-baseline justify-between">
      <span className="label-mono text-steel-500">{l}</span>
      {hint && <span className="font-mono text-[11px] text-ink">{hint}</span>}
    </div>
    {children}
  </div>
)

// Deep links: /lab?type=nut&head=wing&diameter=8&finish=brass&detail=low&normals=1
function fromQuery() {
  const q = new URLSearchParams(window.location.search)
  const type = TYPES[q.get('type')] ? q.get('type') : null
  const num = (k) => (q.has(k) ? Number(q.get(k)) : undefined)
  const item = { ...DEFAULTS[type ?? 'bolt'], type: type ?? 'bolt' }
  if (q.get('head')) item.head = q.get('head')
  if (num('diameter')) item.diameter = num('diameter')
  if (num('length')) item.length = num('length')
  if (q.get('finish') && finishes[q.get('finish')]) item.finish = q.get('finish')
  return {
    mode: type ? 'inspect' : 'all',
    item,
    detail: q.get('detail') === 'low' ? 'low' : 'high',
    toggles: { wireframe: q.get('wireframe') === '1', normals: q.get('normals') === '1', spin: q.get('spin') === '1' },
  }
}

export default function Lab() {
  const initial = useMemo(fromQuery, [])
  const [mode, setMode] = useState(initial.mode)
  const [item, setItemRaw] = useState(initial.item)
  const [fine, setFine] = useState(false)
  const [detail, setDetail] = useState(initial.detail)
  const [toggles, setToggles] = useState(initial.toggles)
  const [open, setOpen] = useState(true)
  const statsRef = useRef(null)

  useEffect(() => {
    document.title = 'Fastener lab · Shree Ashapura'
    const meta = document.createElement('meta')
    meta.name = 'robots'
    meta.content = 'noindex'
    document.head.appendChild(meta)
    return () => meta.remove()
  }, [])

  const setItem = (it) => {
    setItemRaw(it)
    setMode('inspect')
  }
  const set = (patch) => setItemRaw((s) => ({ ...s, ...patch }))
  const setType = (type) => setItemRaw({ ...DEFAULTS[type], type })

  const threaded = ['bolt', 'nut'].includes(item.type)
  const pitch = threaded ? pitchFor(item.diameter, fine) : undefined
  const params = useMemo(() => ({ ...item, pitch: item.pitch ?? pitch, detail }), [item, pitch, detail])
  const info = buildPart(params)
  const lengths = LENGTHS[item.type]

  return (
    <div className="fixed inset-0 bg-[#dedcd8] font-sans text-ink">
      <Canvas
        className="!absolute inset-0"
        dpr={[1, 2]}
        camera={{ fov: 32, near: 0.05, far: 200, position: [9, 10, 15] }}
        gl={{ antialias: true }}
        onPointerMissed={() => (document.body.style.cursor = '')}
      >
        <Suspense fallback={null}>
          <Stage mode={mode} item={params} setItem={setItem} toggles={toggles} statsRef={statsRef} />
        </Suspense>
      </Canvas>

      <aside
        className={`absolute inset-x-0 bottom-0 z-20 max-h-[52svh] overflow-y-auto border-t border-steel-300 bg-paper/95 backdrop-blur-md transition-transform md:inset-y-0 md:right-auto md:max-h-none md:w-[20rem] md:border-t-0 md:border-r ${
          open ? 'translate-y-0' : 'translate-y-[calc(100%-3rem)] md:translate-y-0'
        }`}
        aria-label="Lab controls"
      >
        <div className="sticky top-0 z-10 flex h-12 items-center justify-between border-b border-steel-300 bg-paper/95 px-4">
          <div>
            <p className="font-display text-[15px] font-[760] [font-stretch:118%]">Fastener lab</p>
          </div>
          <button type="button" className="label-mono text-steel-700 md:hidden" onClick={() => setOpen((o) => !o)} aria-expanded={open}>
            {open ? 'Hide' : 'Controls'}
          </button>
        </div>

        <div className="space-y-5 p-4">
          <Seg ariaLabel="View" value={mode} options={{ all: 'All parts', inspect: 'Inspect' }} onChange={setMode} />

          {mode === 'all' ? (
            <p className="text-[13px] leading-relaxed text-steel-700">
              Every procedural part on one stage. Click a part to inspect it. Drag to orbit, scroll to zoom.
            </p>
          ) : (
            <>
              <Field label="Part">
                <select
                  value={item.type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full rounded-xs border border-steel-300 bg-paper px-2 py-1.5 text-[13px]"
                >
                  {Object.entries(TYPES).map(([k, v]) => (
                    <option key={k} value={k}>
                      {v}
                    </option>
                  ))}
                </select>
              </Field>

              {Object.keys(variants[item.type]).length > 1 && (
                <Field label="Variant">
                  <Seg ariaLabel="Variant" value={item.head} options={variants[item.type]} onChange={(head) => set({ head })} />
                </Field>
              )}

              <Field label={item.type === 'bracket' ? 'Width' : 'Diameter'} hint={`${item.diameter} mm`}>
                <Seg
                  ariaLabel="Diameter"
                  value={String(item.diameter)}
                  options={Object.fromEntries(DIAMETERS[item.type].map((d) => [String(d), threaded || item.type === 'washer' ? `M${d}` : d]))}
                  onChange={(v) => set({ diameter: Number(v) })}
                />
              </Field>

              {lengths && (
                <Field label="Length" hint={`${item.length} mm`}>
                  <input
                    type="range"
                    min={lengths[0]}
                    max={lengths[1]}
                    step={1}
                    value={item.length}
                    onChange={(e) => set({ length: Number(e.target.value) })}
                    className="w-full accent-[var(--color-red)]"
                    aria-label="Length"
                  />
                </Field>
              )}

              {threaded && (
                <Field label="Thread" hint={`P ${pitch} mm`}>
                  <Seg ariaLabel="Thread" value={fine ? 'fine' : 'coarse'} options={{ coarse: 'Coarse', fine: 'Fine' }} onChange={(v) => setFine(v === 'fine')} />
                </Field>
              )}

              <Field label="Finish" hint={finishes[item.finish]?.label}>
                <div className="flex flex-wrap gap-1.5">
                  {FINISH_KEYS.map((f) => (
                    <button
                      key={f}
                      type="button"
                      title={finishes[f].label}
                      aria-label={finishes[f].label}
                      aria-pressed={item.finish === f}
                      onClick={() => set({ finish: f })}
                      className={`size-7 rounded-full border-2 transition-transform ${item.finish === f ? 'scale-110 border-ink' : 'border-paper shadow-[0_0_0_1px_var(--color-steel-300)]'}`}
                      style={{ background: `radial-gradient(circle at 35% 30%, #fff 0%, ${finishes[f].color} 45%, ${finishes[f].color} 100%)` }}
                    />
                  ))}
                </div>
              </Field>

              <Field label="Inspect">
                <div className="flex flex-wrap gap-1">
                  {[
                    ['spin', 'Auto-rotate'],
                    ['wireframe', 'Wireframe'],
                    ['normals', 'Normals'],
                  ].map(([k, v]) => (
                    <button
                      key={k}
                      type="button"
                      aria-pressed={toggles[k]}
                      onClick={() => setToggles((t) => ({ ...t, [k]: !t[k] }))}
                      className={`rounded-xs border px-2 py-1 text-[12px] ${toggles[k] ? 'border-red bg-red text-paper' : 'border-steel-300 bg-paper hover:border-ink'}`}
                    >
                      {v}
                    </button>
                  ))}
                </div>
              </Field>
            </>
          )}

          <Field label="Detail">
            <Seg ariaLabel="Detail" value={detail} options={{ high: 'High (desktop)', low: 'Low (mobile)' }} onChange={setDetail} />
          </Field>

          <div className="space-y-1 border-t border-steel-300 pt-4 font-mono text-[11px] text-steel-700">
            {mode === 'inspect' && (
              <p>
                part: {Math.round(info.tris).toLocaleString()} tris · built in {info.ms.toFixed(1)} ms
              </p>
            )}
            <p ref={statsRef}>…</p>
          </div>
        </div>
      </aside>
    </div>
  )
}
