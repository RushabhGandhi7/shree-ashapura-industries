// Blueprint line drawings for catalogue items without a 3D model (phase 12B). One small SVG
// per shape family (`drawing` in catalogueItems, content.js): fine ink outlines, a centre
// line, thread hatching, and one red dimension line. Light theme tokens only; no catalogue
// imagery. viewBox 160 × 120 (4:3, like every card).
const INK = 'var(--color-ink)'
const STEEL = 'var(--color-steel-500)'
const RED = 'var(--color-red)'

const P = (props) => <path fill="none" stroke={INK} strokeWidth="1.3" strokeLinejoin="round" strokeLinecap="round" {...props} />
const Thin = (props) => <path fill="none" stroke={STEEL} strokeWidth="0.8" {...props} />
const C = ({ cx, cy, r, thin }) => <circle cx={cx} cy={cy} r={r} fill="none" stroke={thin ? STEEL : INK} strokeWidth={thin ? 0.8 : 1.3} />
const Axis = ({ x0, x1, y }) => <path d={`M${x0} ${y}H${x1}`} stroke={STEEL} strokeWidth="0.7" strokeDasharray="8 3 1.5 3" />
const AxisV = ({ y0, y1, x }) => <path d={`M${x} ${y0}V${y1}`} stroke={STEEL} strokeWidth="0.7" strokeDasharray="8 3 1.5 3" />

/** Thread hatching between x0 and x1 on a shank of half-height r around cy. */
function Thread({ x0, x1, cy, r, step = 4 }) {
  const n = Math.max(1, Math.floor((x1 - x0) / step))
  let d = ''
  for (let i = 0; i < n; i++) d += `M${x0 + i * step + 1.5} ${cy - r}L${x0 + i * step - 0.5} ${cy + r}`
  return <Thin d={d} />
}

/** Red dimension line with end ticks (horizontal at y, from x0 to x1). */
function Dim({ x0, x1, y }) {
  return <path d={`M${x0} ${y}H${x1}M${x0} ${y - 4}v8M${x1} ${y - 4}v8`} stroke={RED} strokeWidth="1" fill="none" />
}

