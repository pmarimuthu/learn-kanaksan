<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const props = defineProps<{ type: string }>()
const canvas = ref<HTMLCanvasElement | null>(null)

let _animId = 0
let _renderer: any = null
let _controls: any = null

async function boot() {
  const c = canvas.value
  if (!c) return

  const [{ default: THREE }, { OrbitControls }] = await Promise.all([
    import('three'),
    import('three/examples/jsm/controls/OrbitControls.js'),
  ])

  
  function makeSprite(text: string, color = '#e2e8f0', scaleXY = [2.4, 0.8]) {
    const cv = document.createElement('canvas')
    cv.width = 512; cv.height = 128
    const ctx = cv.getContext('2d')!
    ctx.clearRect(0, 0, 512, 128)
    ctx.fillStyle = color
    ctx.font = 'bold 48px system-ui, sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(text, 256, 64)
    const tex = new THREE.CanvasTexture(cv)
    const mat = new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false })
    const sp = new THREE.Sprite(mat)
    sp.scale.set(scaleXY[0], scaleXY[1], 1)
    return sp
  }

  
  const W = c.clientWidth  || 360
  const H = c.clientHeight || 240

  const scene = new THREE.Scene()
  scene.background = new THREE.Color(0x0f172a)

  const camera = new THREE.PerspectiveCamera(52, W / H, 0.1, 100)
  camera.position.set(0, 3, 9)

  _renderer = new THREE.WebGLRenderer({ canvas: c, antialias: true })
  _renderer.setSize(W, H, false)
  _renderer.setPixelRatio(Math.min(devicePixelRatio, 2))

  _controls = new OrbitControls(camera, _renderer.domElement)
  _controls.enableDamping = true
  _controls.dampingFactor = 0.08

  scene.add(new THREE.AmbientLight(0xffffff, 0.5))
  const pt = new THREE.PointLight(0x60a5fa, 2.5, 30)
  pt.position.set(2, 5, 5)
  scene.add(pt)

  
  let extraDraw = () => {}

  if (props.type === 'si-units') {
    camera.position.set(0, 5, 10)
    extraDraw = buildSiUnits(THREE, scene, makeSprite)
  } else if (props.type === 'significant-figures') {
    camera.position.set(0, 1.5, 9)
    extraDraw = buildSigFigs(THREE, scene, makeSprite)
  } else if (props.type === 'dimensions') {
    camera.position.set(5, 4, 6)
    extraDraw = buildDimensions(THREE, scene, makeSprite)
  } else if (props.type === 'dimensional-analysis') {
    camera.position.set(0, 3, 10)
    extraDraw = buildDimAnalysis(THREE, scene, makeSprite)
  }

  camera.lookAt(0, 0, 0)
  _controls.target.set(0, 0, 0)
  _controls.update()

  function loop() {
    _animId = requestAnimationFrame(loop)
    _controls.update()
    extraDraw()
    _renderer.render(scene, camera)
  }
  loop()
}

function buildSiUnits(THREE: any, scene: any, makeSprite: Function) {
  const units = [
    { sym: 'm',   name: 'metre',    hex: 0x3b82f6 },
    { sym: 'kg',  name: 'kilogram', hex: 0xef4444 },
    { sym: 's',   name: 'second',   hex: 0x22c55e },
    { sym: 'A',   name: 'ampere',   hex: 0xeab308 },
    { sym: 'K',   name: 'kelvin',   hex: 0xf97316 },
    { sym: 'mol', name: 'mole',     hex: 0xa855f7 },
    { sym: 'cd',  name: 'candela',  hex: 0x06b6d4 },
  ]

  const ring = new THREE.Group()
  const R = 3.8

  units.forEach((u, i) => {
    const angle = (i / 7) * Math.PI * 2
    const x = Math.cos(angle) * R
    const z = Math.sin(angle) * R

    const geo = new THREE.BoxGeometry(1.15, 1.15, 1.15)
    const mat = new THREE.MeshPhongMaterial({
      color: u.hex, emissive: u.hex, emissiveIntensity: 0.38, shininess: 70,
    })
    const box = new THREE.Mesh(geo, mat)
    box.position.set(x, 0, z)
    ring.add(box)

    const symSp = makeSprite(u.sym, '#ffffff', [1.5, 0.7])
    symSp.position.set(x, 1.2, z)
    ring.add(symSp)

    const nameSp = makeSprite(u.name, '#94a3b8', [2.1, 0.55])
    nameSp.position.set(x, -1.05, z)
    ring.add(nameSp)
  })

  const title = makeSprite('7 SI Base Units · drag to orbit', '#cbd5e1', [4.8, 0.75])
  title.position.set(0, 2.8, 0)
  ring.add(title)

  scene.add(ring)
  return () => { ring.rotation.y += 0.004 }
}

function buildSigFigs(THREE: any, scene: any, makeSprite: Function) {
  // char list; sig=true means significant, sig=null means punctuation
  const chars: { ch: string; sig: boolean | null }[] = [
    { ch: '0', sig: false },
    { ch: '.', sig: null  },
    { ch: '0', sig: false },
    { ch: '0', sig: false },
    { ch: '4', sig: true  },
    { ch: '0', sig: true  },
    { ch: '5', sig: true  },
  ]

  let xi = 0
  chars.forEach(({ ch, sig }) => {
    if (sig === null) {
      // decimal point — tiny sphere
      const dot = new THREE.Mesh(
        new THREE.SphereGeometry(0.14, 10, 10),
        new THREE.MeshPhongMaterial({ color: 0x475569 })
      )
      dot.position.set(xi * 1.18 - 3.6, -0.95, 0)
      scene.add(dot)
      xi++
      return
    }

    const h     = sig ? 3.1 : 0.65
    const col   = sig ? 0x06b6d4 : 0x1e293b
    const emi   = sig ? 0x0284c7 : 0x0f172a
    const geo   = new THREE.BoxGeometry(0.78, h, 0.52)
    const mat   = new THREE.MeshPhongMaterial({ color: col, emissive: emi, emissiveIntensity: sig ? 0.55 : 0.05, shininess: 80 })
    const bar   = new THREE.Mesh(geo, mat)
    bar.position.set(xi * 1.18 - 3.6, h / 2 - 1.15, 0)
    scene.add(bar)

    const sp = makeSprite(ch, sig ? '#22d3ee' : '#334155', [0.85, 0.55])
    sp.position.set(xi * 1.18 - 3.6, h - 0.8, 0)
    scene.add(sp)
    xi++
  })

  const title = makeSprite('0.00405 → 3 Significant Figures', '#e2e8f0', [5.2, 0.78])
  title.position.set(0.2, 2.7, 0)
  scene.add(title)

  const sub = makeSprite('Cyan tall bars = significant  ·  Dark short bars = placeholders', '#64748b', [7.5, 0.6])
  sub.position.set(0.2, -2.5, 0)
  scene.add(sub)

  return () => {}
}

function buildDimensions(THREE: any, scene: any, makeSprite: Function) {
  const L = 3.2

  // M axis — red (x)
  scene.add(new THREE.ArrowHelper(
    new THREE.Vector3(1, 0, 0),
    new THREE.Vector3(-0.05, 0, 0),
    L, 0xef4444, 0.45, 0.22
  ))
  const mSp = makeSprite('M  mass', '#fca5a5', [2.2, 0.65])
  mSp.position.set(3.8, 0.1, 0)
  scene.add(mSp)

  // L axis — blue (y)
  scene.add(new THREE.ArrowHelper(
    new THREE.Vector3(0, 1, 0),
    new THREE.Vector3(0, -0.05, 0),
    L, 0x3b82f6, 0.45, 0.22
  ))
  const lSp = makeSprite('L  length', '#93c5fd', [2.2, 0.65])
  lSp.position.set(0, 3.8, 0)
  scene.add(lSp)

  // T axis — green (z)
  scene.add(new THREE.ArrowHelper(
    new THREE.Vector3(0, 0, 1),
    new THREE.Vector3(0, 0, -0.05),
    L, 0x22c55e, 0.45, 0.22
  ))
  const tSp = makeSprite('T  time', '#86efac', [2.2, 0.65])
  tSp.position.set(0, 0.1, 3.8)
  scene.add(tSp)

  // Origin dot
  scene.add(new THREE.Mesh(
    new THREE.SphereGeometry(0.13, 10, 10),
    new THREE.MeshPhongMaterial({ color: 0xffffff })
  ))

  // Quantities: placed at (M,L,T) exponent positions
  const qs = [
    { label: 'Velocity [LT⁻¹]',  pos: [0.0, 1.8, 1.5], col: 0x60a5fa },
    { label: 'Force [MLT⁻²]',    pos: [1.4, 1.4, 1.2], col: 0xf87171 },
    { label: 'Energy [ML²T⁻²]',  pos: [1.2, 2.5, 1.2], col: 0xfbbf24 },
    { label: 'Pressure [ML⁻¹T⁻²]', pos: [1.2, 0.5, 1.2], col: 0xa78bfa },
  ]

  qs.forEach(q => {
    const [px, py, pz] = q.pos
    const sph = new THREE.Mesh(
      new THREE.SphereGeometry(0.28, 16, 16),
      new THREE.MeshPhongMaterial({ color: q.col, emissive: q.col, emissiveIntensity: 0.45 })
    )
    sph.position.set(px, py, pz)
    scene.add(sph)

    const sp = makeSprite(q.label, '#e2e8f0', [3.8, 0.65])
    sp.position.set(px + 1.8, py + 0.35, pz)
    scene.add(sp)
  })

  return () => {}
}