/* Side views run left to right, centred on y = 56; the dimension line sits at y = 96. */
const SHAPES = {
  screw: () => (
    <>
      <P d="M30 42q-4 14 0 28h12V42Z" />
      <P d="M42 50h76l10 6-10 6H42" />
      <Thread x0={46} x1={118} cy={56} r={6} />
      <Axis x0={22} x1={136} y={56} />
      <Dim x0={42} x1={128} y={96} />
    </>
  ),
  hexScrew: () => (
    <>
      <P d="M28 40h14v32H28Z" />
      <P d="M28 48h14M28 64h14" />
      <P d="M42 50h76l8 6-8 6H42" />
      <Thread x0={46} x1={118} cy={56} r={6} />
      <Axis x0={20} x1={136} y={56} />
      <Dim x0={42} x1={126} y={96} />
    </>
  ),
  slottedScrew: () => (
    <>
      <P d="M30 42q-4 14 0 28h12V42Z" />
      <path d="M27 53h10v6H27Z" fill="var(--color-steel-100)" stroke={INK} strokeWidth="1" />
      <P d="M42 50h76l10 6-10 6H42" />
      <Thread x0={46} x1={118} cy={56} r={6} />
      <Axis x0={22} x1={136} y={56} />
      <Dim x0={42} x1={128} y={96} />
    </>
  ),
  machineScrew: () => (
    <>
      <P d="M30 42q-4 14 0 28h12V42Z" />
      <P d="M42 50h80l3 3v6l-3 3H42" />
      <Thread x0={46} x1={122} cy={56} r={6} step={3} />
      <Axis x0={22} x1={134} y={56} />
      <Dim x0={42} x1={125} y={96} />
    </>
  ),
  splScrew: () => (
    <>
      <P d="M26 38h8v36h-8Z" />
      <P d="M34 44h10v24H34" />
      <P d="M44 50h40" />
      <P d="M44 62h40" />
      <P d="M84 47h8v18h-8" />
      <P d="M92 51h28l6 5-6 5H92" />
      <Thread x0={94} x1={120} cy={56} r={5} />
      <Axis x0={20} x1={134} y={56} />
      <Dim x0={34} x1={126} y={96} />
    </>
  ),
  cskScrew: () => (
    <>
      <P d="M30 38v36l16-12V50Z" />
      <P d="M46 50h72l10 6-10 6H46" />
      <Thread x0={50} x1={118} cy={56} r={6} />
      <Axis x0={22} x1={136} y={56} />
      <Dim x0={30} x1={128} y={96} />
    </>
  ),
  tappingScrew: () => (
    <>
      <P d="M30 42q-4 14 0 28h12V42Z" />
      <P d="M42 50h66l20 6-20 6H42" />
      <Thread x0={46} x1={110} cy={56} r={6} step={6} />
      <Axis x0={22} x1={136} y={56} />
      <Dim x0={42} x1={128} y={96} />
    </>
  ),
  weldScrew: () => (
    <>
      <P d="M28 38h14v36H28Z" />
      <P d="M28 42l-4-2M28 70l-4 2M28 56h-4" />
      <P d="M42 50h76l8 6-8 6H42" />
      <Thread x0={46} x1={118} cy={56} r={6} />
      <Axis x0={20} x1={134} y={56} />
      <Dim x0={42} x1={126} y={96} />
    </>
  ),
  stepScrew: () => (
    <>
      <P d="M26 42h12v28H26Z" />
      <P d="M38 46h34v20H38" />
      <P d="M72 50h46l8 6-8 6H72" />
      <Thread x0={76} x1={118} cy={56} r={6} />
      <Axis x0={20} x1={134} y={56} />
      <Dim x0={38} x1={72} y={88} />
      <Dim x0={72} x1={126} y={100} />
    </>
  ),
  bolt: () => (
    <>
      <P d="M26 40h16v32H26Z" />
      <P d="M26 48h16M26 64h16" />
      <P d="M42 49h80l6 7-6 7H42" />
      <Thread x0={78} x1={122} cy={56} r={7} />
      <Axis x0={18} x1={136} y={56} />
      <Dim x0={42} x1={128} y={96} />
    </>
  ),
  flangeBolt: () => (
    <>
      <P d="M28 42h14v28H28Z" />
      <P d="M28 50h14M28 62h14" />
      <P d="M42 36v40h4V36Z" />
      <P d="M46 50h74l8 6-8 6H46" />
      <Thread x0={74} x1={120} cy={56} r={6} />
      <Axis x0={20} x1={136} y={56} />
      <Dim x0={46} x1={128} y={96} />
    </>
  ),
  nutBolt: () => (
    <>
      <P d="M20 42h12v28H20Z" />
      <P d="M32 50h86l8 6-8 6H32" />
      <Thread x0={70} x1={118} cy={56} r={6} />
      <P d="M88 40h14v32H88Z" />
      <P d="M88 48h14M88 64h14" />
      <Axis x0={14} x1={134} y={56} />
      <Dim x0={32} x1={126} y={96} />
    </>
  ),
  set: () => (
    <>
      <P d="M18 30h10v20H18ZM28 36h44l6 4-6 4H28" />
      <Thread x0={46} x1={72} cy={40} r={4} />
      <path d="M92 26l10 6v12l-10 6-10-6V32Z" fill="none" stroke={INK} strokeWidth="1.3" strokeLinejoin="round" />
      <C cx={92} cy={38} r={5} />
      <C cx={126} cy={38} r={12} />
      <C cx={126} cy={38} r={5} />
      <P d="M18 66h10v20H18ZM28 72h50l6 4-6 4H28" />
      <Thread x0={50} x1={78} cy={76} r={4} />
      <rect x="98" y="64" width="44" height="24" rx="2" fill="none" stroke={STEEL} strokeWidth="0.8" strokeDasharray="3 2" />
      <Dim x0={18} x1={142} y={104} />
    </>
  ),
  nut: () => (
    <>
      <path d="M80 22l30 17v34l-30 17-30-17V39Z" fill="none" stroke={INK} strokeWidth="1.3" strokeLinejoin="round" />
      <C cx={80} cy={56} r={22} thin />
      <C cx={80} cy={56} r={13} />
      <C cx={80} cy={56} r={11} thin />
      <Axis x0={40} x1={120} y={56} />
      <AxisV y0={16} y1={96} x={80} />
      <Dim x0={50} x1={110} y={104} />
    </>
  ),
  thinNut: () => (
    <>
      <path d="M58 34l22 13v26l-22 13-22-13V47Z" fill="none" stroke={INK} strokeWidth="1.3" strokeLinejoin="round" />
      <C cx={58} cy={60} r={10} />
      <P d="M104 38h30v44h-30Z" />
      <P d="M104 52h30M104 68h30" />
      <Thin d="M104 60h30" />
      <Dim x0={104} x1={134} y={100} />
    </>
  ),
  castleNut: () => (
    <>
      <P d="M40 70V50h80v20Z" />
      <P d="M44 50V30h12v20M64 50V30h12v20M84 50V30h12v20M104 50V30h12v20" />
      <P d="M40 70v12h80V70" />
      <Thin d="M80 24v66" />
      <Dim x0={40} x1={120} y={100} />
    </>
  ),
  washer: () => (
    <>
      <C cx={80} cy={54} r={34} />
      <C cx={80} cy={54} r={14} />
      <Axis x0={38} x1={122} y={54} />
      <AxisV y0={14} y1={94} x={80} />
      <Dim x0={46} x1={114} y={104} />
    </>
  ),
  circlip: () => (
    <>
      <path d="M66 26a32 32 0 1 0 28 0" fill="none" stroke={INK} strokeWidth="1.3" />
      <path d="M72 30a26 26 0 1 0 16 0" fill="none" stroke={INK} strokeWidth="1.3" />
      <P d="M66 26l-2-8h10l-2 10M94 26l2-8h-10l2 10" />
      <C cx={69} cy={22} r={2} />
      <C cx={91} cy={22} r={2} />
      <Dim x0={48} x1={112} y={104} />
    </>
  ),
  starWasher: () => {
    let d = ''
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2
      const b = ((i + 0.5) / 12) * Math.PI * 2
      d += `${i ? 'L' : 'M'}${80 + 34 * Math.cos(a)} ${54 + 34 * Math.sin(a)}L${80 + 27 * Math.cos(b)} ${54 + 27 * Math.sin(b)}`
    }
    return (
      <>
        <P d={d + 'Z'} />
        <C cx={80} cy={54} r={14} />
        <Axis x0={38} x1={122} y={54} />
        <Dim x0={46} x1={114} y={104} />
      </>
    )
  },
  ring: () => (
    <>
      <C cx={58} cy={54} r={26} />
      <C cx={58} cy={54} r={16} />
      <P d="M106 28h28v52h-28Z" />
      <Thin d="M106 38h28M106 70h28" />
      <Dim x0={32} x1={84} y={100} />
    </>
  ),
  disc: () => (
    <>
      <C cx={58} cy={54} r={28} />
      <C cx={58} cy={54} r={4} thin />
      <P d="M104 26h12v56h-12Z" />
      <Dim x0={30} x1={86} y={100} />
    </>
  ),
  cap: () => (
    <>
      <P d="M40 40h80v10q0 8-8 8H48q-8 0-8-8Z" />
      <P d="M48 58v26h64V58" />
      <Thin d="M48 66h64M48 74h64" />
      <AxisV y0={30} y1={92} x={80} />
      <Dim x0={40} x1={120} y={104} />
    </>
  ),
  rectCap: () => (
    <>
      <rect x="30" y="32" width="100" height="46" rx="4" fill="none" stroke={INK} strokeWidth="1.3" />
      <rect x="38" y="40" width="84" height="30" rx="2" fill="none" stroke={STEEL} strokeWidth="0.8" />
      <P d="M46 40v30M58 40v30M102 40v30M114 40v30" />
      <Dim x0={30} x1={130} y={98} />
    </>
  ),
  squareCap: () => (
    <>
      <rect x="44" y="20" width="72" height="72" rx="4" fill="none" stroke={INK} strokeWidth="1.3" />
      <rect x="52" y="28" width="56" height="56" rx="2" fill="none" stroke={STEEL} strokeWidth="0.8" />
      <P d="M64 28v56M96 28v56" />
      <Dim x0={44} x1={116} y={106} />
    </>
  ),
  moulded: () => (
    <>
      <P d="M36 74V46q0-10 10-10h30l8 10h30q10 0 10 10v18q0 6-6 6H42q-6 0-6-6Z" />
      <C cx={58} cy={60} r={7} />
      <C cx={104} cy={60} r={5} />
      <Thin d="M76 36v44" />
      <Dim x0={36} x1={124} y={98} />
    </>
  ),
  plate2: () => (
    <>
      <rect x="28" y="36" width="104" height="40" rx="10" fill="none" stroke={INK} strokeWidth="1.3" />
      <C cx={50} cy={56} r={7} />
      <C cx={110} cy={56} r={7} />
      <Axis x0={20} x1={140} y={56} />
      <Dim x0={50} x1={110} y={96} />
    </>
  ),
  leveller: () => (
    <>
      <P d="M76 18h8v42h-8Z" />
      <Thin d="M76 26h8M76 32h8M76 38h8M76 44h8M76 50h8" />
      <P d="M68 60h24v8H68Z" />
      <P d="M44 82q0-14 16-14h40q16 0 16 14Z" />
      <Dim x0={44} x1={116} y={100} />
    </>
  ),
  glide: () => (
    <>
      <P d="M70 20h20v14H70Z" />
      <P d="M77 34h6v30h-6Z" />
      <Thin d="M77 40h6M77 46h6M77 52h6M77 58h6" />
      <P d="M40 84q0-20 40-20t40 20Z" />
      <Thin d="M48 84h64" />
      <Dim x0={40} x1={120} y={102} />
    </>
  ),
  bush: () => (
    <>
      <P d="M36 36h88v40H36Z" />
      <Thin d="M36 46h88M36 66h88" />
      <path d="M36 46h88v20H36Z" fill="var(--color-steel-100)" stroke="none" />
      <P d="M36 46h88M36 66h88" />
      <Axis x0={28} x1={132} y={56} />
      <Dim x0={36} x1={124} y={96} />
    </>
  ),
  camWheel: () => (
    <>
      <path d="M80 18a36 36 0 1 1-30 16l12 8a22 22 0 1 0 18-10Z" fill="none" stroke={INK} strokeWidth="1.3" strokeLinejoin="round" />
      <C cx={80} cy={54} r={8} />
      <Axis x0={38} x1={122} y={54} />
      <Dim x0={44} x1={116} y={104} />
    </>
  ),
  plate: () => (
    <>
      <rect x="22" y="34" width="116" height="44" rx="3" fill="none" stroke={INK} strokeWidth="1.3" />
      {[40, 66, 94, 120].map((x) => (
        <C key={x} cx={x} cy={56} r={5} />
      ))}
      <Axis x0={16} x1={144} y={56} />
      <Dim x0={40} x1={120} y={96} />
    </>
  ),
  lBracket: () => (
    <>
      <P d="M40 20h12v52h68v12H40Z" />
      <C cx={46} cy={36} r={3} />
      <C cx={100} cy={78} r={3} />
      <Dim x0={40} x1={120} y={100} />
    </>
  ),
  cBracket: () => (
    <>
      <P d="M40 22h80v10H50v48h70v10H40Z" />
      <C cx={45} cy={56} r={3} />
      <Dim x0={40} x1={120} y={104} />
    </>
  ),
  tPlate: () => (
    <>
      <P d="M24 22h112v22H92v54H68V44H24Z" />
      <C cx={36} cy={33} r={4} />
      <C cx={124} cy={33} r={4} />
      <C cx={80} cy={60} r={4} />
      <C cx={80} cy={84} r={4} />
      <Dim x0={24} x1={136} y={108} />
    </>
  ),
  corner: () => (
    <>
      <P d="M36 20h18v48h48v18H36Z" />
      <P d="M54 68l-10 10" />
      <C cx={45} cy={34} r={4} />
      <C cx={45} cy={54} r={4} />
      <C cx={74} cy={77} r={4} />
      <C cx={94} cy={77} r={4} />
      <Dim x0={36} x1={102} y={104} />
    </>
  ),
  uClamp: () => (
    <>
      <P d="M44 24v36a36 36 0 0 0 72 0V24" />
      <P d="M56 24v36a24 24 0 0 0 48 0V24" />
      <P d="M32 24h24M104 24h24" />
      <Dim x0={44} x1={116} y={108} />
    </>
  ),
  press: () => (
    <>
      <P d="M26 70l16-30h76l16 30Z" />
      <P d="M42 40v-8h76v8" />
      <C cx={58} cy={56} r={5} />
      <C cx={102} cy={56} r={5} />
      <rect x="72" y="50" width="16" height="12" rx="2" fill="none" stroke={INK} strokeWidth="1.3" />
      <Dim x0={26} x1={134} y={96} />
    </>
  ),
  nozzle: () => (
    <>
      <P d="M26 44h40v24H26Z" />
      <Thread x0={28} x1={64} cy={56} r={12} />
      <P d="M66 40h14v32H66Z" />
      <P d="M66 48h14M66 64h14" />
      <P d="M80 48h24l26 4v8l-26 4H80" />
      <Axis x0={20} x1={140} y={56} />
      <Dim x0={26} x1={130} y={96} />
    </>
  ),
  pin: () => (
    <>
      <P d="M28 49h96q8 0 8 7t-8 7H28q-4 0-4-7t4-7Z" />
      <Thin d="M56 49v14M100 49v14" />
      <Axis x0={18} x1={142} y={56} />
      <Dim x0={24} x1={132} y={96} />
    </>
  ),
  dowelPin: () => (
    <>
      <P d="M32 48h96q4 0 4 8t-4 8H32q-4 0-4-8t4-8Z" />
      <Axis x0={20} x1={140} y={56} />
      <Dim x0={28} x1={132} y={96} />
    </>
  ),
  woodDowel: () => (
    <>
      <P d="M30 46h100q4 0 4 10t-4 10H30q-4 0-4-10t4-10Z" />
      <Thin d="M40 46l-4 20M52 46l-4 20M64 46l-4 20M76 46l-4 20M88 46l-4 20M100 46l-4 20M112 46l-4 20M124 46l-4 20" />
      <Axis x0={18} x1={142} y={56} />
      <Dim x0={26} x1={134} y={96} />
    </>
  ),
  cross: () => (
    <>
      <P d="M68 20h24v24h24v24H92v24H68V68H44V44h24Z" />
      <C cx={80} cy={56} r={8} />
      <Thin d="M80 20v-4M80 92v4M44 56h-4M116 56h4" />
      <Dim x0={44} x1={116} y={108} />
    </>
  ),
  stud: () => (
    <>
      <P d="M22 50h116l4 6-4 6H22l-4-6Z" />
      <Thread x0={24} x1={62} cy={56} r={6} />
      <Thread x0={98} x1={138} cy={56} r={6} />
      <Axis x0={12} x1={148} y={56} />
      <Dim x0={18} x1={142} y={96} />
    </>
  ),
  rod: () => (
    <>
      <P d="M22 46h40v20H22Z" />
      <P d="M62 42h30v28H62Z" />
      <P d="M62 50h30M62 62h30" />
      <P d="M92 46h44v20H92Z" />
      <Thin d="M92 46l44 20M92 66l44-20" />
      <Axis x0={14} x1={146} y={56} />
      <Dim x0={22} x1={136} y={96} />
    </>
  ),
  camLock: () => (
    <>
      <C cx={56} cy={54} r={26} />
      <P d="M46 54h20M56 44v20" />
      <P d="M98 50h26v8H98ZM124 46h10v16h-10Z" />
      <C cx={129} cy={54} r={2} />
      <P d="M98 50l-4 4 4 4" />
      <Dim x0={30} x1={82} y={100} />
    </>
  ),
  handle: () => (
    <>
      <P d="M24 70V50q0-8 8-8h96q8 0 8 8v20" />
      <P d="M34 70V54h92v16" />
      <P d="M18 70h22M120 70h22" />
      <Dim x0={29} x1={131} y={96} />
    </>
  ),
  bedHandle: () => (
    <>
      <P d="M30 72q0-40 50-40t50 40" />
      <P d="M40 72q0-30 40-30t40 30" />
      <P d="M22 72h26M112 72h26" />
      <Dim x0={35} x1={125} y={98} />
    </>
  ),
  insert: () => (
    <>
      <P d="M44 36h72v40H44Z" />
      <Thin d="M50 36v40M58 36v40M66 36v40M74 36v40M82 36v40M90 36v40M98 36v40M106 36v40" />
      <P d="M44 46h72M44 66h72" />
      <Axis x0={36} x1={124} y={56} />
      <Dim x0={44} x1={116} y={96} />
    </>
  ),
  connector: () => (
    <>
      <P d="M22 48h40v16H22Z" />
      <C cx={30} cy={56} r={3} />
      <P d="M62 52h30v8H62Z" />
      <P d="M92 50h40l6 6-6 6H92" />
      <Thread x0={96} x1={132} cy={56} r={6} step={6} />
      <Axis x0={14} x1={146} y={56} />
      <Dim x0={22} x1={138} y={96} />
    </>
  ),
  slide: () => (
    <>
      <P d="M22 46h116v20H22Z" />
      <P d="M30 50h100v12H30Z" />
      <rect x="62" y="38" width="36" height="36" rx="4" fill="none" stroke={INK} strokeWidth="1.3" />
      <C cx={36} cy={56} r={2.5} />
      <C cx={124} cy={56} r={2.5} />
      <Dim x0={22} x1={138} y={96} />
    </>
  ),
  cup: () => (
    <>
      <P d="M44 30h72v8h-8v40q0 6-6 6H58q-6 0-6-6V38h-8Z" />
      <Thin d="M60 38v40M100 38v40" />
      <AxisV y0={22} y1={92} x={80} />
      <Dim x0={44} x1={116} y={104} />
    </>
  ),
  camHousing: () => (
    <>
      <C cx={60} cy={56} r={30} />
      <C cx={60} cy={56} r={20} thin />
      <P d="M50 56h20M60 46v20" />
      <P d="M90 48h44v16H90" />
      <Dim x0={30} x1={90} y={100} />
    </>
  ),
  kit: () => (
    <>
      <rect x="18" y="22" width="124" height="70" rx="3" fill="none" stroke={INK} strokeWidth="1.3" />
      <Thin d="M18 46h124M60 22v70M102 22v70" />
      <C cx={39} cy={34} r={6} />
      <P d="M70 34h24M74 30v8" />
      <C cx={122} cy={34} r={6} />
      <C cx={122} cy={34} r={2.5} />
      <P d="M28 68h20M24 64v8" />
      <path d="M81 60l8 5v9l-8 5-8-5v-9Z" fill="none" stroke={INK} strokeWidth="1.3" />
      <P d="M112 62h20v12h-20Z" />
      <Dim x0={18} x1={142} y={106} />
    </>
  ),
}

/** Every family key, for the data check script. */
export const DRAWING_KEYS = Object.keys(SHAPES)

/**
 * @param kind   drawing family (catalogueItems[].drawing)
 * @param label  mono drawing label, e.g. "DWG 01-14"
 */
export default function ItemDrawing({ kind, label, className = '' }) {
  const Shape = SHAPES[kind] ?? SHAPES.moulded
  return (
    <svg viewBox="0 0 160 120" className={className} role="presentation" aria-hidden>
      <Shape />
      {label && (
        <text x="4" y="117" className="font-mono" fontSize="6.5" letterSpacing="0.6" fill={STEEL}>
          {label}
        </text>
      )}
    </svg>
  )
}