function buildDimAnalysis(THREE: any, scene: any, makeSprite: Function) {
  // Pivot pole
  scene.add(new THREE.Mesh(
    new THREE.CylinderGeometry(0.1, 0.18, 2.4, 10),
    new THREE.MeshPhongMaterial({ color: 0x475569 })
  ))

  // Beam (green = balanced)
  const beamMat = new THREE.MeshPhongMaterial({ color: 0x065f46, emissive: 0x065f46, emissiveIntensity: 0.45 })
  const beam = new THREE.Mesh(new THREE.BoxGeometry(7.2, 0.18, 0.22), beamMat)
  beam.position.set(0, 1.1, 0)
  scene.add(beam)

  // Hanging strings
  const strCol = new THREE.LineBasicMaterial({ color: 0x94a3b8 })
  for (const x of [-3.3, 3.3]) {
    const pts = [new THREE.Vector3(x, 1.1, 0), new THREE.Vector3(x, -0.18, 0)]
    scene.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), strCol))
  }

  // Pans
  const panMat = new THREE.MeshPhongMaterial({ color: 0x0891b2 })
  for (const x of [-3.3, 3.3]) {
    const pan = new THREE.Mesh(new THREE.CylinderGeometry(0.95, 0.95, 0.1, 20), panMat.clone())
    pan.position.set(x, -0.28, 0)
    scene.add(pan)
  }

  // LHS blocks: M, L, T⁻²
  const cols   = [0xef4444, 0x3b82f6, 0x22c55e]
  const lhsLbl = ['M', 'L', 'T⁻²']
  lhsLbl.forEach((t, i) => {
    const box = new THREE.Mesh(
      new THREE.BoxGeometry(0.62, 0.42, 0.52),
      new THREE.MeshPhongMaterial({ color: cols[i], emissive: cols[i], emissiveIntensity: 0.38 })
    )
    box.position.set(-3.3 + (i - 1) * 0.68, -0.02 + i * 0.44, 0)
    scene.add(box)
    const sp = makeSprite(t, '#f1f5f9', [0.92, 0.54])
    sp.position.set(-3.3 + (i - 1) * 0.68, 0.22 + i * 0.44, 0)
    scene.add(sp)
  })

  // RHS blocks: kg, m, s⁻²
  const rhsLbl = ['kg', 'm', 's⁻²']
  rhsLbl.forEach((t, i) => {
    const box = new THREE.Mesh(
      new THREE.BoxGeometry(0.62, 0.42, 0.52),
      new THREE.MeshPhongMaterial({ color: cols[i], emissive: cols[i], emissiveIntensity: 0.38 })
    )
    box.position.set(3.3 + (i - 1) * 0.68, -0.02 + i * 0.44, 0)
    scene.add(box)
    const sp = makeSprite(t, '#f1f5f9', [0.92, 0.54])
    sp.position.set(3.3 + (i - 1) * 0.68, 0.22 + i * 0.44, 0)
    scene.add(sp)
  })

  // Column headers
  const h1 = makeSprite('[F] = MLT⁻²', '#fca5a5', [3.6, 0.75])
  h1.position.set(-3.3, 2.3, 0)
  scene.add(h1)

  const h2 = makeSprite('kg · m · s⁻²', '#86efac', [3.6, 0.75])
  h2.position.set(3.3, 2.3, 0)
  scene.add(h2)

  const eq = makeSprite('= ✓  balanced!', '#fbbf24', [3.5, 0.78])
  eq.position.set(0, 3.0, 0)
  scene.add(eq)

  // Gentle initial wobble that settles
  let t = 0
  return () => {
    t += 0.018
    const wobble = Math.sin(t) * Math.exp(-t * 0.15) * 0.07
    beam.rotation.z = wobble
  }
}

onMounted(() => boot())
onUnmounted(() => {
  cancelAnimationFrame(_animId)
  _controls?.dispose()
  _renderer?.dispose()
})
</script>

<template>
  <div class="feel-hero">
    <canvas ref="canvas" class="feel-canvas" />
    <p class="feel-hint">Drag to orbit · Scroll to zoom</p>
  </div>
</template>

<style scoped>
.feel-hero {
  position: relative;
  width: 100%;
}
.feel-canvas {
  width: 100%;
  height: 240px;
  display: block;
  border-radius: 8px;
  background: #0f172a;
}
.feel-hint {
  text-align: center;
  font-size: 0.72rem;
  color: var(--vp-c-text-3, #64748b);
  margin: 4px 0 0;
}
</style>
